# Admin 端 PRD · 运营模块（Skill 库 / MCP 模板 / 计费大盘 / 全局配置）

> 系列：Admin 后台 PRD · 第 3 篇（运营模块打包）
> 关联：01-product-requirements.md §7（Admin 后台二期）、07-admin-account-rbac.md、08-admin-user-management.md
> 版本：v0.1 | 状态：需求草案（数据模型待工程确认） | 日期：2026-07-21
> 适用端：`/admin/*`（`usr_app_type = 1`）

---

## 1. 文档信息

| 项 | 内容 |
| --- | --- |
| 项目代号 | `pi_agent_saas` |
| 本期范围 | Admin 对平台供给与全局策略的治理：Skill 库、MCP 模板、计费统计大盘、全局配置覆盖 |
| 依赖 | 07（RBAC）、08（用户管理与审计）；底层依赖 User 端 MVP 的 agent/session/计费表 |
| 数据模型影响 | 经 `service/app/Model/` 核实并据用户裁定修订：业务表均加 `cs_` 前缀（如 `cs_skill_library`/`cs_billing_records`/`cs_agent_skill`）；**MCP 模板表缺失**（仅有 per-agent `cs_mcp_config`），需新建 `cs_mcp_template`；全局配置复用 `cs_system_config`。用户表为单一 `cs_user`（`usr_app_type` 分区），原 `users` 模型已删除（2026-07-22），登录/资料/归档逻辑已合并至 `CsUser` 模型，代码侧合并完成。详见 §6 |

---

## 2. Why —— 为什么做这一段

### 2.1 业务问题
- PRD §7 把「Skill 库管理 / MCP 模板管理 / 计费统计大盘 / 全局配置」列为 Admin 后台功能，但只有占位。
- 这 4 块是 **Admin 对平台的「供给」与「策略」能力**：
  - Skill / MCP 是 User 端 Agent 能力的**上游供给源**（R-003 从平台 skill 库挂载、R-004 配 MCP）——Admin 不治理，User 端就无料可用。
  - 计费大盘是**平台经营可视性**（仅聚合展示，不扣费，对齐 PRD §5/§8）。
  - 全局配置是**全平台默认策略**（自动归档天数、存储上限），User 端「全局优先、默认兜底」读取。
- 它们共同决定"平台给所有用户什么、怎么管"，是 Admin 后台的经营中枢。

### 2.2 目标
- G-1：Admin 可维护平台 Skill 库与 MCP 模板，控制 User 端能挂载什么（启用 / 禁用 / 上下架）。
- G-2：Admin 可查看全平台计费与用量大盘，掌握经营概览（仅展示，不扣费）。
- G-3：Admin（超管）可设置全平台默认策略（归档 / 存储上限），User 端按"全局优先、默认兜底"生效。
- G-4：所有「影响全平台的供给 / 策略」变更可审计（复用 `cs_system_record` / `cs_user_log`）。

---

## 3. 范围（In-scope / Non-goals）

### 3.1 In-scope（本期做）
- Skill 库：列表 / 新增 / 编辑 / 删除 / 启用禁用；统计挂载次数。
- MCP 模板：列表 / 新增 / 编辑 / 删除 / 启用禁用。
- 计费大盘：全平台汇总、时间趋势、用户排名、Agent/Skill/Provider 用量 Top（仅展示）。
- 全局配置：自动归档（开关 + 天数）、活跃会话上限、归档会话上限（超管设置，User 端兜底读取）。

### 3.2 Non-goals（明确不做）
- ❌ **不做平台 Skill / MCP 的「执行 / 校验」**：Admin 仅维护定义与上下架，实际注入仍由 User 端 Agent 启动流程负责（R-003/R-004）。
- ❌ **不做计费扣减 / 余额 / 支付 / 发票**：计费大盘仅聚合展示（对齐 PRD §5/§8），扣费逻辑不在本期。
- ❌ **不暴露单个用户会话内容**：计费大盘只看聚合与排名，不钻取私人对话（隐私，见 08 §7）。
- ❌ **不做用户级配置覆盖**：全局配置是平台级默认值；不做"按用户定制配置"（无组织维度，见 07 §3.2）。
- ❌ **不做 Skill / MCP 市场 / 第三方上传**：平台统一托管，用户上传不在本期（见 01 §4.4）。

---

## 4. 角色与用户故事

### 4.1 角色权限（来自 07）
| 模块 | 超管 | 运营 | 客服 |
| --- | --- | --- | --- |
| Skill 库 / MCP 模板 | CRUD | 查看 | 查看 |
| 计费大盘 | 查看 | 查看 | 查看 |
| 全局配置 | CRUD（仅超管） | 不可改 | 不可改 |

