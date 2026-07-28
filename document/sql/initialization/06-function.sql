-- ============================================================================
-- File: 06-function.sql
-- Project: cyberpal_sweatshop
-- Date: 2026-07-28
-- Desc: cs_function + cs_function_detail 种子数据 — Admin 管理后台(mn_app_type=1)
-- Source: 基于 PRD 07/08/09/01 的页面功能规划 + 05-menu.sql 的菜单结构
-- Convention:
--   fn_code: FN{菜单路径} + 两位序列号 = FN{menu后四位}{seq}
--     00=菜单查看 01=新增 02=编辑 03=删除 04=详情 05=启用禁用 06=其他
--     e.g. MN0101 → FN010100(菜单查看) FN010104(详情) FN010105(禁用启用)
--   fn_style: 0=不显示 1=上方按钮 2=行内按钮 4=列表按钮
--   fn_type: 按钮样式描述（default/primary/danger）
--   function_detail: fd_module='admin', fd_controller/fd_action 对应路由
-- ============================================================================

-- ============================================================
-- Admin 管理后台功能权限 (fn_app_type=1)
-- ============================================================
delete from `cs_function` where fn_app_type=1;
delete from `cs_function_detail` where fd_app_type=1;

-- ============================================================
-- MN0001 个人信息（仅菜单查看+编辑入口）
-- ============================================================
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN000100','菜单查看',1,'MN0001',1,0,1000,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN000101','编辑个人信息',1,'MN0001',1,1,1000,'default');

insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN000100','admin','profile','index',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN000101','admin','profile','edit',1);

-- ============================================================
-- MN0002 修改密码
-- ============================================================
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN000200','菜单查看',1,'MN0002',1,0,1000,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN000201','修改密码',1,'MN0002',1,1,1000,'default');

insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN000200','admin','profile','password',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN000201','admin','profile','changePassword',1);

-- ============================================================
-- MN0101 用户列表（用户管理 08 FR-1~FR-5）
--   角色权限：超管=全部 | 运营=查看/禁用启用/重置密码(不可删除) | 客服=仅查看
-- ============================================================
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN010100','菜单查看',1,'MN0101',1,0,1000,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN010104','详情',1,'MN0101',1,2,1,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN010105','禁用/启用',1,'MN0101',1,2,500,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN010106','重置密码',1,'MN0101',1,2,1000,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN010103','删除用户',1,'MN0101',1,2,9999,'danger');

insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN010100','admin','user','index',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN010104','admin','user','detail',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN010105','admin','user','toggleStatus',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN010106','admin','user','resetPassword',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN010103','admin','user','delete',1);

-- ============================================================
-- MN0201 Agent 列表（08 FR-6: 全局查看/干预 Agent）
--   角色权限：超管/运营=全部 | 客服=仅查看
-- ============================================================
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN020100','菜单查看',1,'MN0201',1,0,1000,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN020104','详情',1,'MN0201',1,2,1,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN020105','停止Agent',1,'MN0201',1,2,1000,'danger');

insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN020100','admin','agent','index',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN020104','admin','agent','detail',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN020105','admin','agent','stop',1);

-- ============================================================
-- MN0301 会话列表（08 FR-6~FR-7: 全局查看/干预 Session）
--   角色权限：超管=全部(含查看内容) | 运营=查看/干预(不含内容) | 客服=仅查看
-- ============================================================
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN030100','菜单查看',1,'MN0301',1,0,1000,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN030104','详情（元数据）',1,'MN0301',1,2,1,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN030105','强制结束会话',1,'MN0301',1,2,1000,'danger');
-- 查看会话内容 — 独立权限点，默认不授任何角色（08 FR-7.1）
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN030106','查看会话内容',1,'MN0301',1,2,9999,'danger');

insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN030100','admin','session','index',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN030104','admin','session','detail',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN030105','admin','session','terminate',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN030106','admin','session','viewContent',1);

