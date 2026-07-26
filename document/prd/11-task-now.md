# 任务文档 · NOW 阶段（本迭代）

> 版本：v1.0 | 状态：待排期评审 | 日期：2026-07-25
> 定位：将 `10-functional-planning.md` §3 NOW 路线图落为可追踪任务。每个任务遵循 `.agents/08-work-documentation.md` 任务文档模板（7 节点 + 技术开发内容 + 工时评估）。
> ⚠️ 工时均为**估算值（人日）**，需负责人评审后锁定；影响范围代码路径为工程预估，实施前以实际代码为准。

---

## 任务索引

| 编号 | 任务 | 所属端 | 估算工时 | 依赖 |
|------|------|--------|----------|------|
| T-U1 | R-001 鉴权 Session 改造收尾 | 用户端 | 3 | 无 |
| T-U2 | R-008 归档二次确认弹窗 | 用户端 | 1 | 无 |
| T-U3 | R-STORE 存储上限控制逻辑 | 用户端 | 2 | 无 |
| T-U4 | R-013 Agent 复制 / 模板 | 用户端 | 2 | 无 |
| T-U5 | R-014 会话搜索 | 用户端 | 2 | 无 |
| T-U6 | R-016 导出会话（MD/JSON） | 用户端 | 1.5 | 无 |
| T-U7 | 密码修改 | 用户端 | 1.5 | cs_user 已就绪 |
| T-A1 | 07 RBAC 账号与权限落地 | 管理端 | 5 | 无 |
| T-A2 | 08 用户管理落地 | 管理端 | 4 | T-A1 |
| T-A3 | 09 运营模块落地 | 管理端 | 5 | T-A1 |
| T-A4 | cs_mcp_template 模板治理 | 管理端 | 2 | 无 |
| T-X1 | 通知通道 MVP（站内信+邮件） | 跨端 | 4 | 无 |

**NOW 合计估算：约 33 人日（未含联调/测试缓冲）。**

---

## T-U1 · R-001 鉴权 Session 改造收尾

- **任务概述**：将现有 JWT 鉴权切换为 Session + Redis 鉴权，token 优先取请求头 `token` 字段、兜底 Cookie；打通注册/登录/登出与多设备独立 Session。
- **功能描述**：`AuthController`/`AuthService` 改用 Redis 存储 Session；登录签发、登出销毁；中间件从请求头 `token` 取 SessionId，缺失时回退 Cookie；`usr_app_type` 区分 user(4)/admin(1)。
- **所属模块**：用户账号体系（4.1）。
- **功能入口**：`/login`、`/register`、`/logout`（前端 `ui/pages/login.html`、`ui/pages/agents.html` 等受保护路由）。
- **依赖项**：Redis 服务；`cs_user` 已合并（D5）；`cs_session` 表（02 SQL）。
- **影响范围**：`service/app/Http/Controller/Auth/*`、`AuthService`、Session 中间件、`cs_user` 认证相关字段；配置文件 `config/redis.php`、`config/authenticate.php`。
- **输出成果**：注册/登录/登出可用；不同用户数据隔离；多设备 Session 不互踢；提交前补鉴权注解/白名单/登录态/数据范围审计（见 `.agents/14`、`.agents/15`）。

> 技术开发内容：移除 JWT 依赖，引入 Hyperf Session（`hyperf/session`）+ Redis 适配器；`AuthMiddleware` 解析优先级 `header.token → Cookie`；登录写 `cs_session`（user_id、token、expire）；登出删键。

---

## T-U2 · R-008 归档二次确认弹窗

- **任务概述**：手动归档增加二次确认弹窗，确认后移入归档区、只读不可恢复。
- **功能描述**：历史会话页「归档」按钮触发 danger 风格 Modal，文案提示不可恢复，确认后调用归档接口。
- **所属模块**：会话与聊天（4.3）。
- **功能入口**：`ui/pages/sessions.html` 操作列「归档」；交互规范见 `03-ui-style-guide.md` §5.11。
- **依赖项**：归档接口（后端已部分具备）。
- **影响范围**：`ui/pages/sessions.html`、对应 Angular 组件、归档 Service；仅前端确认交互，后端 `archived_time` 写入已存在。
- **输出成果**：点击归档→二次确认→移入归档区→只读查看；无不可逆误删。

> 技术开发内容：基于 ng-alain `NzModalService` 封装确认弹窗，复用 §5.11 样式；确认回调调用 `POST /sessions/{id}/archive`。

---

## T-U3 · R-STORE 存储上限控制逻辑

- **任务概述**：活跃会话 ≤100、归档 ≤50；超限**拒绝创建/分叉/归档**，不自动清理。
- **功能描述**：创建/分叉会话前校验活跃计数；归档前校验归档区计数；超限返回明确错误并前端置灰按钮（见 `03-ui-style-guide.md` §5.12）。
- **所属模块**：会话与聊天（4.3）。
- **功能入口**：`ui/pages/sessions.html`、`ui/pages/chat.html` 新建/分叉按钮。
- **依赖项**：`cs_sessions` 状态计数。
- **影响范围**：`service` 会话创建/分叉/归档 Logic、全局配置读取（`cs_system_config` 上限值）；前端按钮禁用逻辑。
- **输出成果**：超限场景拒绝并提示；上限值可由 Admin 全局配置（见 T-A3）。

