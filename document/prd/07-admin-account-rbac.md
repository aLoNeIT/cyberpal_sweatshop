# Admin 端 PRD · 账号与权限（RBAC）

> 系列：Admin 后台 PRD · 第 1 篇（账号 / 权限）
> 关联：01-product-requirements.md §7（Admin 后台二期）、§5（关键决策）
> 版本：v0.1 | 状态：需求草案 | 日期：2026-07-21
> 适用端：`/admin/*`（`usr_app_type = 1`）

---

## 1. 文档信息

| 项 | 内容 |
| --- | --- |
| 项目代号 | `pi_agent_saas` |
| 本期范围 | Admin 后台「账号体系 + RBAC 权限」设计与种子数据落地 |
| 数据模型影响 | **零新表**；仅补种子数据（admin 账号 / 角色 / 菜单 / 功能权限 / 关联） |
| 参考骨架 | `hongshan_cloudscript` RBAC 表结构（`cs_user / cs_role / cs_function / cs_function_detail / cs_menu / cs_role_permission / cs_user_permission / cs_relation / cs_user_log`） |

---

## 2. Why —— 为什么现在做这一段

### 2.1 业务问题
- **Admin 后台在 PRD §7 仅列了 7 行占位**（用户管理 / Agent·Session 全局 / Skill 库 / MCP 模板 / 计费大盘 / 全局配置 / Admin 账号权限），**没有 Why、没有范围、没有 Non-goals，等于未设计**。
- User 端 MVP 已基线（R-001~R-017 + 存储上限），但**任何跨用户运营动作都依赖一个「谁有权限、权限到哪一层」的底座**。不先定账号与 RBAC，后面的用户管理 / 计费大盘 / 会话干预全是无根之木。
- 框架层 RBAC 全套表已就绪（`cs_role / cs_function / cs_function_detail / cs_menu / cs_role_permission / cs_user_permission / cs_relation / cs_user_log` + `PermissionMiddleware` 按注解鉴权），**技术上零成本**，缺的是产品层范围定义。

### 2.2 已澄清的硬约束（来自本轮讨论）
1. **Admin 账号是系统初始化（seed）生成的**，不走公开注册通道。
2. **Admin 后台必须具备 RBAC 能力**（多角色、功能级鉴权），不是单超管裸奔。
3. **Admin 不能是 User**：`app_type=1`（admin）与 `app_type=4`（user）是 `cs_user` 表里不同应用类型，**必须分开注册、身份不合并**。

### 2.3 目标
- G-1：系统初始化即存在一个可用的超级管理员入口，且首次登录强制改密。
- G-2：Admin 后台支持多角色（超管 / 运营 / 客服）功能级 RBAC，由 `PermissionMiddleware` 统一鉴权。
- G-3：所有跨 `user` 账户的敏感操作（禁用 / 启用 / 删除用户、重置密码、改全局配置、管角色）可审计、可溯源，满足个人信息保护法合规底线。
- G-4：`admin ≠ user` 由数据模型与鉴权中间件双重卡死，杜绝身份越权。

---

## 3. 范围（In-scope / Non-goals）

### 3.1 In-scope（本期做）
- Seed 初始超级管理员账号（系统初始化脚本生成）。
- Admin 端 RBAC：角色集（超管 / 运营 / 客服）、功能权限点（`cs_function` + `cs_function_detail`）、角色-功能绑定（`cs_role_permission`）、用户-角色绑定（`cs_relation`）。
- Admin 登录边界：`/admin/login` 只认 `app_type=1`。
- 管理员账号管理（后台创建 / 禁用 / 启用 / 删除其他管理员），基于框架 `DictCrudController` 通用 CRUD（过滤 `app_type=1`）。
- 锁死最后一个超管（防系统锁死）。
- 审计日志：跨用户敏感操作写 `cs_user_log`。

