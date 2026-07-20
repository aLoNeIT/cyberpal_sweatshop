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

## 3. oh-my-pi（OMP）能力评估

| 能力 | 说明 | SaaS 映射 |
|------|------|-----------|
| 内置多 Agent | 6 预设 + 自定义 YAML | Agent 创建/配置 |
| 原生 MCP 管理 | `/mcp`、`.omp/mcp.json` | MCP 配置（闭环A） |
| Profiles | `--profile` 配置隔离 | 多租户隔离 |
| 文件操作 | read/write/edit/bash（cwd 为边界） | workspace 隔离（闭环C） |
| Session 文件 | `--session-dir` + `--session` + `--resume` | 续聊/分叉（磁盘+MySQL 双重映射） |

### 选型结论
- 内核：OMP
- JSONL 协议与现有 `pi` demo 向后兼容
- Skill：`--skill` 磁盘路径注入；索引存 MySQL → 磁盘路径由 `sk_path` 指到 `runtime/skills/`
- MCP：MySQL 存配置条目 → `McpConfigGenerator` 生成磁盘 `.omp/mcp.json` → OMP cwd 发现
- Session：OMP 原生 session 文件存磁盘（resume/fork 需要） → `cs_session.s_omp_session_id` 建立映射

---

## 4. OMP 文件数据存储策略

OMP 运行时需要大量文件读写，数据存储需区分 MySQL 和磁盘：

| 数据类型 | MySQL | 磁盘 | 原因 |
|----------|-------|------|------|
| 用户/Agent/会话元数据 | ✅ | — | 结构化查询、列表筛选 |
| 消息文本 | ✅ | — | 历史回看、分页 |
| 结构化事件(tool/usage) | ✅ | — | 用量聚合、审计 |
| 计费记录 | ✅ | — | 统计分析 |
| Skill 索引(name/path) | ✅ | — | 浏览搜索 |
| Skill 文件本体 | — | ✅ `runtime/skills/` | OMP `--skill` 需要磁盘路径 |
| MCP 配置条目 | ✅ | — | CRUD 管理 |
| MCP 注入文件(.omp/mcp.json) | — | ✅ `runtime/tenants/{uid}/agents/{aid}/.omp/` | OMP cwd 自动发现 |
| OMP Session 文件 | — | ✅ `runtime/pi-sessions/{aid}/` | resume/fork 依赖 |
| workspace 工作目录 | — | ✅ `runtime/tenants/{uid}/agents/{aid}/workspace/` | OMP cwd，文件边界 |
| 归档产物 | — | ✅ `runtime/archive/{sid}/` | 导出落盘 |

> 映射关系：`cs_session.s_omp_session_id` ↔ `runtime/pi-sessions/{aid}/{omp_session_id}`；`cs_skill.sk_path` ↔ `runtime/skills/{name}`

---

## 5. 关键缺口

### 5.A MCP 注入
- pi CLI 无 `--mcp` 参数，MCP 由配置文件发现（`.omp/mcp.json`）
- SaaS 为每个 Agent 生成注入 → 从 `cs_mcp_config` 生成磁盘文件
- **待实测**：发现路径、OMP 二进制名、`--profile` 影响

### 5.B Token 计费
- 当前 demo 未采集 usage；provider 原生支持但需验证 OMP 透传
- 兜底：字符数/4 估算 → 直连 provider
- **待实测**：usage 字段路径、cache 透传、provider 接口

### 5.C 工作目录隔离
- OMP 基于文件系统，多租户需隔离 workspace
- 首版：独立目录 + `--profile`；**待实测**：cwd 逃逸风险

---

## 6. 待实测清单（5 项）

| 编号 | 事项 | 影响闭环 |
|------|------|----------|
| 1 | OMP 二进制名 + `--profile`/`.omp` 位置 | A |
| 2 | `.omp/mcp.json` 发现路径（cwd 向上 vs `$HOME/.omp`） | A |
| 3 | RPC 事件 `usage` 字段路径 + cache 透传 | B |
| 4 | `token.alonetech.com` 用量查询接口 | B |
| 5 | OMP cwd 逃逸风险 | C |