> 运营能否管理 Skill/MCP 定义为可调决策；本篇保守设为「仅查看」，避免运营误上下架影响全平台。

### 4.2 用户故事
| 编号 | 故事 | 对应需求 |
| --- | --- | --- |
| US-O1 | 作为超管，我希望上架/下架某个 Skill，以便控制 User 端能挂载的能力 | FR-1 |
| US-O2 | 作为超管，我希望维护 MCP 模板，以便 User 无需手写配置即可接入常用 MCP | FR-2 |
| US-O3 | 作为运营，我希望查看全平台用量与费用大盘，以便掌握经营概览 | FR-3 |
| US-O4 | 作为超管，我希望调整全平台自动归档天数与存储上限，以便统一策略 | FR-4 |
| US-O5 | 作为合规方，我希望全局配置变更被记录，以便溯源 | FR-4, 审计 |

---

## 5. 功能需求详述（FR）

### FR-1 Skill 库治理
- **FR-1.1** 列表：平台全部 Skill 定义（名称、描述、启用状态、挂载次数）。（`cs_skill_library` 当前无 `category` 列，分类本期省略，见 §6.3）
- **FR-1.2** 新增 / 编辑：名称、描述、入口（path / url）、分类、启用状态；新增写 `cs_user_log`（动作：新增 Skill）。
- **FR-1.3** 启用 / 禁用：禁用的 Skill **不再出现在 User 端可选列表**；已挂载的不强制卸载（避免破坏存量 Agent），但新挂载不可选。
- **FR-1.4** 删除：软删除（保留历史挂载关系）；删除写 `cs_user_log`。
- **FR-1.5** 挂载次数：统计该 Skill 被多少 User 端 Agent 引用（读 `cs_agent_skill` 关联）。
- **FR-1.6** 仅超管 CRUD；运营 / 客服仅查看。

### FR-2 MCP 模板管理
- **FR-2.1** 列表：平台全部 MCP 模板（名称、类型 stdio/http/sse、描述、启用状态）。
- **FR-2.2** 新增 / 编辑：名称、类型、命令 / 参数 / env 模板、描述、启用状态。
- **FR-2.3** 启用 / 禁用：禁用的模板不出现在 User 端可选；已配置的 User Agent 不受影响（不强制改其 `mcp.json`）。
- **FR-2.4** 删除 / 审计：同 FR-1.4/1.2 的日志规范。
- **FR-2.5** 仅超管 CRUD；运营 / 客服仅查看。
- **FR-2.6** 持久化至新建 `cs_mcp_template` 表（见 §6.2）；现有 `cs_mcp_config`（带 `agent_id`）是单 Agent 实例配置，不在此模块管理。

### FR-3 计费统计大盘（仅展示）
- **FR-3.1** 全平台汇总卡：总 input/output/cache_read/cache_write token、总估算费用（聚合按 `user_id` 的计费/usage 源）。
- **FR-3.2** 时间维度趋势：日 / 月切换，token 与费用曲线。
- **FR-3.3** 用户排名：Top N 用量用户（账号 / 累计 token / 估算费用），**仅列聚合指标，不钻取会话内容**。
- **FR-3.4** 资源 Top：Top Agent / Top Skill / Provider 分布（按调用量）。
- **FR-3.5** 超管 / 运营均可查看；数据来源标注（usage 原生 / estimate 估算，对齐 01 §4.6）。

### FR-4 全局配置覆盖
- **FR-4.1** 配置项：
  - 自动归档：开关 + 天数（默认 30，对齐 R-017）。
  - 活跃会话上限（默认 100，对齐 R-STORE）。
  - 归档会话上限（默认 50，对齐 R-STORE）。
- **FR-4.2** 存储机制：写入 `cs_system_config`（KV 语义，见 §6 待确认）；User 端读取「全局优先、默认兜底」——有全局值用全局，无则用代码默认值。
- **FR-4.3** 审计：每次变更写 `cs_system_record`（已有「配置修改记录」表，`sr_field`/`sr_value`/`sr_extend`/`sr_create_user`），并可同时写 `cs_user_log`。
- **FR-4.4** 仅超管可改全局配置；运营 / 客服不可改（影响全平台，高权限）。

---

## 6. 数据模型变更（已核实 `service/app/Model/`，并按用户裁定加 `cs_` 前缀）

> 经核实 `service/app/Model/` 下模型，User 端 MVP 表实际存在。据用户裁定（2026-07-21 晚）：**所有表必须带 `cs_` 前缀**，无前缀表不合规。
> **权威建表脚本**：`document/sql/initialization/02-cyberpal_sweatshop.sql`（由实际模型反向生成、统一 `cs_` 前缀，含 `.tmp/` 增量补丁）。本篇数据映射如下，字段细节以该 SQL 为准。

