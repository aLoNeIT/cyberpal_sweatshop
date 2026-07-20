# Pi-Agent SaaS 平台 · 技术架构设计

> 版本：v3.0 | 状态：设计基线 | 日期：2026-07-20
> 内核：oh-my-pi（OMP）

---

## 1. 技术选型

| 层 | 选型 | 理由 |
| --- | --- | --- |
| 后端框架 | **Hyperf 3.2 + Swoole 6**（PHP 8.2） | 基于 `hyperf/hyperf-skeleton` 3.2 脚手架 |
| 进程内核 | **oh-my-pi（OMP）** | 原生 MCP 管理（`/mcp`、`.omp/mcp.json`）、`--profile` 配置隔离 |
| 关系数据库 | **MySQL 8** | 结构化业务数据（用户/Agent/会话/计费） |
| 缓存/Session | **Redis** | Session Store / 缓存热点 / 异步队列 |
| 鉴权 | **Session + Redis** | 请求头 `token` 字段优先，Cookie 兜底 |
| 任务队列 | **hyperf/async-queue** | 异步落库、计费聚合、归档 |
| 前端框架 | **Angular + ng-alain 21.x** | `@delon/theme` + NG-ZORRO（Ant Design of Angular） |

---

## 2. OMP 文件数据存储策略

OMP 在运行时会读写大量文件。需要区分哪些存 MySQL（结构化查询）、哪些留磁盘（OMP 直接加载）。

| 数据类型 | 存储位置 | 原因 |
|----------|----------|------|
| 用户/Agent/会话元数据 | **MySQL** | 需要结构化查询、列表、筛选、关联 |
| 消息文本（user/assistant） | **MySQL** | 需分页查询、回看历史、展示统计 |
| 结构化事件（tool/usage/error） | **MySQL** | 用量聚合、工具调用审计 |
| 计费记录 | **MySQL** | 按时间/模型/会话维度查询统计 |
| Skill 库索引（name/path/enabled） | **MySQL** | 浏览、搜索、启用禁用管理 |
| Skill 文件本体 | **磁盘** `runtime/skills/` | OMP `--skill` 需要磁盘路径；从 MySQL 的 `sk_path` 字段指到磁盘 |
| MCP 配置条目 | **MySQL** `cs_mcp_config` | CRUD 管理 |
| MCP 配置注入文件 | **磁盘** `runtime/tenants/{uid}/agents/{aid}/.omp/mcp.json` | OMP 从 cwd 发现 `.omp/mcp.json`，由 `McpConfigGenerator` 从 MySQL 生成 |
| OMP 原生 Session 文件 | **磁盘** `runtime/pi-sessions/{agent_id}/` | OMP `--session`/`--resume` 需要磁盘文件；`cs_session.s_omp_session_id` 记录映射 |
| Agent 工作目录 | **磁盘** `runtime/tenants/{uid}/agents/{aid}/workspace/` | OMP 启动 cwd，读写边界 |
| 归档导出 | **磁盘** `runtime/archive/{session_id}/` | 归档产物落盘 |

> 原则：**MySQL 存关系数据，磁盘存 OMP 原生文件**。两者通过 `cs_session.s_omp_session_id`、`cs_skill.sk_path`、`cs_mcp_config` 等字段建立映射。

---

## 3. 架构分层

```
┌────────────────────────────────────────────────┐
│       前端 SPA (Angular + ng-alain 21.x)        │
│  登录/注册 │ 控制台 │ Agent配置 │ 聊天(SSE) │ 历史 │ 计费 │ 设置 │
└─────────────────┬──────────────────────────────┘
                  │ REST + SSE（Session token/Cookie）
┌─────────────────▼──────────────────────────────┐
│        Hyperf 3.2 + Swoole 6 (PHP 8.2)         │
│  Session MW │ Agent CRUD │ MCP Gen │ Pool       │
│  SSE Stream │ Usage Collector │ Billing         │
│  Redis (Session) + MySQL (业务)                  │
└─────────────────┬──────────────────────────────┘
                  │ proc_open (JSONL RPC)
┌─────────────────▼──────────────────────────────┐
│            oh-my-pi (OMP) 进程                   │
│  --mode rpc │ --profile │ --skill │ --model      │
│  cwd=workspace/ │ .omp/mcp.json 自动发现         │
│  磁盘读写：workspace/ / skills/ / sessions/     │
└────────────────────────────────────────────────┘
```

---

## 4. 鉴权方案：Session + Redis