### 3.2 Non-goals（明确不做，防范围蔓延）
- ❌ **不做模拟登录（impersonation）**：admin 以某 user 身份进入其工作区——隐私敏感，推到二期+，需单独权限 + 全量审计，本期不纳入。
- ❌ **不做租户 / 组织 / 团队维度**：`cs_user / cs_role` 的 `usr_join_*` / `r_join_*` 列留空，仅前向兼容位，本期不填；PRD §5「纯单用户」指 user 端内部无组织共享，与 Admin 跨用户运营不矛盾。
- ❌ **不做计费扣减 / 余额 / 支付**：本期仅 Admin 计费大盘（聚合展示）的权限底座，扣费逻辑不在本期。
- ❌ **不做 admin 兼 user 的合并身份**：admin 若想用产品，须另注册 `app_type=4` 的独立账号。
- ❌ **不做开放 admin 注册通道 / 邀请码**：admin 仅由现有管理员在后台创建。

---

## 4. 角色与用户故事

### 4.1 角色
| 角色 | `r_app_type` | `r_level` | 说明 |
| --- | --- | --- | --- |
| 超级管理员（SuperAdmin） | 1 | 0 | 全功能，种子生成，不可删 |
| 运营（Operator） | 1 | 1 | 用户运营 / 全局查看，受限写权限 |
| 客服（Support） | 1 | 2 | 仅查看，辅助排查 |

### 4.2 用户故事
| 编号 | 故事 | 对应需求 |
| --- | --- | --- |
| US-A1 | 作为平台部署者，我希望系统初始化后自动存在一个超级管理员，以便我无需额外注册即可进后台 | FR-1 |
| US-A2 | 作为超级管理员，我希望首次登录被强制改密，以便初始弱口令不长期暴露 | FR-1.3 |
| US-A3 | 作为超级管理员，我希望在后台创建其他管理员并分配角色，以便多人协同运营 | FR-4 |
| US-A4 | 作为运营人员，我希望只能管理用户、查看全局数据但**不能**删用户 / 改全局配置 / 管角色，以便权责分离 | FR-3 |
| US-A5 | 作为客服，我希望只能查看用户会话摘要与工单辅助信息，以便排查时不越权改数据 | FR-3 |
| US-A6 | 作为超级管理员，我希望删除/禁用管理员时系统锁死最后一个超管，以便不会被误操作锁死后台 | FR-4.4 |
| US-A7 | 作为合规审计方，我希望任何跨用户敏感操作都被记录（谁、对谁、改了什么、何时），以便事后溯源 | FR-6 |

---

## 5. 功能需求详述（FR）

### FR-1 Seed 初始超级管理员
- **FR-1.1** 部署初始化脚本（`01-base.sql` 或独立 seed 脚本）插入 1 条 `cs_user`：
  - `usr_app_type = 1`、`usr_account = 'admin'`、`usr_pwd` + `usr_salt`（强哈希）、`usr_state = 1`（启用）。
- **FR-1.2** 插入 1 条 `cs_role`：`r_app_type = 1`、`r_level = 0`、`r_systemed = 1`、`r_name = '超级管理员'`。
- **FR-1.3** 插入 `cs_relation`：`rel_user = 初始admin.id`、`rel_role = 超管.id`、`rel_app_type = 1`、`rel_role_level = 0`。
- **FR-1.4** 超管权限落地采用**快路径**：鉴权中间件对 `r_level = 0` 直接全放行，避免维护一张巨大的 `cs_role_permission`；其余角色走显式 `rp_function_code` 授权。
- **FR-1.5** 首次登录（`usr_login_last` 为空或标记未初始化）强制跳转改密页，未改密前禁止进入后台其他功能。

### FR-2 Admin 登录边界（`app_type` 隔离）
- **FR-2.1** `/admin/login` 仅接受 `usr_app_type = 1` 的账户；`usr_app_type = 4`（user）用 admin 通道登录须失败。
- **FR-2.2** `TokenSessionMiddleware` / `PermissionMiddleware` 按 `app_type` 卡边界：`/admin/*` 路由链只放行 `app_type=1` 的 Session。
- **FR-2.3** `cs_user` 唯一键 `un_uniq_usr_info(usr_app_type, usr_account, usr_delete_time)` 允许同名不同端是两个独立身份——** admin 想用产品须另注册 `app_type=4` 账号**，身份不合并（满足「admin 不能是 user」）。

### FR-3 RBAC 角色集与权限粒度（`r_app_type = 1`）
权限粒度到 `cs_function_detail` 的 `module / controller / action`，由 `PermissionMiddleware` 按注解鉴权。起步角色集（切分可调）：