### 6.1 已存在，可直接复用（均带 `cs_` 前缀）
| 概念 | 实际表名 | 关键字段（来自 Model） | 本篇用途 |
| --- | --- | --- | --- |
| **业务用户（单一）** | `cs_user` | usr_id(INT, PK), usr_app_type(0/1/4/7), usr_account, usr_pwd, usr_real_name | **全部业务表 `user_id` 指向 `cs_user.usr_id`**；admin/user 仅 `usr_app_type` 区分，无独立 users 表（原 `users` 模型为代码漂移，设计上已并入 `cs_user`，代码侧迁移延后） |
| Skill 库 | `cs_skill_library` | id(UUID), name, description, path, enabled(0/1) | FR-1 直接 CRUD 治理；`enabled` 控制上下架 |
| 计费记录 | `cs_billing_records` | user_id, session_id, agent_id, model, provider, input/output/cache_read/cache_write_tokens, cost_estimate(USD), source(usage/estimate/provider_api) | FR-3 按 `user_id` 聚合大盘 |
| Agent-Skill 关联 | `cs_agent_skill` | agent_id, skill_id | FR-1.5 挂载次数 = COUNT(skill_id) |
| Agent | `cs_agents` | id(UUID), user_id, name, provider, model, status | FR-3 Top Agent；08 跨用户 Agent 管理 |
| Session | `cs_sessions` | id(UUID), user_id, agent_id, status(active/archived/deleted), message_count, last_usage(json) | 08 跨用户 Session 管理 |
| 全局配置 | `cs_system_config` | sc_join_table, sc_join_data, sc_clean_rule(json) | FR-4 KV 存储（语义见 6.3） |
| 配置审计 | `cs_system_record` | sr_field, sr_value, sr_extend, sr_create_user | FR-4 变更记录 |
| 操作审计 | `cs_user_log` | ul_app_type, ul_user, ul_module/controller/action, ul_extend | Skill/MCP 增删改审计（07 §FR-6） |

### 6.2 ⚠️ 需新建：MCP 模板表 (`cs_mcp_template`)
- **现状**：`service/app/Model/McpConfig.php` 的 `cs_mcp_config` 表带 `agent_id`，是**单 Agent 的 MCP 配置**（最终生成 per-agent `mcp.json`），**不是平台级模板库**。
- **结论**：Admin「MCP 模板管理」（FR-2）需要一张**平台级模板表** `cs_mcp_template`：
  | 字段 | 说明 |
  | --- | --- |
  | id(UUID) | 主键 |
  | name | 模板名称 |
  | transport | stdio / http / sse |
  | command | stdio 可执行文件 |
  | args_json | 参数数组 |
  | url | http/sse 地址 |
  | env_json | 环境变量模板 |
  | headers_json | http/sse 鉴权头模板 |
  | enabled(0/1) | 是否上架 |
  | description | 描述 |
- User 端 R-004 后续可从此模板一键添加（本期仅 Admin 治理，User 端接入为后续）。

### 6.3 待确认项
- `cs_system_config` 当前列 `sc_clean_rule`(json) 偏文件清理规则；全局归档天数/存储上限建议以 KV 行存入（如 `sc_join_table='global'` + `sc_clean_rule` 扩展或新增 KV 列），User 端「全局优先、默认兜底」读取——**KV 扩展方式待工程确认**。
- `cs_skill_library` 当前无 `category`（分类）列；FR-1.1 的"分类"如需支持，需加列或本期省略（建议本期省略，后续按需加）。

---

## 7. 隐私与合规

- **P-1（不钻取私人内容）**：计费大盘仅展示聚合与排名指标，不提供「查看某用户会话内容」入口（那是 08 §FR-7 的独立授权能力，不在本篇）。
- **P-2（无个人数据导出）**：Skill/MCP/全局配置均不含用户私人数据；不涉及批量个人数据落盘（延续 08 Non-goals）。
- **P-3（变更可审计）**：全局配置与 Skill/MCP 上下架均写审计表，满足溯源。

---

## 8. 验收标准