| 维度 | 内容 |
|------|------|
| 主通道 | 请求头 `token` 字段携带 session ID |
| 兜底通道 | Cookie 中的 session ID |
| 存储 | Redis（key: `session:{session_id}`，value: user_id + 过期时间） |
| 签发 | 登录成功 → 生成 session_id → 写入 Redis → 返回给客户端 |
| 登出 | 删除 Redis session key |
| 多设备 | 每次登录生成独立 session，互不干扰 |

中间件链：`Request → SessionMiddleware（token→Cookie→Redis） → TenantInjectMiddleware → Controller`

SSE 鉴权：EventSource 同域时 Cookie 自动携带（兜底）；自定义头用 `fetch + ReadableStream` 注入 `token` 请求头。

---

## 5. 数据模型（MySQL，表前缀 `cs_`）

> 参照 `.agents/04-database-standards.md`：
> - 表前缀 `cs_`，模型 `$table` 只写业务名（如 `user`）
> - 必备字段：`id`(BIGINT PK AI)、`create_time`、`update_time`、`delete_time`（均为 `BIGINT UNSIGNED` 秒级 Unix 时间戳）
> - 所有字段 `NOT NULL` + 默认值
> - 字段前缀使用表名缩写
> - 索引命名：`idx_*`（普通）、`uniq_*`（唯一）、`un_idx_*`（联合）
> - 引擎 InnoDB，utf8mb4

### 5.1 cs_user

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | BIGINT | PK AI | |
| u_email | VARCHAR(191) | '' | UNIQUE，登录名 |
| u_password_hash | VARCHAR(255) | '' | bcrypt |
| u_display_name | VARCHAR(64) | '' | 昵称 |
| u_theme_pref | TINYINT | 0 | 0=system, 1=light, 2=dark |
| u_auto_archive_ed | TINYINT | 1 | 自动归档开关 |
| u_auto_archive_days | INT | 30 | 归档阈值天数 |
| create_time | BIGINT UNSIGNED | 0 | |
| update_time | BIGINT UNSIGNED | 0 | |
| delete_time | BIGINT UNSIGNED | 0 | |

索引：`uniq_u_email`，`idx_u_delete_time`

### 5.2 cs_agent

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | BIGINT | PK AI | |
| a_user_id | BIGINT | 0 | FK→cs_user.id |
| a_name | VARCHAR(128) | '' | |
| a_description | VARCHAR(512) | '' | |
| a_system_prompt | TEXT | — | |
| a_append_prompt | TEXT | — | |
| a_provider | VARCHAR(64) | 'openai' | |
| a_model | VARCHAR(64) | '' | |
| a_thinking | VARCHAR(16) | 'medium' | |
| a_tools_whitelist | TEXT | — | 逗号分隔 |
| a_tools_blacklist | TEXT | — | 逗号分隔 |
| a_profile_name | VARCHAR(64) | '' | `tenant_{user_id}` |
| a_status | TINYINT | 0 | 0=offline, 1=online, 2=error |
| a_uuid | VARCHAR(36) | '' | 对外暴露的 UUID |
| create_time | BIGINT UNSIGNED | 0 | |
| update_time | BIGINT UNSIGNED | 0 | |
| delete_time | BIGINT UNSIGNED | 0 | |

索引：`idx_a_user_id`，`uniq_a_user_name`(user_id, name)，`idx_a_uuid`，`idx_a_delete_time`

### 5.3 cs_session

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | BIGINT | PK AI | |
| s_user_id | BIGINT | 0 | FK→cs_user.id |
| s_agent_id | BIGINT | 0 | FK→cs_agent.id |
| s_title | VARCHAR(255) | '' | 首条消息派生 |
| s_omp_session_id | VARCHAR(128) | '' | OMP 磁盘 session 文件 id |
| s_status | TINYINT | 0 | 0=active, 1=archived, 2=deleted |
| s_mode | TINYINT | 0 | 0=normal, 1=resumed, 2=forked |
| s_parent_id | BIGINT | 0 | fork 来源 |
| s_message_count | INT | 0 | |
| s_last_usage | JSON | — | 最近 usage 快照 |
| s_archived_time | BIGINT UNSIGNED | 0 | 归档时间戳 |
| s_uuid | VARCHAR(36) | '' | 对外暴露的 UUID |
| create_time | BIGINT UNSIGNED | 0 | |
| update_time | BIGINT UNSIGNED | 0 | |
| delete_time | BIGINT UNSIGNED | 0 | |

索引：`idx_s_user_status`(user_id, status)，`idx_s_agent_id`，`idx_s_uuid`，`idx_s_delete_time`

