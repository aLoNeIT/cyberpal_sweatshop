# Pi-Agent SaaS · 技术调研笔记

> 版本：v2.0 | 日期：2026-07-20
> 对应架构文档 v3.0（Hyperf 3.2 + Swoole 6 + PHP 8.2 / ng-alain 21.x）

---

## 1. 现有 Demo 技术底座

| 项 | 详情 |
|------|------|
| 后端框架 | Hyperf 3.1（PHP 8.1，Swoole 协程）→ 升级为 **Hyperf 3.2 + Swoole 6 + PHP 8.2** |
| Pi 调度 | `proc_open` 启动 `pi --mode rpc --session-dir --name --provider --model`，stdin/stdout JSONL |
| 会话池 | `PiSessionPool`：sessionId → Pi 进程映射，空闲 600s 回收，Swoole Channel 协程锁 |
| 模型配置 | `pi-config/models.json`：provider=openai，api=openai-responses，baseUrl=https://token.alonetech.com |

---

## 2. pi CLI 关键能力

| 能力 | 参数 |
|------|------|
| 技能 | `--skill <path>`（可多次）、`--no-skills` |
| 工具权限 | `--tools` 白名单、`--exclude-tools` 黑名单 |
| 会话管理 | `--session-dir`、`--session`、`--continue`、`--resume`、`--fork` |
| 模型/思考 | `--provider`、`--model`、`--thinking`、`--system-prompt`、`--append-system-prompt` |
| 运行模式 | `--mode rpc`（JSONL，headless 嵌入） |

---

## 3. pi-agent 引擎 + 插件栈评估

> 2026-07-21 引擎选型由 oh-my-pi(omp) 切换为**官方 pi-agent（pi-agent-core / pi-coding-agent）+ 社区插件栈**。omp 为 Pi 的 fork，能力与 Pi 同源，但内置 32 个编码工具对通用调度平台是负担；pi-agent-core 仅含 4 原语 + 统一 LLM API，进阶能力按需由插件补齐。

| 能力 | 组件 | 来源 | SaaS 映射 |
|------|------|------|-----------|
| agent 内核 / 循环 | pi-agent-core | 官方 | 任务执行引擎 |
| 多 Provider | pi-ai | 官方 | 模型路由（25+ 厂商，跨供应商 handoff） |
| Skills | Agent Skills 标准 | 官方 | 领域知识包（闭环 A） |
| 权限网关 | @gotgenes/pi-permission-system | 社区（成熟） | 统一权限策略（闭环 B） |
| 硬隔离沙箱 | Gondolin / Docker / OpenShell | 官方 containerization | workspace 隔离（闭环 C） |
| MCP 桥 | pi-mcp-adapter / pi-mcp-bridge | 社区 | MCP 配置（闭环 A） |
| 子代理 | @gotgenes/pi-subagents | 社区 | 多 Agent 编排 |
| Session 文件 | `--session-dir` + `--session` + `--resume` | 官方 | 续聊/分叉（磁盘+MySQL 双重映射） |
| <strong>网关层架构</strong> | 独立 pi-gateway，Service → Session → Agent 三级隔离 | 见 [06-pi-agent-gateway-design.md](./06-pi-agent-gateway-design.md) |

### 选型结论
- 内核：官方 pi-agent-core（pi-coding-agent CLI，`--mode rpc`）
- JSONL/NDJSON 协议与现有 `pi` demo 向后兼容（demo 底座本就是 `pi --mode rpc`）
- Skill：`--skill` 磁盘路径注入；索引存 MySQL → 磁盘路径由 `sk_path` 指到 `runtime/skills/`（亦可作 npm 包分发）
- MCP：MySQL 存配置条目 → 生成磁盘 `.pi/mcp.json` → pi-mcp-adapter / pi-mcp-bridge cwd 发现（原 `.omp/mcp.json` 改为 `.pi/mcp.json`）
- 权限：平台按租户生成 `permission.config.json` → 挂载到 `~/.pi/agent/extensions/pi-permission-system/config.json`（非交互模式必须预置，无 UI 确认）
- Session：pi 原生 session 文件存磁盘（resume/fork 需要） → `cs_session.s_pi_session_id` 建立映射

---

## 4. pi-agent 文件数据存储策略

pi-agent 运行时需要大量文件读写，数据存储需区分 MySQL 和磁盘：

| 数据类型 | MySQL | 磁盘 | 原因 |
|----------|-------|------|------|
| 用户/Agent/会话元数据 | ✅ | — | 结构化查询、列表筛选 |
| 消息文本 | ✅ | — | 历史回看、分页 |
| 结构化事件(tool/usage) | ✅ | — | 用量聚合、审计 |
| 计费记录 | ✅ | — | 统计分析 |
| Skill 索引(name/path) | ✅ | — | 浏览搜索 |
| Skill 文件本体 | — | ✅ `runtime/skills/` | pi `--skill` 需要磁盘路径 |
| MCP 配置条目 | ✅ | — | CRUD 管理 |
| MCP 注入文件(.pi/mcp.json) | — | ✅ `runtime/tenants/{uid}/agents/{aid}/.pi/` | pi-mcp-adapter cwd 自动发现 |
| pi Session 文件 | — | ✅ `runtime/pi-sessions/{aid}/` | resume/fork 依赖 |
| workspace 工作目录 | — | ✅ `runtime/tenants/{uid}/agents/{aid}/workspace/` | pi cwd，文件边界 |
| 归档产物 | — | ✅ `runtime/archive/{sid}/` | 导出落盘 |

> 映射关系：`cs_session.s_pi_session_id` ↔ `runtime/pi-sessions/{aid}/{pi_session_id}`；`cs_skill.sk_path` ↔ `runtime/skills/{name}`

---

## 5. 关键缺口

### 5.A MCP 注入
- pi CLI 本身无原生 MCP 管理，由 `pi-mcp-adapter` / `pi-mcp-bridge` 插件桥接；配置发现路径为 `.pi/mcp.json`
- SaaS 为每个 Agent 生成注入 → 从 `cs_mcp_config` 生成磁盘文件
- **待实测**：发现路径、pi 二进制名、`--profile` 影响

### 5.B Token 计费
- 当前 demo 未采集 usage；provider 原生支持但需验证 OMP 透传
- 兜底：字符数/4 估算 → 直连 provider
- **待实测**：usage 字段路径、cache 透传、provider 接口

### 5.C 工作目录隔离
- pi-agent 基于文件系统，多租户需隔离 workspace
- 首版：独立目录 + `--profile` + Gondolin/Docker 沙箱；**待实测**：cwd 逃逸风险

---

## 6. 待实测清单（5 项）

| 编号 | 事项 | 影响闭环 |
|------|------|----------|
| 1 | pi 二进制名 + `--profile`/`.pi` 位置 | A |
| 2 | `.pi/mcp.json` 发现路径（cwd 向上 vs `$HOME/.pi`） | A |
| 3 | RPC 事件 `usage` 字段路径 + cache 透传 | B |
| 4 | `token.alonetech.com` 用量查询接口 | B |
| 5 | pi cwd 逃逸风险 + Gondolin 沙箱验证 | C |
| 6 | 非交互模式（`--mode rpc`）下 permission-system 预置策略是否 fail-closed 生效 | B |
