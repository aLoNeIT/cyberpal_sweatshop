# pi-agent 网关层设计

> 版本：v2.0 | 状态：设计基线（引擎切换） | 日期：2026-07-21
> 关联文档：02-technical-architecture.md / 04-tech-research.md
> 变更说明：本文档前身为 `05-omp-gateway-design.md`（omp 视角）。2026-07-21 经评估，引擎由 oh-my-pi(omp) 切换为**官方 pi-agent（pi-agent-core / pi-coding-agent）+ 社区插件栈**，网关层（WS + SQLite + 三级隔离 + 断线补传）架构保持不变。

---

## 1. 设计动机

### 1.1 问题

Hyperf 服务层作为 Web 应用更新频繁（发布/重启/扩缩容），而 pi-agent 进程执行 AI 任务耗时长（30s ~ 5min），两者生命周期不匹配：

| 场景 | 问题 |
|------|------|
| Hyperf 发布重启 | agent 进程被连带 kill，任务中断，结果丢失 |
| 多个 Hyperf 服务 | admin / user / open_platform 各自管 agent，重复建设 |
| agent 进程管理 | 生命周期耦合在业务代码中，难以独立扩缩和监控 |

### 1.2 目标

增加独立的 **pi-gateway** 网关层，实现：

- **解耦生命周期**：Hyperf 重启不影响 agent 执行
- **多服务共享**：多个 Hyperf 服务通过 WS 连接同一个 gateway
- **断线不丢数据**：服务离线时结果写入 SQLite，重连后异步补传
- **零外部依赖**：SQLite 自包含，不引入 Redis/MySQL 等额外存储

---

## 2. 架构总览

```
Hyperf Service (频繁更新)  ←——WS——→  pi-gateway (稳定)  ←——NDJSON/stdio——→  pi-agent (--mode rpc + 插件栈)
```

### 2.1 三层隔离模型

```
pi-gateway
  └── ServiceRegistry (service_id → ServiceContext)
       └── ServiceContext
            ├── offline: boolean          ← 服务级离线标记
            ├── ws: WebSocket | null      ← 该服务的 WS 连接
            └── sessions: Map<session_id, SessionContext>
                 └── SessionContext
                      ├── agent: PiAgentProcess  ← pi --mode rpc 子进程（含插件栈）
                      └── seqId: number          ← 消息序号
```

| 层级 | 职责 | 关键属性 |
|------|------|---------|
| ServiceContext | 多服务隔离、离线标记、WS 绑定 | `offline`, `ws`, `sessions` |
| SessionContext | 单次任务会话、消息排序 | `agent`, `seqId` |
| Agent Process | pi `--mode rpc` 子进程，执行 AI 任务 | 不感知上层断联 |

### 2.2 隔离原则

- `service_id` 是顶级隔离维度，不同服务无法读写彼此的 session 数据
- 服务离线时 **service 级**标记 `offline = true`，其下全部 session 统一走 SQLite
- 同一 service 内的多个 session 各自的 agent 进程独立运行，互不影响

### 2.3 引擎与插件栈（核心变更）

引擎采用**官方 pi-agent-core**（monorepo 中的 `pi-agent-core` + `pi-coding-agent` CLI），本身仅提供 agent 循环、工具调用、状态管理与统一 LLM API（25+ 厂商，会话内跨供应商 handoff）。所需进阶能力（权限、沙箱、MCP、子代理、Skills）通过官方内置或社区插件补齐，**按需装载**：

| 能力 | 组件 | 来源 | 说明 |
|------|------|------|------|
| agent 内核 / 循环 | pi-agent-core | 官方 | 工具调用 + 状态管理 + 会话树 |
| 多 Provider | pi-ai | 官方 | 25+ 厂商统一 API，会话内跨供应商切换，自定义 provider 扩展 |
| Skills | Agent Skills 标准 | 官方 | 渐进式披露，兼容 Claude Code / Codex 的 skills 目录 |
| 权限网关 | @gotgenes/pi-permission-system | 社区（成熟，~23.9K 下载/月，2026-07 活跃） | 中心化 allow/ask/deny 策略、路径门禁、外部目录门禁、fail-closed，与 subagents 联动 |
| 硬隔离沙箱 | Gondolin / Docker / OpenShell | 官方 containerization | OS 级边界；Gondolin 为官方推荐 micro-VM |
| 应用层沙箱补充 | @sysid/pi-sandbox | 社区 | bubblewrap/sandbox-exec + 工具调用拦截 + 交互提示 |
| MCP 桥 | @titouanmathis/pi-mcp-adapter | 社区（活跃） | token 友好（lazy + 单 proxy tool），接 MCP 生态 |
| MCP 桥（备选） | tmonk/pi-mcp-bridge | 社区（MIT, 35 tests） | 持久子进程 + 动态 schema 注册，简单可靠 |
| 子代理 | @gotgenes/pi-subagents | 社区 | 进程内子会话，与 permission-system 联动 |
| 重编排（可选） | task-factory / PiSwarm | 社区 | 队列编排 / 并行 issue |