> 技术开发内容：在 `SessionLogic::create/fork/archive` 前置计数校验；配置读取走 `cs_system_config`（key 如 `active_session_limit`/`archive_limit`）。

---

## T-U4 · R-013 Agent 复制 / 模板

- **任务概述**：Agent 列表「复制」克隆 agent+skill+mcp 三张表行；配置页「另存为模板」。
- **功能描述**：复制接口事务内克隆 `cs_agents` 及关联 `cs_agent_skill`、`cs_mcp_config`；模板存为可复用预设。
- **所属模块**：Agent 管理（4.2）。
- **功能入口**：`ui/pages/agents.html` 操作列「复制」；Agent 配置页「另存为模板」入口。
- **依赖项**：`cs_agents`/`cs_agent_skill`/`cs_mcp_config` 结构（02 SQL）。
- **影响范围**：`service/app/Logic/Agent/*`、`AgentController`、复制/模板 Service。
- **输出成果**：一键复制生成等价 Agent；模板可被新 Agent 引用；事务一致。

> 技术开发内容：事务包裹三表插入；模板以 `cs_agents` 标记位或独立预设表实现（待实现时定）。

---

## T-U5 · R-014 会话搜索

- **任务概述**：历史页搜索框 + 时间筛选，检索 `cs_messages`。
- **功能描述**：按关键词（消息内容）+ 时间范围检索所属会话；分页返回。
- **所属模块**：会话与聊天（4.3）。
- **功能入口**：`ui/pages/sessions.html` 搜索栏 + 时间筛选。
- **依赖项**：`cs_messages` 文本检索能力。
- **影响范围**：`service` 会话检索 Logic/接口、索引；前端搜索组件。
- **输出成果**：可关键词/时间检索历史会话；结果可续聊/分叉。

> 技术开发内容：MySQL `LIKE` 或全文索引检索 `cs_messages.msg_content`；按 `session_id` 聚合去重；时间走 Unix 秒（D7）。

---

## T-U6 · R-016 导出会话（MD/JSON）

- **任务概述**：历史页「导出」序列化 `cs_messages` 为 Markdown / JSON。
- **功能描述**：导出接口读取会话消息，按模板生成 MD 或 JSON 下载。
- **所属模块**：会话与聊天（4.3）。
- **功能入口**：`ui/pages/sessions.html` 操作列「导出」。
- **依赖项**：`cs_messages` 结构。
- **影响范围**：`service` 导出 Service、响应头 `Content-Disposition`；前端下载触发。
- **输出成果**：导出文件含完整消息流（含 thinking/tool 标记）；MD 可读、JSON 可解析。

> 技术开发内容：Service 拼装消息→MD 模板 / `json_encode`；流式或临时文件返回，注意大会话内存。

---

## T-U7 · 密码修改

- **任务概述**：设置页改密，校验旧密 + 强口令策略，写 `cs_user`。
- **功能描述**：旧密码校验、新密码强度校验（≥8 位等）、更新 `usr_password`。
- **所属模块**：用户设置（4.7）/ 账号体系（4.1）。
- **功能入口**：`ui/pages/settings.html`「密码修改」表单。
- **依赖项**：`cs_user`（D5 已合并）。
- **影响范围**：`service` 密码修改 Service/接口、密码哈希；前端表单 + 校验。
- **输出成果**：改密成功并重新登录或续期；弱口令被拒。

> 技术开发内容：复用注册校验规则；旧密 `Hash::check`；新密 `password_hash`；写 `usr_password` + `usr_update_time`。

---

## T-A1 · 07 RBAC 账号与权限落地

- **任务概述**：Admin 账号 seed、三档角色、功能级权限点、管理员管理、审计日志；`admin≠user` 由数据模型+中间件卡死。
- **功能描述**：`01-base.sql` 已 seed 超管+三档角色；实现 `PermissionMiddleware` 按注解鉴权；后台管理员 CRUD（过滤 app_type=1）；锁死最后超管；敏感操作写 `cs_user_log`。
- **所属模块**：Admin 账号与 RBAC（07）。
- **功能入口**：`/admin/login`、`/admin/admins`（见 `ui/admin/admins.html`、`ui/admin/roles.html`）。
- **依赖项**：框架 RBAC 表（`cs_role`/`cs_function`/`cs_function_detail`/`cs_menu`/`cs_role_permission`/`cs_user_permission`/`cs_relation`/`cs_user_log`）已就绪；`DictCrudController` 通用 CRUD（受保护文件，勿改）。
- **影响范围**：`service/app/.../Admin/*`、`PermissionMiddleware`、seed 脚本、审计写入；前端 `ui/admin/*`。
- **输出成果**：超管可登录并强制改密；三档角色功能级鉴权；管理员增删禁启可审计；最后超管不可删。