### 5.4 cs_message

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | BIGINT | PK AI | |
| m_session_id | BIGINT | 0 | FK→cs_session.id |
| m_role | TINYINT | 0 | 0=user, 1=assistant, 2=system |
| m_content | MEDIUMTEXT | — | |
| m_thinking | MEDIUMTEXT | — | |
| m_seq | INT | 0 | 会话内顺序 |
| create_time | BIGINT UNSIGNED | 0 | |
| update_time | BIGINT UNSIGNED | 0 | |
| delete_time | BIGINT UNSIGNED | 0 | |

索引：`idx_m_session_seq`(session_id, seq)

### 5.5 cs_event

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | BIGINT | PK AI | |
| e_session_id | BIGINT | 0 | FK→cs_session.id |
| e_message_id | BIGINT | 0 | 关联 message |
| e_type | TINYINT | 0 | 0=tool_call, 1=usage, 2=error, 3=meta |
| e_seq | INT | 0 | |
| e_payload | JSON | — | 结构化数据 |
| create_time | BIGINT UNSIGNED | 0 | |
| update_time | BIGINT UNSIGNED | 0 | |
| delete_time | BIGINT UNSIGNED | 0 | |

索引：`idx_e_session_seq`(session_id, seq)，`idx_e_session_type`(session_id, type)

### 5.6 cs_billing_record

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | BIGINT | PK AI | |
| br_user_id | BIGINT | 0 | FK→cs_user.id |
| br_session_id | BIGINT | 0 | FK→cs_session.id |
| br_agent_id | BIGINT | 0 | FK→cs_agent.id |
| br_model | VARCHAR(64) | '' | |
| br_provider | VARCHAR(64) | '' | |
| br_input_tokens | INT | 0 | |
| br_output_tokens | INT | 0 | |
| br_cache_read_tokens | INT | 0 | |
| br_cache_write_tokens | INT | 0 | |
| br_cost_estimate | DECIMAL(10,6) | 0 | 估算费用 USD |
| br_source | TINYINT | 0 | 0=usage, 1=estimate, 2=provider_api |
| create_time | BIGINT UNSIGNED | 0 | |
| update_time | BIGINT UNSIGNED | 0 | |
| delete_time | BIGINT UNSIGNED | 0 | |

索引：`idx_br_user_time`(user_id, create_time)，`idx_br_session_id`

### 5.7 cs_skill

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | BIGINT | PK AI | |
| sk_name | VARCHAR(128) | '' | |
| sk_description | VARCHAR(512) | '' | |
| sk_path | VARCHAR(512) | '' | 磁盘 skill 目录路径 |
| sk_enabled | TINYINT | 1 | |
| create_time | BIGINT UNSIGNED | 0 | |
| update_time | BIGINT UNSIGNED | 0 | |
| delete_time | BIGINT UNSIGNED | 0 | |

### 5.8 cs_mcp_config

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | BIGINT | PK AI | |
| mc_agent_id | BIGINT | 0 | FK→cs_agent.id |
| mc_name | VARCHAR(128) | '' | server 名 |
| mc_transport | TINYINT | 0 | 0=stdio, 1=http, 2=sse |
| mc_command | VARCHAR(255) | '' | stdio 可执行 |
| mc_args_json | JSON | — | 参数数组 |
| mc_url | VARCHAR(512) | '' | http/sse 地址 |
| mc_env_json | JSON | — | 环境变量 |
| mc_headers_json | JSON | — | 鉴权头 |
| mc_enabled | TINYINT | 1 | |
| create_time | BIGINT UNSIGNED | 0 | |
| update_time | BIGINT UNSIGNED | 0 | |
| delete_time | BIGINT UNSIGNED | 0 | |

索引：`idx_mc_agent_enabled`(agent_id, enabled)

### 5.9 cs_agent_skill

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | BIGINT | PK AI | |
| as_agent_id | BIGINT | 0 | FK→cs_agent.id |
| as_skill_id | BIGINT | 0 | FK→cs_skill.id |
| create_time | BIGINT UNSIGNED | 0 | |
| update_time | BIGINT UNSIGNED | 0 | |
| delete_time | BIGINT UNSIGNED | 0 | |

索引：`uniq_as_agent_skill`(agent_id, skill_id)

### 5.10 ER 关系图

```
cs_user 1──N cs_agent
cs_user 1──N cs_session
cs_user 1──N cs_billing_record
cs_agent 1──N cs_session
cs_agent 1──N cs_mcp_config
cs_agent N──M cs_skill (via cs_agent_skill)
cs_session 1──N cs_message
cs_session 1──N cs_event
cs_session 1──N cs_billing_record
cs_agent 1──N cs_billing_record
```