> 插件加载方式：镜像内预置 `settings.json` 的 `extensions` 数组 + 全局 `~/.pi/agent/extensions/`；按任务通过 `-e <ext>` / `--skill <path>` 增量注入。平台级策略（permission config、mcp 配置）由 gateway 在 spawn 时挂载到 agent 容器/进程。

### 2.4 非交互模式约束（关键）

gateway 以 `pi --mode rpc`（NDJSON over stdio）无 TUI 方式驱动 agent，**无交互 UI**：

- 权限系统的 `ask` 策略**无法弹确认框**，必须预置为确定性策略（allow/deny）。
- 平台按租户/任务下发 `@gotgenes/pi-permission-system` 的 `config.json`（allow/ask/deny、路径规则、外部目录门禁），存放于 agent 容器/进程的 `~/.pi/agent/extensions/pi-permission-system/config.json`。
- fail-closed：策略解析失败或未知 bash 包装 → 拦截（deny），保证无人值守调度的安全默认。
- 这与 xxl-job 式无人值守调度天然契合（无人工干预）。

---

## 3. 通信方案选型

### 3.1 方案对比

| 方案 | Hyperf 侧 | Gateway 侧 | 部署要求 | 推荐度 |
|------|----------|-----------|---------|--------|
| **WebSocket 直连** | Swoole WS Client | Bun WS Server | 独立容器 | 优先 |
| **NDJSON/stdio** | Swoole\Process pipe | pi 原生 `--mode rpc` | **必须同机/同容器** | 备选 |
| HTTP 包裹 | Guzzle HTTP | Bun HTTP Server | 独立容器 | 不优先 |
| Redis Pub/Sub | Redis 发布订阅 | Bun ioredis | 需 Redis | 不优先 |
| MCP 协议 | JSON-RPC stdio | MCP Server 包装 | 独立容器 | 不优先 |
| gRPC | Hyperf gRPC | Bun grpc-js | 独立容器 | 不优先 |
| Unix Socket | Swoole socket | Bun net  | 仅同机 | 不优先 |

### 3.2 选定方案

| 优先级 | 方案 | 说明 |
|--------|------|------|
| **1** | **WebSocket 直连** | 独立容器部署，原生双向实时推送，适合长任务 + 进度推送 |
| **2** | **NDJSON/stdio** | pi 原生 `--mode rpc` 模式，零改造，但强制同进程空间，仅限同机部署备选 |

> 选择依据：NDJSON/stdio 基于进程间 pipe 通信，无法跨容器。Docker Compose 多服务编排场景下必须走 WS 方案。

---

## 4. 通信协议设计

### 4.1 WebSocket 消息格式

所有消息为 JSON，基础结构：

```json
{
  "type": "request | response | event",
  "service_id": "admin",
  "session_id": "uuid",
  "seq": 1,
  "action": "submit | reconnect | ping",
  "payload": {}
}
```

### 4.2 消息类型

| 方向 | action | 说明 |
|------|--------|------|
| Hyperf → Gateway | `submit` | 提交新任务，创建 session + agent |
| Hyperf → Gateway | `reconnect` | 断线重连，带 `service_id` |
| Hyperf → Gateway | `ping` | 心跳（每 10s） |
| Gateway → Hyperf | `chunk` | agent 产出文本片段 |
| Gateway → Hyperf | `tool_start` | 工具调用开始 |
| Gateway → Hyperf | `tool_result` | 工具调用结束 |
| Gateway → Hyperf | `done` | 任务完成，含最终结果 |
| Gateway → Hyperf | `pong` | 心跳响应 |
| Gateway → Hyperf | `replay_start` | 补传开始，含积压数量 |
| Gateway → Hyperf | `replay_done` | 补传完成 |
| Gateway → Hyperf | `reconnected` | 重连成功（无积压时） |
| Gateway → Hyperf | `error` | 错误信息（含权限拦截） |

### 4.3 鉴权

首次连接时 Hyperf 发送 JWT token，gateway 校验后绑定 `service_id`，后续消息继承该身份。

