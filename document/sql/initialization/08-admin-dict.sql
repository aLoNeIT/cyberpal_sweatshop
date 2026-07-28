-- ============================================================================
-- File: 08-admin-dict.sql
-- Project: cyberpal_sweatshop
-- Date: 2026-07-28
-- Desc: Admin 管理后台 DictCrudController 所需的 cs_dict + cs_dict_item 种子数据
--       覆盖：用户/管理员/角色/Skill库/MCP模板
-- Convention:
--   500-600 为 admin 管理后台专用字典号
--   501: cs_user（通用，含 app_type=1 管理员 + app_type=4 用户端用户）
--   502: cs_role
--   503: cs_skill_library
--   504: cs_mcp_template
-- ============================================================================

-- ============================================================
-- 501: cs_user — 通用用户管理（admin 端用于管理 app_type=1/4 的用户）
--      前端渲染时按 usr_state 走 select 映射（1-启用;0-禁用）
--      usr_app_type 默认通过 filter 注入，不在界面展示
-- ============================================================
delete from `cs_dict` where d_id=501;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(501,'用户','User','','usr_');

delete from `cs_dict_item` where di_dict=501;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(501,'ID','id',1,11,0,1,1,11,15,0,80,0,0,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_select`,`di_show_order`)
values(501,'账号','account',6,50,0,15,15,6,120,1,4,'',20);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(501,'姓名','real_name',6,50,0,15,15,0,120,0,0,30);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(501,'手机号','mp',6,255,0,15,15,0,120,1,4,40);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_readonly`,`di_show_width`,`di_select`,`di_filtered`,`di_show_order`)
values(501,'状态','state',1,2,0,15,15,0,80,'1-启用;0-禁用',1,50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(501,'登录时间','login_time',5,20,0,11,1,160,60);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(501,'登录次数','login_num',1,11,0,11,1,100,70);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(501,'创建时间','create_time',5,20,0,11,1,160,80);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(501,'备注','remark',6,255,0,15,0,120,90);

-- ============================================================
-- 502: cs_role — 角色管理
-- ============================================================
delete from `cs_dict` where d_id=502;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(502,'角色','Role','','r_');

delete from `cs_dict_item` where di_dict=502;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(502,'ID','id',1,11,0,1,1,11,15,0,80,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(502,'角色名称','name',6,50,0,15,15,6,150,1,4,20);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(502,'层级','level',1,2,0,15,15,80,'0-超管;1-运营;2-客服',30);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(502,'系统角色','systemed',1,2,0,15,15,80,'0-否;1-是',40);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(502,'状态','state',1,2,0,15,15,80,'1-启用;0-禁用',50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(502,'备注','mark',6,255,0,15,15,200,60);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(502,'创建时间','create_time',5,20,0,11,1,160,70);

-- ============================================================
-- 503: cs_skill_library — Skill 库
-- ============================================================
delete from `cs_dict` where d_id=503;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(503,'Skill库','SkillLibrary','','');

delete from `cs_dict_item` where di_dict=503;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(503,'ID','id',6,36,0,1,11,15,300,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(503,'名称','name',6,255,0,15,15,6,200,1,4,20);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(503,'分类','category',6,64,0,15,15,120,1,1,30);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(503,'路径','path',6,512,0,15,15,200,40);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(503,'启停','enabled',1,2,0,15,15,80,'1-启用;0-禁用',50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(503,'描述','description',8,65535,0,15,15,400,60);

-- ============================================================
-- 504: cs_mcp_template — MCP 模板
-- ============================================================
delete from `cs_dict` where d_id=504;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(504,'MCP模板','McpTemplate','','');

delete from `cs_dict_item` where di_dict=504;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(504,'ID','id',6,36,0,1,11,15,300,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(504,'名称','name',6,255,0,15,15,6,200,1,4,20);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(504,'传输类型','transport',6,32,0,15,15,120,'stdio-stdio;http-http;sse-sse',30);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(504,'命令','command',6,512,0,15,15,200,40);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(504,'启停','enabled',1,2,0,15,15,80,'1-启用;0-禁用',50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(504,'描述','description',8,65535,0,15,15,400,60);