| 角色 | `r_level` | 允许 | 禁止 |
| --- | --- | --- | --- |
| 超级管理员 | 0 | 全部功能（快路径全放行） | — |
| 运营 | 1 | 用户管理（列表/详情/禁用/启用/重置密码）；Agent·Session 全局查看与干预；Skill/MCP 库查看；计费大盘查看 | 删用户、改全局配置、管角色/权限、删管理员 |
| 客服 | 2 | 用户会话摘要查看、工单辅助信息查看 | 任何写操作、配置变更、数据删除 |

- **FR-3.1** `cs_function` / `cs_function_detail` 需按 cyberpal 的 admin 功能（非旧项目集团/门店那套）补 `app_type=1` 的功能点与 `module/controller/action` 编码。
- **FR-3.2** `cs_role_permission` 为超管做全授权（或由 `r_level=0` 快路径覆盖）、为运营/客服做子集授权。
- **FR-3.3** `cs_menu` 补 `app_type=1` 的 admin 菜单树，菜单可见性同样受角色权限控制。

### FR-4 管理员账号管理
- **FR-4.1** 管理员 = `cs_user WHERE usr_app_type = 1`，用框架已有 **DictCrudController 通用 CRUD** 托起「管理员管理」页（过滤 `app_type=1`），零额外开发。
- **FR-4.2** 仅持有「用户管理」权限的角色可新建 / 禁用 / 删除其他管理员；新建 → 插 `cs_user(app_type=1)` + 插 `cs_relation` 绑角色。
- **FR-4.3** 删除 / 禁用管理员前校验：不能操作自己；不能操作 `r_systemed=1` 的超级管理员角色本身（防误删种子角色定义）。
- **FR-4.4** **锁死最后一个超管**：系统内仅剩 1 个 `r_level=0` 绑定时，禁止删除 / 禁用该管理员，返回明确错误提示。

### FR-5 权限鉴权机制
- **FR-5.1** `PermissionMiddleware` 在 `app_type=1` 路由上按当前管理员的 `cs_relation → cs_role_permission → cs_function_detail` 做注解级鉴权；`r_level=0` 走全放行快路径。
- **FR-5.2** 无权限访问返回统一 403 结构，前端按权限隐藏无权菜单/按钮（后端鉴权为硬边界，前端隐藏为体验优化）。

### FR-6 审计日志（隐私合规兜底）
- **FR-6.1** 所有跨 `user` 账户的敏感操作写 `cs_user_log`：
  - 字段：`ul_app_type = 1`、`ul_user = 操作管理员 id`、`ul_module / ul_controller / ul_action`、`ul_extend`（JSON 存目标用户 id + 变更前后数据）、`ul_remark`。
  - 覆盖动作：禁用/启用/删除用户、重置用户密码、改全局配置、管角色/权限、创建/删除管理员。
- **FR-6.2** 审计日志仅超管可读（或具备「审计查看」独立权限点），不可篡改、不可删除（或仅归档）。

---

## 6. 数据模型变更

### 6.1 结论
**本期不新建任何表。** 所有 RBAC 表（`cs_user / cs_role / cs_function / cs_function_detail / cs_menu / cs_role_permission / cs_user_permission / cs_relation / cs_user_log`）已存在于 `01-base.sql`。

`usr_join_*` / `r_join_*` 列**留空**（无租户 / 无组织），仅前向兼容位，禁止误填。

### 6.2 种子数据清单（初始化脚本增量）
| 表 | `app_type` | 关键值 | 说明 |
| --- | --- | --- | --- |
| `cs_user` | 1 | `usr_account='admin'`, `usr_state=1`, 强哈希密码 | 初始超管账号 |
| `cs_role` | 1 | `r_level=0`, `r_systemed=1`, `r_name='超级管理员'` | 种子超管角色 |
| `cs_relation` | 1 | `rel_user=admin.id`, `rel_role=超管.id`, `rel_role_level=0` | 账号-角色绑定 |
| `cs_role` | 1 | `r_level=1`, `r_name='运营'` | 运营角色（可选种子） |
| `cs_role` | 1 | `r_level=2`, `r_name='客服'` | 客服角色（可选种子） |
| `cs_menu` | 1 | admin 菜单树（用户管理 / 全局 Agent·Session / Skill 库 / MCP 模板 / 计费大盘 / 全局配置 / 管理员管理） | 菜单权限数据 |
| `cs_function` + `cs_function_detail` | 1 | 各 admin 功能的 `module/controller/action` 编码 | 功能权限点 |
| `cs_role_permission` | 1 | 超管全授权 / 运营·客服子集 | 角色-功能绑定 |

