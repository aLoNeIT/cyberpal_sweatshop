-- ============================================================================
-- File: 05-menu.sql
-- Project: cyberpal_sweatshop
-- Date: 2026-07-28
-- Desc: cs_menu 种子数据 — Admin 管理后台(mn_app_type=1) + User 用户端(mn_app_type=4)
-- Source: 基于 PRD 07-admin-account-rbac / 08-admin-user-management /
--         09-admin-ops-modules / 01-product-requirements 的页面与功能规划
-- Convention:
--   mn_code: 两位一级，MN 开头（如 MN01）
--   mn_parented: 0=叶子节点 1=父级节点（有子菜单）
--   mn_style: 0=不显示 1=侧边栏菜单 2=tabBar菜单 4=网格样式
--   mn_path: 父-子-孙，用 - 分隔
--   mn_level: 菜单层级 0/1/2/3...
--   mn_state: 0=关闭 1=开启
-- ============================================================================

-- ============================================================
-- Admin 管理后台菜单 (mn_app_type=1)
-- ============================================================
delete from `cs_menu` where mn_app_type=1;

-- ----------------------------
-- MN00 系统（隐藏菜单，用于个人信息/改密等入口）
-- ----------------------------
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('系统','MN00','','MN00',1,1,1,9000,1,0,'','');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('个人信息','MN0001','MN00','MN00-MN0001',0,1,1,9010,2,0,'/admin/profile','anticon-user');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('修改密码','MN0002','MN00','MN00-MN0002',0,1,1,9020,2,0,'/admin/change-password','anticon-lock');

-- ----------------------------
-- MN06 仪表盘（PRD 7.1: 全平台运营数据总览，登录后默认首页）
-- ----------------------------
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('仪表盘','MN06','','MN06',0,1,1,9060,1,1,'/admin/dashboard','anticon-dashboard');

-- ----------------------------
-- MN01 用户管理（08 FR-1~FR-5: 列表/详情/禁用/启用/删除/重置密码）
-- ----------------------------
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('用户管理','MN01','','MN01',1,1,1,9100,1,1,'','anticon-team');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('用户列表','MN0101','MN01','MN01-MN0101',0,1,1,9110,2,1,'/admin/user','anticon-bars');

-- ----------------------------
-- MN02 Agent 管理（08 FR-6: 全局查看/干预 Agent）
-- ----------------------------
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('Agent管理','MN02','','MN02',1,1,1,9200,1,1,'','anticon-robot');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('Agent列表','MN0201','MN02','MN02-MN0201',0,1,1,9210,2,1,'/admin/agent','anticon-bars');

-- ----------------------------
-- MN03 会话管理（08 FR-6~FR-7: 全局查看/干预 Session + 会话内容查看）
-- ----------------------------
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('会话管理','MN03','','MN03',1,1,1,9300,1,1,'','anticon-message');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('会话列表','MN0301','MN03','MN03-MN0301',0,1,1,9310,2,1,'/admin/session','anticon-bars');

-- ----------------------------
-- MN04 运营管理（09 FR-1~FR-3: Skill 库 / MCP 模板 / 计费大盘）
-- ----------------------------
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('运营管理','MN04','','MN04',1,1,1,9400,1,1,'','anticon-dashboard');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('Skill库','MN0401','MN04','MN04-MN0401',0,1,1,9410,2,1,'/admin/skill','anticon-code');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('MCP模板','MN0402','MN04','MN04-MN0402',0,1,1,9420,2,1,'/admin/mcp-template','anticon-api');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('计费大盘','MN0403','MN04','MN04-MN0403',0,1,1,9430,2,1,'/admin/billing','anticon-bar-chart');

-- ----------------------------
-- MN05 系统设置（07 FR-4: 管理员管理 + 角色管理; 09 FR-4: 全局配置; 07 FR-6: 审计日志）
-- ----------------------------
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('系统设置','MN05','','MN05',1,1,1,9500,1,1,'','anticon-setting');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('管理员管理','MN0501','MN05','MN05-MN0501',0,1,1,9510,2,1,'/admin/admin-account','anticon-user-add');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('角色管理','MN0502','MN05','MN05-MN0502',0,1,1,9520,2,1,'/admin/role','anticon-safety-certificate');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('全局配置','MN0503','MN05','MN05-MN0503',0,1,1,9530,2,1,'/admin/config','anticon-tool');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('审计日志','MN0504','MN05','MN05-MN0504',0,1,1,9540,2,1,'/admin/audit-log','anticon-file-search');

-- ============================================================
-- User 用户端菜单 (mn_app_type=4) — 前端 SPA 路由参考，非 RBAC 管控
-- 对应 01-product-requirements §4.2~§4.7 的功能模块
-- ============================================================
delete from `cs_menu` where mn_app_type=4;

insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('首页','MN00','','MN00',0,4,1,100,1,1,'/dashboard','anticon-home');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('Agent','MN01','','MN01',0,4,1,200,1,1,'/agent','anticon-robot');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('会话','MN02','','MN02',0,4,1,300,1,2,'/session','anticon-message');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('消费','MN03','','MN03',0,4,1,400,1,2,'/billing','anticon-account-book');
insert into `cs_menu`(`mn_title`,`mn_code`,`mn_parent_code`,`mn_path`,`mn_parented`,`mn_app_type`,`mn_state`,`mn_sort`,`mn_level`,`mn_style`,`mn_uri`,`mn_icon`)
                values('设置','MN04','','MN04',0,4,1,500,1,1,'/settings','anticon-setting');