> 技术开发内容：登录入口限定 `app_type=1`；角色-功能绑定从 13-function/24-permission 初始化；`cs_user_log` 记录跨用户操作；首次登录改密逻辑。

---

## T-A2 · 08 用户管理落地

- **任务概述**：全平台用户列表/详情/禁用/启用/删除/重置密码/跨用户 Agent·Session 干预；会话内容查看为独立默认关闭权限点。
- **功能描述**：用户检索筛选、用量概览、状态操作（软删 `usr_delete_time`）、重置密码写审计、跨用户 Agent/Session 停启/强结束；`view_user_session_content` 权限点默认关。
- **所属模块**：Admin 用户管理（08）。
- **功能入口**：`/admin/users`（见 `ui/admin/users.html`）。
- **依赖项**：T-A1（RBAC 权限底座、审计机制）。
- **影响范围**：`service/app/.../Admin/UserManagement/*`、`cs_user` 状态字段、会话干预接口；前端 `ui/admin/users.html`。
- **输出成果**：运营可处置异常账户；所有跨用户操作可审计；会话内容查看需单独授权且全量审计。

> 技术开发内容：列表/详情走通用 CRUD + 过滤；禁用置 `usr_state` 并停其 Agent/Session；重置密码发临时口令或触发重置；会话内容查看受 `cs_function_detail` 权限点控制。

---

## T-A3 · 09 运营模块落地

- **任务概述**：Skill 库、MCP 模板、计费大盘、全局配置（归档/存储上限）Admin 治理。
- **功能描述**：Skill 库增删改/启用禁用/挂载计数；MCP 模板增删改/启用禁用；计费大盘聚合展示（不扣费）；全局配置写 `cs_system_config`。
- **所属模块**：Admin 运营模块（09）。
- **功能入口**：`/admin/skills`、`/admin/mcp-templates`、`/admin/billing-dashboard`、`/admin/global-config`（见 `ui/admin/skills.html`、`mcp-templates.html`、`billing-dashboard.html`、`global-config.html`）。
- **依赖项**：T-A1（RBAC）；`cs_skill_library`/`cs_mcp_template`/`cs_billing_records`/`cs_system_config`（02 SQL 已建）。
- **影响范围**：`service/app/.../Admin/Ops/*`；`cs_system_config` 读写；前端 `ui/admin/*` 运营页。
- **输出成果**：平台供给可治理；计费大盘仅展示；全局归档/上限生效并被 User 端兜底读取。

> 技术开发内容：Skill/MCP 模板走通用 CRUD + 启用禁用位；大盘聚合 `cs_billing_records`；全局配置读写 `cs_system_config`（secret 类型走环境变量/密文，见 D12）。

---

## T-A4 · cs_mcp_template 模板治理

- **任务概述**：平台级 MCP 模板（09 FR-2 前置）建表与治理界面落地，供 User 端引用。
- **功能描述**：`cs_mcp_template` 已建表（D8）；实现模板 CRUD 与 User 端 Agent 配置引用。
- **所属模块**：MCP 工具配置 / Admin 运营（4.5 / 09）。
- **功能入口**：`/admin/mcp-templates`；User 端 Agent 配置页 MCP 引用。
- **依赖项**：`cs_mcp_template`（02 SQL）；`cs_mcp_config` 关联。
- **影响范围**：`service` MCP 模板 Logic/接口；前端模板管理 + 用户端引用。
- **输出成果**：模板可维护；User 端 Agent 可从模板快速生成 `mcp.json`。

> 技术开发内容：模板 CRUD；`McpConfigGenerator` 支持引用模板 ID 渲染注入参数。

---

## T-X1 · 通知通道 MVP（站内信 + 邮件）

- **任务概述**：统一通知通道，闭环 R-015 前置；支持站内信（MVP 必需）+ 邮件（MVP 必需，默认关闭）。
- **功能描述**：事件→队列→发送 worker；模板 `cs_notify_template`；站内信 `cs_notify_inbox`；日志 `cs_notify_log`；失败指数退避（≤3 次）；同 `(user_id,template_code)` 10 分钟内聚合沉默；邮件凭据走 `cs_system_config` 密文/环境变量。
- **所属模块**：通知通道（10 §4）。
- **功能入口**：用户端设置页「消息中心」读 `cs_notify_inbox`；Admin 全局配置邮件开关。
- **依赖项**：`cs_notify_*`（02 SQL 已建，D10）；队列（Hyperf async queue）。
- **影响范围**：`service/app/.../Notify/*`、队列 worker、邮件驱动；前端消息中心组件。
- **输出成果**：用量预警/密码重置/账户禁用可投递；送达可审计；失败重试；防轰炸。

> 技术开发内容：`NotifyEvent` 投递到 `async queue`；`NotifySender` 按 channel 分发；`cs_notify_log` 记录 status/retry/error；Webhook 预留（Later）。

---

> 风紧，扯呼！（NOW 任务文档 v1.0：12 任务，约 33 人日估算，待评审锁定）