---

## 6. API 端点清单（30 端点）

基址 `/api`，鉴权：请求头 `token` 或 Cookie。统一响应：`{ "code": 0, "data": {}, "message": "ok" }`。

| 方法 | 路径 | 说明 | P |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | 邮箱+密码注册 | P0 |
| POST | `/api/auth/login` | 登录，返回 session_id | P0 |
| POST | `/api/auth/logout` | 登出，销毁 Redis session | P0 |
| GET | `/api/auth/me` | 当前用户信息 | P0 |
| GET | `/api/agents` | Agent 列表 | P0 |
| POST | `/api/agents` | 创建 Agent | P0 |
| GET | `/api/agents/{id}` | Agent 详情 | P0 |
| PUT | `/api/agents/{id}` | 编辑 Agent | P0 |
| DELETE | `/api/agents/{id}` | 删除 Agent | P0 |
| GET | `/api/skills` | 平台 Skill 库 | P0 |
| POST | `/api/agents/{id}/skills` | 挂载 Skill | P0 |
| GET | `/api/agents/{id}/mcp` | MCP 配置列表 | P0 |
| POST | `/api/agents/{id}/mcp` | 新增 MCP 条目 | P0 |
| PUT | `/api/agents/{id}/mcp/{mid}` | 编辑 MCP 条目 | P0 |
| DELETE | `/api/agents/{id}/mcp/{mid}` | 删除 MCP 条目 | P0 |
| GET | `/api/sessions` | 会话列表 | P0 |
| POST | `/api/sessions` | 创建会话（超上限拒绝） | P0 |
| GET | `/api/sessions/{id}` | 会话详情+消息 | P0 |
| POST | `/api/sessions/{id}/resume` | 续聊 | P0 |
| POST | `/api/sessions/{id}/fork` | 分叉（受上限约束） | P0 |
| POST | `/api/sessions/{id}/archive` | 手动归档 | P1 |
| DELETE | `/api/sessions/{id}` | 删除会话 | P1 |
| GET | `/api/chat/stream` | SSE 流式聊天 | P0 |
| GET | `/api/billing/summary` | 用量概览 | P0 |
| GET | `/api/billing/records` | 消费明细 | P1 |
| GET/PUT | `/api/profile` | 资料/主题/归档偏好 | P1 |

---

## 7. A / B / C 专项方案

### 7.A MCP 注入（闭环A）
per-agent `.omp/mcp.json`（`McpConfigGenerator` 从 `cs_mcp_config` 生成 → 写入 `runtime/tenants/{uid}/agents/{aid}/.omp/` ），OMP 以 agent 目录为 cwd 自动发现。变更标记 session 失效→下次重建。

### 7.B Token 计费（闭环B）
主方案：解析 OMP RPC 事件 `usage` → `cs_billing_record(br_source=0)`。兜底1：字符数/4 估算（`br_source=1`）。兜底2：直连 `token.alonetech.com`（`br_source=2`）。

### 7.C 工作目录隔离（闭环C）
`runtime/tenants/{uid}/agents/{aid}/workspace/` 作 OMP cwd + `--profile tenant_{uid}`。空闲 600s 回收进程；删除 agent 清目录。

---

## 8. 依赖包

### PHP（Hyperf 3.2）
```
hyperf/framework ^3.2, hyperf/swoole ^3.2, hyperf/database ^3.2
hyperf/redis ^3.2, hyperf/async-queue ^3.2
hyperf/validation ^3.2, hyperf/logger ^3.2, hyperf/session ^3.2
guzzlehttp/guzzle ^7.0
```

### 前端（ng-alain 21.x）
```
@angular/core ^19.x, ng-alain ^21.x, @delon/theme, @delon/auth
NG-ZORRO/antd ^19.x, dayjs
```

---

## 9. 存储上限实现

| 场景 | 检查逻辑 | 超限行为 |
|------|----------|----------|
| 新建/分叉会话 | `COUNT(s_status=0) >= 100` | 返回错误码，前端按钮置灰 |
| 手动/自动归档 | `COUNT(s_status=1) >= 50` | 拒绝归档/跳过 |

> 上限值写死在 config，后续 Admin 后台可动态覆盖。不自动删除。

---

## 10. 待实测项（5 项）

1. OMP 二进制名（`pi` vs `omp`）与 `--profile`/`.omp` 位置
2. `.omp/mcp.json` 发现路径（cwd 向上 vs `$HOME/.omp`）
3. RPC 事件 `usage` 字段确切路径
4. `token.alonetech.com` 用量查询接口可用性
5. OMP cwd 逃逸风险