| 编号 | 标准 |
| --- | --- |
| AC-1 | Skill 库列表/增删改/启停可用；禁用后 User 端可选列表不再出现该 Skill（存量 Agent 不受影响） |
| AC-2 | MCP 模板列表/增删改/启停可用；禁用后 User 端不可选该模板 |
| AC-3 | 计费大盘展示全平台汇总、时间趋势、用户排名、资源 Top；数据仅聚合，无会话内容钻取 |
| AC-4 | 超管改全局归档/存储上限后，User 端按「全局优先、默认兜底」生效 |
| AC-5 | 全局配置变更写入 `cs_system_record`（含修改人/字段/值）；Skill/MCP 变更写入 `cs_user_log` |
| AC-6 | 运营 / 客服不可改全局配置、不可 CRUD Skill/MCP（入口隐藏 + 接口 403） |
| AC-7 | 计费大盘仅展示，无任何扣费 / 余额 / 支付动作 |

---

## 9. 风险与待定项（Open Questions）

| 项 | 说明 | 优先级 |
| --- | --- | --- |
| ~~document/sql 与 service/ 模型漂移~~ | **已解决**：业务表已落地 `document/sql/initialization/02-cyberpal_sweatshop.sql`（含 `.tmp/` 增量补丁），由 `service/app/Model/` 反向生成 | ✅ 已解 |
| ~~🔴 双用户表架构问题~~ | **已撤销（用户裁定 2026-07-21 晚）**：不存在双用户表。用户表仅 `cs_user` 一张（`usr_id` 主键、`usr_app_type` 区分 0/1/4/7）；`service` 中的 `users` 模型是代码漂移，应移除/并入 `cs_user`。所有业务表 `user_id` → `cs_user.usr_id`（已在 02 SQL 落地）。Admin 07/08 的账户模型（admin/user 同在 `cs_user` 以 `usr_app_type` 区分）**本身正确，无需修订** | ✅ 已解 |
| 🟡 **表前缀规则已裁定；时间戳命名仍冲突** | 表前缀：用户裁定**全部加 `cs_` 前缀**，无前缀不合规（02 SQL 已执行）。时间戳：`sql/AGENTS.md` 要求 `create_time/update_time/delete_time` 用 BIGINT；实际业务模型用 `created_at/updated_at`(DATETIME) 且多数无 `delete_time`。该语义冲突需产品/架构拍板（改约定 or 重构模型），**暂以运行代码为准** | 🟡 待决策 |
| 🟢 **`cs_mcp_template` 待建** | FR-2 依赖的"平台级 MCP 模板表"当前 service 代码中不存在，已在 02 文件以【规划中】形态给出 DDL（`cs_mcp_template`）；落库前需工程确认字段 | 🟢 |
| 新建 `cs_mcp_template` 表 | Admin MCP 模板库无现成表，需按 §6.2 新建（含 Model + 迁移/SQL） | 🟡 |
| `cs_system_config` KV 语义 | 全局归档/存储上限如何存（扩展列 vs JSON），待工程确认 | 🟡 |
| Skill 分类字段 | `cs_skill_library` 无 category 列；本期省略或加列 | 🟢 |
| 运营能否管 Skill/MCP | 本篇保守设为仅超管 CRUD；若运营需日常上下架，调整为运营可管 | 🟡 |
| 禁用 Skill/MCP 对存量影响 | 已挂载的不强制卸载（本篇决策）；是否需通知用户，待定 | 🟢 |
| ~~🟡 用户端偏好列归属~~ | **已裁定 A 并落地（2026-07-22）**：theme_pref / auto_archive_enabled / auto_archive_days 三列已直接并入 `01-base.sql` 的 `cs_user` CREATE TABLE（init 项目无需 ALTER，02 SQL 末尾 ALTER 块已移除）；原 `users` 模型已删除，代码合并至 `CsUser`，完成 | ✅ 已解 |

---

## 10. 关联文档
- `01-product-requirements.md` —— §4.4 Skill 库（平台托管）、§4.5 MCP、§4.6 计费（仅展示）、§5 归档/存储上限、§8 不扣费
- `07-admin-account-rbac.md` —— 角色集、权限中间件、审计
- `08-admin-user-management.md` —— 跨用户操作边界、会话内容查看授权（本篇大盘不钻取）
- `document/sql/initialization/02-cyberpal_sweatshop.sql` —— 全部业务表 DDL（`cs_` 前缀、单一 `cs_user`、外键指向 `cs_user.usr_id`）；`cs_mcp_template` 为规划中

---

> 风紧，扯呼！（据用户裁定修订：全部业务表加 `cs_` 前缀、单一 `cs_user` 用户表（原 `users` 模型已删除，代码合并至 CsUser，2026-07-22 完成）；唯一真缺口是 **平台级 MCP 模板表 `cs_mcp_template` 需新建**（现有 `cs_mcp_config` 是 per-agent 非平台模板）；02 SQL 已落地，时间戳命名约定冲突列为待决策）