> 事件映射：pi 通过插件事件（`tool:start` / `tool:result` / `generation` / `session`）暴露进度；gateway 订阅这些事件映射到上表的 `tool_start` / `tool_result` / `chunk` / `done`。permission-system 的拦截以 `error` 事件上抛。

---

## 5. 持久化设计

### 5.1 存储选型

| 选项 | 结论 |
|------|------|
| SQLite | 选用 — Bun 内置 `bun:sqlite`，零依赖 |
| Redis  | 不选用 — 增加外部依赖，架构更重 |
| 文件系统 | 不选用 — 并发写入和查询不如 SQLite |

### 5.2 表结构

```sql
CREATE TABLE IF NOT EXISTS session_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id  TEXT NOT NULL,
  session_id  TEXT NOT NULL,
  seq         INTEGER NOT NULL,
  payload     TEXT NOT NULL,          -- JSON string
  created_at  INTEGER NOT NULL,       -- Unix ms
  consumed    INTEGER DEFAULT 0       -- 0=待补传, 1=已消费
);

CREATE INDEX IF NOT EXISTS idx_service_consumed
  ON session_events(service_id, consumed, session_id, seq);
```

### 5.3 查询模式

| 操作 | SQL |
|------|-----|
| 写入（agent 产出时） | `INSERT INTO session_events (service_id, session_id, seq, payload, created_at) VALUES (?, ?, ?, ?, ?)` |
| 查询积压（重连时） | `SELECT * FROM session_events WHERE service_id = ? AND consumed = 0 ORDER BY session_id, seq` |
| 标记已消费 | `UPDATE session_events SET consumed = 1 WHERE id = ?` |
| 清理已消费 | `DELETE FROM session_events WHERE consumed = 1 AND created_at < ?` (1h 前) |
| 积压计数 | `SELECT COUNT(*) FROM session_events WHERE service_id = ? AND consumed = 0` |

---

## 6. 断线处理机制

### 6.1 核心原则

- **不设全局模式** — 不在 gateway 层面搞"积压模式"开关
- **推送时自然发现断路** — agent 返回数据时调用 `push()`，发现 WS 不可用则标记
- **service 级隔离** — 只标记断开的那一个 service，其他 service 不受影响

### 6.2 push() 流程

```
agent 产出数据
  ↓
push(service, session, data)
  ↓
service.ws?.readyState === OPEN ?
  ├─ YES → ws.send(payload)                    ← 正常推送
  └─ NO  → service.offline = true              ← 只标记本 service
           INSERT INTO session_events (...)     ← 写入 SQLite
```

### 6.3 服务断联事件

```
Hyperf 重启 → WS 连接关闭
  ↓
gateway 触发 onClose
  ↓
ServiceContext.offline = true
ServiceContext.ws = null
该 service 下所有 session 的 agent 继续执行，产出自动进入 push() → SQLite
其他 service 完全不受影响
```

### 6.4 服务重连 & 异步补传

```
Hyperf 恢复 → 新建 WS 连接 → 发送 { action: "reconnect", service_id: "admin" }
  ↓
gateway.onServiceReconnect(service_id, newWs)
  ↓
SELECT COUNT(*) WHERE service_id = ? AND consumed = 0
  ├─ 0 → 直接恢复，回复 { event: "reconnected", backlog: 0 }
  └─ >0 → 启动异步补传任务
           ↓
         { event: "replay_start", total: N }
           ↓
         SELECT * ORDER BY session_id, seq
           ↓
         逐条 ws.send() → UPDATE consumed = 1 (每 100 条 sleep 10ms)
           ↓
         DELETE consumed = 1 (清理)
           ↓
         { event: "replay_done", sent: N }
           ↓
         service.offline = false → 后续恢复实时推送
```

### 6.5 补传中断处理

补传过程中 service 再次断联：
- 已标记 `consumed = 1` 的数据不会重复推送
- 未推送的数据保持 `consumed = 0`，下次重连继续补传
- 回复 `{ event: "replay_aborted", sent: X, remaining: Y }`

### 6.6 并发模型

Bun 运行在单线程 Event Loop 上，补传任务使用 `async/await`：

- 补传函数是普通 async 函数，Event Loop 自动调度
- 每 100 条 `await Bun.sleep(10)` 主动让出执行权
- 不需要 Worker Threads 或子进程
- SQLite 写操作在 JS 单线程下天然串行，无锁竞争

### 6.7 超时与清理

