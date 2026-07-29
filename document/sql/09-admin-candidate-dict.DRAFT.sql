-- ============================================================================
-- File: 09-admin-candidate-dict.DRAFT.sql
-- Project: cyberpal_sweatshop
-- Date: 2026-07-29
-- Status: ⚠️ DRAFT / 候选备用 — 未纳入自动初始化流程
-- Desc: 候选 DictCrudController 字典种子（d_id 505-507）
--       仅当对应 Admin 控制器把 $dictId 改为 505/506/507 时才生效。
--       当前 AgentManagementController / SessionManagementController / ConfigController
--       的 $dictId 均为 0（自定义逻辑），故这些字典行目前为"候备"，不会自动绑定。
-- Convention: 沿用 08-admin-dict.sql 的列定义与风格。
-- 注意:
--   - cs_agents / cs_sessions 的时间字段为 BIGINT 秒级时间戳；
--     DictCrudController 的日期渲染(di_type=5)默认按 DATETIME 处理，
--     迁移前需确认/适配时间戳格式（或临时改为 di_type=1 以整数展示）。
--   - cs_system_config 为 KV 配置表（cfg_value 为 JSON），并非标准 CRUD 实体，
--     转为 DictCrudController 驱动收益有限，标注 [不推荐]，建议保留自定义 ConfigController。
-- ============================================================================

-- ============================================================
-- 505: cs_agents — Agent 定义（候选；当前 AgentManagementController 用自定义逻辑）
-- ============================================================
delete from `cs_dict` where d_id=505;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(505,'Agent','Agent','','');

delete from `cs_dict_item` where di_dict=505;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(505,'ID','id',6,36,0,1,11,15,300,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(505,'所属用户','user_id',1,11,0,15,15,100,20);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(505,'名称','name',6,255,0,15,15,6,200,1,4,30);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(505,'描述','description',8,65535,0,15,15,400,40);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(505,'系统提示词','system_prompt',8,65535,0,15,15,400,50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(505,'追加提示词','append_system_prompt',8,65535,0,15,15,400,60);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(505,'LLM提供商','provider',6,64,0,15,15,120,70);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(505,'模型','model',6,128,0,15,15,120,80);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(505,'思考深度','thinking',6,32,0,15,15,120,'low-低;medium-中;high-高',90);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(505,'工具白名单','tools_whitelist',6,512,0,15,15,200,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(505,'工具黑名单','tools_blacklist',6,512,0,15,15,200,110);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(505,'Profile','profile_name',6,255,0,15,15,120,120);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(505,'状态','status',6,32,0,15,15,120,'offline-离线;online-在线;error-错误',130);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(505,'创建时间','create_time',5,20,0,11,1,160,140);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(505,'更新时间','update_time',5,20,0,11,1,160,150);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(505,'删除时间','delete_time',5,20,0,11,1,160,160);

-- ============================================================
-- 506: cs_sessions — 会话（候选；当前 SessionManagementController 用自定义逻辑）
-- ============================================================
delete from `cs_dict` where d_id=506;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(506,'会话','Session','','');

delete from `cs_dict_item` where di_dict=506;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(506,'ID','id',6,36,0,1,11,15,300,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(506,'所属用户','user_id',1,11,0,15,15,100,20);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(506,'Agent','agent_id',6,36,0,15,15,120,30);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(506,'标题','title',6,512,0,15,15,6,200,1,4,40);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(506,'OMP会话ID','omp_session_id',6,255,0,15,15,160,50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(506,'状态','status',6,32,0,15,15,120,'active-活跃;archived-归档;deleted-删除',60);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(506,'模式','mode',6,32,0,15,15,120,'normal-普通;resumed-恢复;forked-分叉',70);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(506,'父会话','parent_session_id',6,36,0,15,15,120,80);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(506,'消息数','message_count',1,11,0,15,15,100,90);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(506,'最近用量','last_usage',8,65535,0,11,1,200,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(506,'归档时间','archived_time',5,20,0,11,1,160,110);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(506,'创建时间','create_time',5,20,0,11,1,160,120);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(506,'更新时间','update_time',5,20,0,11,1,160,130);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(506,'删除时间','delete_time',5,20,0,11,1,160,140);

-- ============================================================
-- 507: cs_system_config — 全局配置 KV 表 [不推荐转 DictCrudController]
--       cfg_value 为 JSON，属 KV 设置存储，并非固定列标准 CRUD 实体；
--       建议保留自定义 ConfigController。此处仅留候备用种子。
-- ============================================================
delete from `cs_dict` where d_id=507;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(507,'系统配置','SystemConfig','','cfg_');

delete from `cs_dict_item` where di_dict=507;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(507,'ID','cfg_id',1,11,0,1,1,11,15,0,80,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(507,'配置键','cfg_key',6,64,0,15,15,6,200,1,4,20);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(507,'配置值','cfg_value',8,65535,0,15,15,400,30);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(507,'类型','cfg_type',1,2,0,15,15,120,'1-字符串;2-整数;3-布尔;4-JSON;5-密钥',40);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(507,'分组','cfg_group',6,32,0,15,15,120,50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(507,'说明','cfg_remark',6,255,0,15,15,200,60);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(507,'创建时间','create_time',5,20,0,11,1,160,70);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(507,'更新时间','update_time',5,20,0,11,1,160,80);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(507,'删除时间','delete_time',5,20,0,11,1,160,90);