-- ============================================================
-- MN0401 Skill 库（09 FR-1: Skill 库治理）
--   角色权限：超管=CRUD | 运营/客服=仅查看（09 §4.1 保守策略）
-- ============================================================
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN040100','菜单查看',1,'MN0401',1,0,1000,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN040101','新增',1,'MN0401',1,1,1000,'primary');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN040102','编辑',1,'MN0401',1,2,500,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN040103','删除',1,'MN0401',1,2,9999,'danger');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN040105','启用/禁用',1,'MN0401',1,2,1000,'default');

insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN040100','admin','skill','index',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN040101','admin','skill','add',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN040102','admin','skill','edit',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN040103','admin','skill','delete',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN040105','admin','skill','toggle',1);

-- ============================================================
-- MN0402 MCP 模板（09 FR-2: MCP 模板管理）
--   角色权限：超管=CRUD | 运营/客服=仅查看（09 §4.1 保守策略）
-- ============================================================
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN040200','菜单查看',1,'MN0402',1,0,1000,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN040201','新增',1,'MN0402',1,1,1000,'primary');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN040202','编辑',1,'MN0402',1,2,500,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN040203','删除',1,'MN0402',1,2,9999,'danger');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN040205','启用/禁用',1,'MN0402',1,2,1000,'default');

insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN040200','admin','mcpTemplate','index',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN040201','admin','mcpTemplate','add',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN040202','admin','mcpTemplate','edit',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN040203','admin','mcpTemplate','delete',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN040205','admin','mcpTemplate','toggle',1);

-- ============================================================
-- MN0403 计费大盘（09 FR-3: 仅查看，不扣费）
--   角色权限：超管/运营=查看 | 客服=查看
-- ============================================================
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN040300','菜单查看',1,'MN0403',1,0,1000,'default');

insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN040300','admin','billing','index',1);

-- ============================================================
-- MN0501 管理员管理（07 FR-4: 管理员账号管理）
--   角色权限：超管=全部（含锁死超管保护）
-- ============================================================
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN050100','菜单查看',1,'MN0501',1,0,1000,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN050101','新增管理员',1,'MN0501',1,1,1000,'primary');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN050105','禁用/启用',1,'MN0501',1,2,500,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN050106','重置管理员密码',1,'MN0501',1,2,1000,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN050103','删除管理员',1,'MN0501',1,2,9999,'danger');

insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN050100','admin','adminAccount','index',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN050101','admin','adminAccount','add',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN050105','admin','adminAccount','toggleStatus',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN050106','admin','adminAccount','resetPassword',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN050103','admin','adminAccount','delete',1);

-- ============================================================
-- MN0502 角色管理（07 FR-3: RBAC 角色集管理 + 权限配置）
--   角色权限：超管=全部
-- ============================================================
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN050200','菜单查看',1,'MN0502',1,0,1000,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN050201','新增',1,'MN0502',1,1,1000,'primary');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN050202','编辑',1,'MN0502',1,2,500,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN050203','删除',1,'MN0502',1,2,9999,'danger');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN050204','权限配置',1,'MN0502',1,2,1000,'default');

insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN050200','admin','role','index',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN050201','admin','role','add',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN050202','admin','role','edit',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN050203','admin','role','delete',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN050204','admin','role','permission',1);

-- ============================================================
-- MN0503 全局配置（09 FR-4: 归档天数/会话上限/归档上限）
--   角色权限：超管=查看+编辑 | 运营/客服=不可改
-- ============================================================
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN050300','菜单查看',1,'MN0503',1,0,1000,'default');
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN050301','编辑配置',1,'MN0503',1,1,1000,'default');

insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN050300','admin','config','index',1);
insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN050301','admin','config','edit',1);

-- ============================================================
-- MN0504 审计日志（07 FR-6: 审计日志查看，仅超管可读）
--   角色权限：超管=查看 | 运营/客服=不可见
-- ============================================================
insert into cs_function(fn_code,fn_name,fn_state,fn_menu_code,fn_app_type,fn_style,fn_sort,fn_type) values('FN050400','菜单查看',1,'MN0504',1,0,1000,'default');

insert into cs_function_detail(fd_function_code,fd_module,fd_controller,fd_action,fd_app_type) values('FN050400','admin','auditLog','index',1);