| 参数 | 值 | 说明 |
|------|-----|------|
| 心跳间隔 | 10s | Hyperf 侧定期 ping |
| 断线判定 | 30s 无心跳 | gateway 侧超时判定 |
| 积压数据保留 | 1h | consumed=1 的数据定时清理 |
| session 超时 | 30min | 断线超过 30min 未重连，kill agent + 清 session |
| agent 闲置回收 | 10min | 任务完成后空闲超时自动 kill |

---

## 7. 部署拓扑

### 7.1 Docker Compose

```yaml
services:
  hyperf-admin:
    build: ./service

  hyperf-user:
    build: ./service

  pi-gateway:
    build: ./gateway
    environment:
      - GATEWAY_PORT=3002
      - SQLITE_PATH=/data/gateway.db
      # agent 沙箱与插件在网关容器内预置
      - PI_SANDBOX=gondolin          # gondolin | docker | openshell
      - PI_PERMISSION_CONFIG=/etc/pi/permission.config.json
    volumes:
      - ./service:/workspace:ro            # workspace 只读挂载
      - ./deploy/pi/permission.config.json:/etc/pi/permission.config.json:ro
      - gateway_data:/data
    restart: unless-stopped

volumes:
  gateway_data:
```

> 说明：gateway 容器同时承载 Bun WS Server 与 `pi --mode rpc` 子进程（NDJSON/stdio 同机）。沙箱（Gondolin/Docker/OpenShell）提供 OS 级隔离边界，workspace 只读挂载，模型密钥经 env 最小权限注入。编码类任务可额外加载 pi-coding-agent 壳或 omp 壳，但默认不启用。

### 7.2 关键约束

| 约束 | 说明 |
|------|------|
| pi 运行时 | Bun ≥ 1.3.14（Node 亦可），仅 Linux/macOS |
| 开发环境 | Windows 下通过 WSL2 或 Docker 运行 |
| 模型密钥 | 通过 Docker env 注入，不落盘 |
| 网关依赖 | 零外部依赖，SQLite 自包含 |
| workspace 挂载 | 只读挂载项目代码到 pi-gateway 容器 |
| 权限策略 | 必须预置 `permission.config.json`（非交互模式无 UI 确认） |
| 插件栈 | 镜像内预置 extensions + skills，按任务增量注入 |

---

## 8. 技术栈

| 层 | 技术 |
|------|------|
| 网关运行时 | Bun (TypeScript) |
| WS 框架 | `Bun.serve()` 内置 WebSocket |
| 持久化 | `bun:sqlite` |
| agent 内核 | 官方 pi-agent-core（pi-coding-agent CLI，`--mode rpc`） |
| agent 插件栈 | @gotgenes/pi-permission-system / pi-mcp-adapter / pi-subagents / Gondolin |
| agent 通信 | NDJSON over stdio（`pi --mode rpc`） |
| Hyperf 客户端 | Swoole\Coroutine\Http\Client (WS) |

---

## 9. 风险与缓解

| 风险 | 级别 | 缓解措施 |
|------|------|---------|
| pi 仅 Linux/macOS | 中 | Docker 容器化统一运行时 |
| 非交互模式无权限确认 UI | 中 | 预置 `permission.config.json` 确定性策略，fail-closed |
| 沙箱逃逸 / 越权访问 | 中 | Gondolin/Docker OS 级隔离 + permission 路径门禁 |
| agent 实例内存泄漏 | 中 | 闲置 10min 自动回收 + restart policy |
| AI 调用耗时长 | 中 | 异步队列 + WS 实时推送，不阻塞 |
| WS 断线数据丢失 | 低 | SQLite buffer + 补传机制 |
| SQLite 文件单点 | 低 | volume 持久化 + 定期备份 |
| 补传量过大撑爆 WS 缓冲 | 低 | 每 100 条 sleep 10ms + 总量上限 10000 条 |
| service 越权访问 | 低 | service_id JWT 鉴权 + SQL 强制 service_id 过滤 |

---

## 10. 实施计划

| 阶段 | 内容 | 产出 |
|------|------|---------|
| P1 | pi-gateway 骨架：WS Server + SQLite + Agent Pool + 插件装载 | `gateway/src/server.ts` |
| P2 | Hyperf PiGatewayClient：WS 协程客户端 + 断线重连 | `app/common/client/PiGatewayClient.php` |
| P3 | 补传 & 重连完整验证 | 集成测试 |
| P4 | 多 service 隔离 + 鉴权 + 权限策略下发 | JWT 中间件 + permission.config 生成 |
| P5 | 生产部署：Docker Compose + Gondolin 沙箱 + 监控 | `docker-compose.yml` |
| P6 | MCP 桥 / 子代理 / Skills 分发接入验证 | 扩展 PoC |