> 注：运营 / 客服角色为「可选种子」——若二期才启用多角色，可仅种子超管，运营/客服角色与权限点延后补。本期 RBAC 机制必须就绪，角色数量可渐进。

---

## 7. 隐私与合规

- **P-1（个人信息保护法）**：Admin 跨 `user` 账户运营以 `user_id` 为硬边界；**会话内容查看**不属本期（见 Non-goals 模拟登录），若未来开放须单独权限开关 + 全量审计，默认关闭。
- **P-2**：所有跨用户写操作（禁用/删除/重置密码/改配置/管角色）强制写 `cs_user_log`，审计日志不可篡改。
- **P-3**：`admin ≠ user` 双重卡死（数据模型唯一键 + 中间件 `app_type` 边界），杜绝身份越权。
- **P-4**：初始超管弱口令风险通过「首次登录强制改密」（FR-1.5）兜底。

---

## 8. 验收标准

| 编号 | 标准 |
| --- | --- |
| AC-1 | 初始化脚本执行后，`cs_user` 存在 1 条 `app_type=1` 的 admin，`cs_relation` 绑定超管角色；可用该账号登录 `/admin`。 |
| AC-2 | 用 `app_type=4` 的 user 账号走 `/admin/login` 被拒绝；admin 账号走 `/user/login` 被拒绝。 |
| AC-3 | 超管首次登录被强制改密，未改密前无法进入后台其他页。 |
| AC-4 | 运营角色登录后，用户管理可禁用/启用/重置密码，但「删除用户 / 改全局配置 / 管角色」入口隐藏且接口返回 403。 |
| AC-5 | 客服角色登录后，仅可见查看类页面，任何写操作接口返回 403。 |
| AC-6 | 系统内仅剩 1 个超管绑定时，删除/禁用该超管被拒绝并提示「不能删除最后一个超级管理员」。 |
| AC-7 | 执行禁用/删除用户、重置密码、改全局配置、管角色任一操作，`cs_user_log` 均新增 1 条记录，含操作人/目标/变更数据。 |
| AC-8 | 后台「管理员管理」页仅列出 `app_type=1` 账户，新建管理员自动建 `cs_user(app_type=1)` + `cs_relation` 绑定。 |

---

## 9. 风险与待定项（Open Questions）

| 项 | 状态 | 说明 |
| --- | --- | --- |
| 运营 / 客服角色是否本期种子 | 待定 | 机制必须就绪，角色数量可渐进；建议本期至少种子超管，运营/客服随运营分工出现再补 |
| 初始 admin 默认口令策略 | 待定 | seed 口令应随机生成并打印到部署日志 / 环境变量，首次登录强制改密兜底 |
| 审计日志留存周期与只读化 | 待定 | 是否独立表分区 / 归档策略，需与 DBA 对齐 |
| admin 端菜单 `module/controller/action` 编码全集 | 待补 | 需结合 Admin 端全部功能（用户管理 / Skill / MCP / 计费 / 全局配置）梳理 `cs_function_detail` 全集，作为后续 Admin PRD 的输入 |

---

## 10. 关联文档
- `01-product-requirements.md` —— §5 关键决策（纯单用户、app_type 分区）、§7 Admin 后台二期占位
- `02-technical-architecture.md` —— 中间件链（Request → TokenSession → Permission）
- `06-pi-agent-gateway-design.md` —— gateway 的 admin `ServiceContext` 隔离（admin session 按目标 user 的 session keyed）
- 后续：`08-admin-user-management.md`（跨用户操作边界 + 隐私）、`09-admin-ops-modules.md`（Skill / MCP / 计费 / 全局配置）

---

> 风紧，扯呼！（决策记录：Admin 为系统 seed 生成、Admin 后台具备 RBAC、admin 不能兼 user 须分开注册；模型为 app_type 分区 + user_id 隔离，无租户维度）
