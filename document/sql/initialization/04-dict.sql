-- ============================================================================
-- File: 04-dict.sql
-- Source: 从 hongshan_cloudscript/document/sql/initialization/11-dict.sql 迁移
-- Date: 2026-07-28
-- Note: 本文件内容来自红杉医疗项目，包含 cs_dict / cs_dict_item 种子数据。
--       编号 100-300 为码表、500-1000 为框架表、1000+ 为业务表，
--       导入前请根据 cyberpal_sweatshop 实际需求筛选，医疗专用条目需删除或替换。
-- ============================================================================

--   不要对本文件进行格式化
--   d_tablename使用驼峰命名法
--   100以内不可用 ；
--   100-300为码表;
--   500-1000为框架所需要的表；
--   1000以上为不同业务系统需要的表，若同一个表针对不同应用设计，需要建立不同的字典，而且字典编号按照规范走


--   以下为 码表  100-300

--   证件类型100
delete from `cs_dict` where d_id=101;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(101,'国家','Country','','c_');

delete from `cs_dict_item` where di_dict=101;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_required`)
values(101,'编码','c_code',6,10,0,1,0,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`)
values(101,'名称','c_title',6,50,0,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`)
values(101,'拼音','c_py',6,50,0,15,6);

--   民族102
delete from `cs_dict` where d_id=102;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(102,'民族','Nation','','na_');

delete from `cs_dict_item` where di_dict=102;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_required`)
values(102,'编码','na_code',6,10,0,1,0,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`)
values(102,'名称','na_name',6,50,0,15,6);

--   籍贯（行政区化表）103
delete from `cs_dict` where d_id=103;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(103,'行政区化表','HouseArea','','ha_');
delete from `cs_dict_item` where di_dict=103;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_filtered`,`di_fuzzy`,`di_inputed`,`di_required`)
values(103,'编码','ha_code',6,10,0,1,0,1,1,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_fuzzy`,`di_inputed`,`di_required`)
values(103,'名称','ha_name',6,50,0,1,4,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(103,'简称','ha_shortname',6,50,0,15);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(103,'拼音','ha_pinyin',6,50,0,15);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(103,'简拼','ha_pinyin_short',6,50,0,15);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(103,'城市编码','ha_citycode',6,50,0,15);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(103,'邮政编码','ha_zipcode',6,6,0,15);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_curd`,`di_filtered`,`di_inputed`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`)
values(103,'上级地区','ha_parent',6,15,0,14,103,'HouseArea','ha_code','ha_name','h');


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_show_width`,`di_inputed`,`di_select`)
values(103,'是否拥有下级','ha_child',1,2,0,150,15,'0-否;1-是');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`)
values(103,'级别','ha_level',1,2,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`)
values(103,'路径','ha_path',6,50,0);


--   性别 104
delete from `cs_dict` where d_id=104;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(104,'性别','Sex','','sex_');

delete from `cs_dict_item` where di_dict=104;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_required`)
values(104,'性别编码','sex_code',6,20,0,1,0,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`)
values(104,'性别名称','sex_name',6,50,0,15,6);

-- 基础字典维护字典配置，生成时间：2026-06-01 19:48:47，来源表：cs_hospital_type,cs_job_type,cs_position,cs_merge_dosage_form,cs_classification,cs_dosage_form,cs_usage,cs_frequency,cs_dose,cs_herb_usage,cs_herb_special_require,cs_herb_diagnose,cs_herb_syndrome,cs_illness,cs_symptom；字典编号来源：用户指定从105开始（保留原104性别字典）；字段名保留完整表字段前缀；CRUD位：1刷新、2新增、4修改、8读取、16删除。

-- 医院类型 105：d_name取PRD分类名，d_tablename按cs_hospital_type去掉cs_后转HospitalType，d_prefix使用字段公共前缀dt_。
delete from `cs_dict` where d_id=500;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(500,'菜单表','Menu','','mn_');

delete from `cs_dict_item` where di_dict=500;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(500,'序号','mn_id',1,-1,1,1,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`)
values(500,'应用类型','mn_app_type',1,3,0,'1-平台;2-集团;3-药店;5-渠道;6-开方机构',3);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`)
values(500,'菜单编码','mn_code',6,20,2,6);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(500,'菜单父编码','mn_parent_code',6,20,2,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`)
values(500,'菜单名称','mn_title',6,50,2);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_show_width` )
values(500,'菜单完整路径','mn_path',6,255,2,6,0,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`)
values(500,'排序','mn_sort',1,999999,2,1000);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`)
values(500,'菜单级别','mn_level',1,4,2,6,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_required`,`di_inputed`)
values(500,'是否为父级菜单','mn_parented',1,2,0,'0-否;1-是',0,6,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`)
values(500,'状态','mn_state',1,2,0,'0-关闭;1-开启',1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`)
values(500,'菜单样式','mn_css',6,255,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`)
values(500,'菜单类型','mn_style',1,2,0,'0-不显示;1-侧边栏菜单;2-tabBar菜单',1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`)
values(500,'菜单图标','mn_icon',6,255,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`)
values(500,'菜单地址','mn_uri',6,255,0);


--   功能表501
delete from `cs_dict` where d_id=501;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(501,'功能表','Function','','fn_');

delete from `cs_dict_item` where di_dict=501;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(501,'序号','fn_id',1,-1,0,1,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`)
values(501,'编码','fn_code',6,20,2,6);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(501,'所属菜单编码','fn_menu_code',6,20,0,6,500,'Menu','mn_code','mn_title');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`)
values(501,'功能名称','fn_name',6,50,2,6);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`)
values(501,'应用类型','fn_app_type',1,3,0,'1-平台;2-集团;3-药店;5-渠道;6-开方机构');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`)
values(501,'样式','fn_css',6,255,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`)
values(501,'类型','fn_style',1,2,0,'0-不显示;1-上方按钮;2-行内按钮;4-列表按钮',1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`)
values(501,'状态','fn_state',7,4,0,'0-关闭;1-开启');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_default`)
values(501,'描述按钮类型','fn_type',6,100,2,6,'default');




--   功能表 502
delete from `cs_dict` where d_id=502;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(502,'功能明细表','FunctionDetail','','fd_');

delete from `cs_dict_item` where di_dict=502;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(502,'序号','fd_id',1,-1,0,1,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(502,'功能编码','fd_function_code',6,20,0,6,501,'Function','fn_code','fn_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`)
values(502,'应用类型','fd_app_type',1,3,0,'1-平台;2-集团;3-药店;5-渠道;6-开方机构');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`)
values(502,'权限模块','fd_module',6,50,2,6);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`)
values(502,'权限控制器','fd_controller',6,50,2,6);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`)
values(502,'权限动作','fd_action',6,50,2,6);





--   用户表503
delete from `cs_dict` where d_id=503;
delete from `cs_dict_item` where di_dict=503;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(503,'用户信息','User','','usr_');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,
                            `di_inputed`,`di_show_order`,`di_sort`,`di_show_width`)
values(503,'序号','usr_id',1,-1,0,1,1,9,1,2,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,
                            `di_max`,`di_min`,`di_default`,`di_select`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,
                            `di_show_order`)
values(503,'应用类型','usr_app_type',1,3,0,3,'1-平台;2-集团;3-药店;4-用户;5-渠道;6-开方机构',0,9,15,0,5);


--   `usr_corporation` int(11) NOT NULL DEFAULT '0' COMMENT '集团',
--   `usr_distributor` int(11) NOT NULL DEFAULT '0' COMMENT '渠道',

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`,
                            `di_show_order`,`di_show_width`)
values(503,'账号','usr_account',6,50,0,15,6,40,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_show_order`,`di_filtered`,`di_fuzzy`)
values(503,'姓名','usr_real_name',6,50,0,15,6,40,1,2);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_filtered`,`di_inputed`,`di_show_order`,`di_show_width`)
values(503,'性别','usr_sex',6,10,0,104,'Sex','sex_code','sex_name',0,0,0,50,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_inputed`,`di_show_order`,`di_required`,`di_filtered`,`di_fuzzy`)
values(503,'手机号','usr_mp',6,20,0,'','',15,45,6,1,2);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pwded`,`di_default`,`di_inputed`,`di_show_width`,`di_curd`,`di_show_order`)
values(503,'密码','usr_pwd',6,80,32,1,'68b6b4ab792a4476db8f6937bb4c4d12',0,0,6,20);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,
                            `di_inputed`,`di_curd`,`di_show_order`)
values(503,'盐值','usr_salt',6,4,4,'RzyL',
       0,6,30);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(503,'头像','usr_img_head_file',1,0,-1,0
      ,510,'File','f_id','f_url',0,0,75,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
                            `di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`)
values(503,'头像','usr_img_head_url',9,1,255,0,
       0,0,0,75,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_show_width`)
values(503,'用户备注','usr_remark',8,255,0,14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,
                            `di_required`,`di_show_order`,`di_show_width`)
values(503,'最近登录时间','usr_login_time',5,1,-1,0,8,
       0,140,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,
                            `di_required`,`di_show_order`,`di_show_width`)
values(503,'登录次数','usr_login_num',1,-1,0,8,
       0,150,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,
                            `di_required`,`di_curd`,`di_show_order`,`di_show_width`)
values(503,'登录ip','usr_login_ip',6,50,0,0,
       0,15,160,0);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_show_order`,`di_required`)
values(503,'状态','usr_state',7,2,0,'0-关闭;1-开启',1,15,90,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,`di_show_order`)
values(503,'创建人','usr_create_user',1,-1,0,
       503,'User','usr_id','usr_real_name','create_user',150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,
                            `di_required`,`di_curd`,`di_show_order`,`di_show_width`)
values(503,'创建时间','usr_create_time',5,1,-1,0,9,0,1,170,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,
                            `di_required`,`di_curd`,`di_show_order`,`di_show_width`)
values(503,'更新时间','usr_update_time',5,1,-1,0,8,
       0,0,180,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,
                            `di_required`,`di_curd`,`di_show_order`,`di_show_width`)
values(503,'删除时间','usr_delete_time',5,1,-1,0,0,
       0,0,190,0);




--   用户会话记录504
delete from `cs_dict` where d_id=504;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(504,'用户会话记录','UserSession','','us_');

delete from `cs_dict_item` where di_dict=504;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_show_width`,`di_show_order`,`di_sort`)
values(504,'序号','us_id',1,-1,0,1,1,9,0,1,1);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(504,'应用类型','us_app_type',1,3,0,3,'1-平台;2-集团;3-药店;5-渠道;6-开方机构',6,8,11,0,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(504,'用户','us_user',1,-1,0,
503,'User','usr_id','usr_real_name');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`)
values(504,'会话id','us_session',6,32,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`)
values(504,'登录ip','us_ip',6,50,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`)
values(504,'会话有效期','us_expire_in',1,-1,0,7200);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_curd`,`di_show_order`)
values(504,'创建时间','us_create_time',5,1,-1,0,9,0,1,170);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_curd`,`di_show_order`)
values(504,'删除时间','us_delete_time',5,1,-1,0,0,0,0,190);




--    用户日志  505
delete from `cs_dict` where d_id=505;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(505,'用户日志','UserLog','','ul_');

delete from `cs_dict_item` where di_dict=505;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_sort`)
values(505,'序号','ul_id',1,-1,0,1,1,9,1);



--   角色表506
delete from `cs_dict` where d_id=506;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(506,'角色','Role','','r_');

delete from `cs_dict_item` where di_dict=506;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_sort`,`di_show_width`,`di_show_order`)
values(506,'序号','r_id',1,-1,0,1,1,9,1,0,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_required`,`di_inputed`,`di_curd`,
`di_show_width`,`di_show_order`,`di_app_type`,`di_filtered`,`di_readonly`)
values(506,'应用类型','r_app_type',1,3,0,3,'1-平台',6,15,11,0,2,1,1,4);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_default`,`di_inputed`,`di_show_width`,`di_app_type`)
values(506,'关联表表名称','r_join_table',6,'',0,0,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_default`,`di_inputed`,`di_show_width`,`di_app_type`)
values(506,'关联表表字段','r_join_field',6,'',0,0,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_default`,`di_inputed`,`di_show_width`,`di_app_type`)
values(506,'归属主体','r_join_data',1,'',0,0,1);



insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_fuzzy`,`di_required`,`di_inputed`,`di_show_width`,`di_show_order`)
values(506,'名称','r_name',6,50,2,2,6,15,150,10);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_curd`,
`di_default`,`di_select`,`di_show_width`,`di_show_order`,`di_app_type`)
values(506,'系统级','r_systemed',1,1,-1,0,9,0,15,0,'1-是;0-否',150,15,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_default`
,`di_inputed`,`di_required`,`di_curd`,`di_show_order`,`di_app_type`)
values(506,'等级','r_level',1,1,-1,1,1,15,6,15,16,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_fuzzy`,`di_required`,`di_default`,`di_inputed`,`di_show_order`)
values(506,'备注','r_mark',8,50,2,2,0,'',14,17);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,
`di_default`,`di_curd`,`di_inputed`,`di_filtered`,`di_show_order`)
values(506,'状态','r_state',1,3,0,'0-关闭;1-开启',1,15,15,1,18);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_required`,`di_inputed`,`di_curd`,`di_show_order`)
values(506,'创建人','r_create_user',1,-1,0,503,'User','usr_id','usr_real_name',6,9,11,25);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`,`di_curd`,`di_show_order`)
values(506,'创建时间','r_create_time',5,1,-1,0,9,0,9,30);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`,`di_curd`,`di_show_width`,`di_show_order`)
values(506,'更新时间','r_update_time',5,1,-1,0,8,0,8,0,31);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_show_width`,`di_show_order`)
values(506,'删除时间','r_delete_time',5,1,-1,0,0,32);




--   角色权限关联表507
delete from `cs_dict` where d_id=507;
delete from `cs_dict_item` where di_dict=507;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(507,'角色权限关联表','RolePermission','','rp_');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_sort`)
values(507,'序号','rp_id',1,-1,0,1,1,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(507,'角色','rp_role',1,-1,0,506,'Role','r_id','r_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(507,'功能编码','rp_function_code',1,-1,0,501,'Function','r_id','r_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(507,'应用类型','rp_app_type',1,3,0,3,'1-平台;2-集团;3-药店;5-渠道;6-开方机构',6,8,11,0,10);





--   角色权限关联表508
delete from `cs_dict` where d_id=508;
delete from `cs_dict_item` where di_dict=508;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(508,'角色权限关联表','UserPermission','','up_');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_sort`)
values(508,'序号','up_id',1,-1,0,1,1,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(508,'姓名','up_user',1,-1,0,503,'User','usr_id','usr_real_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(508,'功能编码','up_function_code',1,-1,0,501,'Function','r_id','r_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(508,'应用类型','up_app_type',1,3,0,3,'1-平台;2-集团;3-药店;5-渠道;6-开方机构',6,8,11,0,10);




--   用户角色关联表509
delete from `cs_dict` where d_id=509;
delete from `cs_dict_item` where di_dict=509;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(509,'用户角色关联表','Relation','','rel_');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_sort`)
values(509,'序号','rp_id',1,-1,0,1,1,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(509,'姓名','rel_user',1,-1,0,503,'User','usr_id','usr_real_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(509,'角色','rel_role',1,-1,0,506,'Role','r_id','r_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(509,'应用类型','rel_app_type',1,3,0,3,'1-平台;2-集团;3-药店;5-渠道;6-开方机构',6,8,11,0,10);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`,`di_curd`,`di_default`)
values(509,'角色等级','rel_role_level',5,1,-1,0,9,0,9,1);



--   文件数据表 510
delete from `cs_dict` where d_id=510;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(510,'文件数据表','File','','f_');

delete from `cs_dict_item` where di_dict=510;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_sort`)
values(510,'序号','f_id',1,-1,1,1,1,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(510,'文件名称','f_name',6,100,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(510,'存储路径','f_path',6,500,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(510,'对外地址','f_url',6,500,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(510,'文件类型','f_type',6,11,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`)
values(510,'应用类型','f_app_type',1,3,0,'1-平台;2-集团;3-药店;5-渠道;6-开方机构',3);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`)
values(510,'状态','f_state',1,4,0,'0-未使用;1-正常');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(510,'分组','f_group',6,50,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`)
values(510,'数据序号','f_dataid',1,4,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(510,'来源','f_table',6,50,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(510,'来源字段','f_field',6,50,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(510,'驱动','f_driver',6,50,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`)
values(510,'是否验证权限','f_access',1,4,0,'0-是;1-否');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(510,'创建用户','f_create_user',1,-1,0,
503,'User','usr_id','usr_real_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`)
values(510,'创建时间','f_create_time',5,1,-1,0,8,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`)
values(510,'更新时间','f_update_time',5,1,-1,0,8,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`)
values(510,'删除时间','f_delete_time',5,1,-1,0,8,0);


-- 密钥管理 511：与 cs_api_communicant 凭证、算法及证书字段保持一致；编辑页算法与用途字段只读，证书指纹不在列表及编辑页展示，处理驱动不在列表展示。
delete from `cs_dict` where d_id=511;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(511,'密钥管理','ApiCommunicant','','ac_');

delete from `cs_dict_item` where di_dict=511;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_sort`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(511,'序号','ac_id',1,-1,0,1,1,1,1,6,9,9,100,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_fuzzy`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'凭证名称','ac_name',6,100,0,1,4,6,15,15,180,10,'基础信息');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_fuzzy`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'应用标识','ac_appid',6,64,0,1,4,6,4,15,15,180,20,'基础信息');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pwded`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'应用密钥','ac_appsecret',6,255,0,1,10,10,0,30,'基础信息');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_filtered`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'接入类型','ac_type',1,3,0,'0-其他;2-服务商;3-开方机构','3',1,6,15,15,100,40,'关联信息');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`,`di_remark`)
values(511,'关联对象','ac_join_data',1,-1,0,0,15,15,160,50,'关联信息','接入类型为服务商时选择Provider.p_id并回填Provider、p_id；为机构时选择Hospital.h_id并回填Hospital、h_id');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`,`di_remark`)
values(511,'关联表','ac_join_table',6,100,0,8,8,140,60,'关联信息','由关联对象选择器自动回填关联业务表名');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`,`di_remark`)
values(511,'关联字段','ac_join_field',6,100,0,8,8,140,70,'关联信息','由关联对象选择器自动回填关联业务表主键字段名');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'算法大类','ac_algo_type',1,4,0,'0-无;1-对称加密;2-非对称加密;3-摘要/哈希;4-X509证书','0',4,15,15,120,80,'算法与用途');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`,`di_remark`)
values(511,'具体算法','ac_algo_name',6,32,0,'RSA-RSA;SM2-SM2;AES-AES;SM4-SM4;SHA256-SHA256;SM3-SM3',4,15,15,120,90,'算法与用途','下拉选择RSA、SM2、AES、SM4、SHA256或SM3');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'密钥长度','ac_key_len',1,-1,0,'0-未设置;128-128位;192-192位;256-256位;512-512位;1024-1024位;2048-2048位;3072-3072位;4096-4096位','0',4,15,15,100,100,'算法与用途');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`,`di_remark`)
values(511,'密钥用途','ac_key_usage',6,64,0,'DATA_ENC-数据加密;SIGN_VERIFY-签名验签;AUTH-认证鉴权;DIGEST-摘要',4,15,15,160,110,'算法与用途','下拉选择数据加密、签名验签、认证鉴权或摘要');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'对接方标识','ac_peer_key_id',6,100,0,15,15,160,120,'对接方凭证');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'对接方公钥','ac_peer_public_key',8,-1,0,10,10,0,130,'对接方凭证');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pwded`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'对接方私钥','ac_peer_private_key',8,-1,0,1,10,10,0,140,'对接方凭证');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'对接方证书','ac_peer_cert',8,-1,0,10,10,0,150,'对接方凭证');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'对接方证书指纹','ac_peer_cert_thumbprint',6,128,0,10,15,320,160,'对接方凭证');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pwded`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'对接方私钥密码','ac_peer_key_pwd',6,255,0,1,10,10,0,170,'对接方凭证');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'我方公钥','ac_self_public_key',8,-1,0,10,10,0,180,'我方凭证');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pwded`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'我方私钥','ac_self_private_key',8,-1,0,1,10,10,0,190,'我方凭证');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'我方证书','ac_self_cert',8,-1,0,10,10,0,200,'我方凭证');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'我方证书指纹','ac_self_cert_thumbprint',6,128,0,10,15,320,210,'我方凭证');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pwded`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'我方私钥密码','ac_self_key_pwd',6,255,0,1,10,10,0,220,'我方凭证');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'证书过期时间','ac_cert_expire_time',5,1,1,-1,15,15,160,230,'证书生命周期');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`,`di_remark`)
values(511,'处理驱动','ac_driver',1,-1,0,'0-四川武侯区V0.33协议套件;1-RSA;2-RSA X.509证书;3-SM2;4-AES-256-CBC;5-AES-128-CBC;6-AES-192-CBC;7-AES-256-GCM;8-SM4-ECB;9-SM4-CBC;10-SHA-256摘要;11-SM3摘要','0',6,14,15,100,240,'通信配置','稳定编号映射 key.communicant_drivers：0-sichuan_wuhou（武侯V0.33 SM4-ECB、SM2、SM3）；1-rsa；2-rsa_x509；3-sm2；4-aes；5-aes_128_cbc；6-aes_192_cbc；7-aes_256_gcm；8-sm4；9-sm4_cbc；10-sha256；11-sm3。编号投入后不得调整或复用。');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'回调地址','ac_server',6,500,0,14,14,0,250,'通信配置');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'状态','ac_state',7,1,0,'0-停用;1-启用','1',1,9,9,80,260,'状态与审计');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'备注','ac_remark',6,500,0,14,14,0,270,'状态与审计');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'创建时间','ac_create_time',5,1,1,-1,1,9,9,160,280,'状态与审计');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_select`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'更新时间','ac_update_time',5,1,1,-1,9,9,160,290,290,'状态与审计');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_select`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'删除时间','ac_delete_time',5,1,1,-1,0,9,0,300,300,'状态与审计');




-- 服务商 512
delete from `cs_dict` where d_id=512;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(512,'服务商','Provider','','p_');

delete from `cs_dict_item` where di_dict=512;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_sort`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(512,'序号','p_id',1,-1,1,1,1,1,0,9,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_fuzzy`,`di_readonly`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(512,'编码','p_code',6,32,0,1,4,4,15,15,2,140,10);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_fuzzy`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(512,'名称','p_name',6,100,0,1,4,15,15,6,180,20);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_filtered`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(512,'状态','p_state',1,1,0,'1-开启;0-关闭','1',1,4,13,9,60,30);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(512,'备注','p_remark',6,1000,0,14,14,0,60);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(512,'创建时间','p_create_time',5,1,-1,0,1,9,9,160,40);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(512,'更新时间','p_update_time',5,1,-1,0,9,9,160,50);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(512,'删除时间','p_delete_time',5,1,-1,0,0,9,0,0);





-- 服务应用 513
delete from `cs_dict` where d_id=513;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(513,'服务应用','ProviderApplication','','pa_');


delete from `cs_dict_item` where di_dict=513;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_sort`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(513,'序号','pa_id',1,-1,1,1,1,1,0,9,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_filtered`,`di_readonly`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(513,'所属服务商','pa_provider',1,-1,0,512,'Provider','p_id','p_name',1,4,15,15,2,160,30);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(513,'服务商编码','pa_provider_code',6,32,0,6,0,15,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_fuzzy`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(513,'应用标识','pa_code',6,50,0,1,4,15,15,6,140,10);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_fuzzy`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(513,'应用名称','pa_name',6,50,0,1,4,15,15,6,160,20);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(513,'关联密钥','pa_api_communicant',1,-1,0,511,'ApiCommunicant','ac_id','ac_name',15,15,140,40);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(513,'应用参数','pa_param',8,1,-1,0,14,14,0,70);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(513,'扩展信息','pa_extend',8,1,-1,0,0,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_filtered`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(513,'状态','pa_state',7,2,0,'0-停用;1-启用','1',1,4,13,9,80,50);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(513,'备注','pa_remark',6,255,0,14,14,0,80);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(513,'创建时间','pa_create_time',5,1,-1,0,1,9,9,160,60);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(513,'更新时间','pa_update_time',5,1,-1,0,8,8,0,90);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(513,'删除时间','pa_delete_time',5,1,-1,0,0,9,0,0);


-- 应用订阅 514
delete from `cs_dict` where d_id=514;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(514,'应用订阅','ProviderApplicationSubscriber','','pas_');

delete from `cs_dict_item` where di_dict=514;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_sort`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(514,'序号','pas_id',1,-1,1,1,1,1,0,9,0,0);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_fuzzy`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(514,'应用内标识','pas_code',6,32,0,1,15,15,15,6,140,40);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_filtered`,`di_readonly`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(514,'服务商','pas_provider',1,-1,0,512,'Provider','p_id','p_name',1,6,14,14,6,140,10);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(514,'服务商编码','pas_provider_code',6,32,0,6,0,15,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_filtered`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(514,'服务应用','pas_provider_application',1,-1,0,513,'ProviderApplication','pa_id','pa_name',1,14,14,6,160,20);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_readonly`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(514,'应用标识','pas_provider_application_code',6,50,0,0,15,15,6,140,30);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`)
values(514,'应用类型','pas_app_type',1,3,0,3,'2-集团;3-药店;5-渠道;6-开方机构',15,15,0,5,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_fuzzy`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(514,'订阅主体类型','pas_join_table',6,50,0,0,1,14,14,0,100,50);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(514,'订阅主体','pas_join_data',1,-1,1,1,14,14,0,180,60);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(514,'扩展信息','pas_extend',8,1,-1,0,15,14,0,100);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_filtered`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(514,'状态','pas_state',7,2,0,'0-停用;1-启用','1',1,15,15,6,80,80);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_visible`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(514,'应用密钥','pas_api_communicant',1,-1,0,511,'ApiCommunicant','ac_id','ac_name',1,0,14,15,100,70);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(514,'备注','pas_remark',8,255,0,14,14,0,90);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(514,'创建时间','pas_create_time',5,1,-1,0,1,8,9,0,110);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(514,'更新时间','pas_update_time',5,1,-1,0,8,8,0,120);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(514,'删除时间','pas_delete_time',5,1,-1,0,0,9,0,0);




-- 账户表 520
delete from `cs_dict` where d_id=532;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(532,'Skill库','SkillLibrary','','');

delete from `cs_dict_item` where di_dict=532;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(532,'ID','id',6,36,0,1,11,15,300,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(532,'名称','name',6,255,0,15,15,6,200,1,4,20);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(532,'分类','category',6,64,0,15,15,120,1,1,30);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(532,'路径','path',6,512,0,15,15,200,40);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(532,'启停','enabled',1,2,0,15,15,80,'1-启用;0-禁用',50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(532,'描述','description',8,65535,0,15,15,400,60);

-- ============================================================
-- 533: cs_mcp_template — MCP 模板
-- ============================================================
delete from `cs_dict` where d_id=533;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(533,'MCP模板','McpTemplate','','');

delete from `cs_dict_item` where di_dict=533;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(533,'ID','id',6,36,0,1,11,15,300,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(533,'名称','name',6,255,0,15,15,6,200,1,4,20);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(533,'传输类型','transport',6,32,0,15,15,120,'stdio-stdio;http-http;sse-sse',30);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(533,'命令','command',6,512,0,15,15,200,40);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(533,'启停','enabled',1,2,0,15,15,80,'1-启用;0-禁用',50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(533,'描述','description',8,65535,0,15,15,400,60);

-- ============================================================
-- 534: cs_agents — Agent 定义（候选；当前 AgentManagementController 用自定义逻辑 $dictId=0）
--       启用前提：需将 AgentManagementController 的 $dictId 改为 534 方才绑定。
--       注意：create_time/update_time/delete_time 为 BIGINT 秒级时间戳，
--             di_type=5 默认按 DATETIME 渲染，迁移前需确认/适配（或临时改 di_type=1 整数展示）。
-- ============================================================
delete from `cs_dict` where d_id=534;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(534,'Agent','Agent','','');

delete from `cs_dict_item` where di_dict=534;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(534,'ID','id',6,36,0,1,11,15,300,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(534,'所属用户','user_id',1,11,0,15,15,100,20);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(534,'名称','name',6,255,0,15,15,6,200,1,4,30);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(534,'描述','description',8,65535,0,15,15,400,40);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(534,'系统提示词','system_prompt',8,65535,0,15,15,400,50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(534,'追加提示词','append_system_prompt',8,65535,0,15,15,400,60);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(534,'LLM提供商','provider',6,64,0,15,15,120,70);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(534,'模型','model',6,128,0,15,15,120,80);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(534,'思考深度','thinking',6,32,0,15,15,120,'low-低;medium-中;high-高',90);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(534,'工具白名单','tools_whitelist',6,512,0,15,15,200,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(534,'工具黑名单','tools_blacklist',6,512,0,15,15,200,110);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(534,'Profile','profile_name',6,255,0,15,15,120,120);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(534,'状态','status',6,32,0,15,15,120,'offline-离线;online-在线;error-错误',130);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(534,'创建时间','create_time',5,20,0,11,1,160,140);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(534,'更新时间','update_time',5,20,0,11,1,160,150);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(534,'删除时间','delete_time',5,20,0,11,1,160,160);

-- ============================================================
-- 535: cs_sessions — 会话（候选；当前 SessionManagementController 用自定义逻辑 $dictId=0）
--       启用前提：需将 SessionManagementController 的 $dictId 改为 535 方才绑定。
--       注意：时间戳字段同上（BIGINT 秒级），di_type=5 渲染需确认/适配。
-- ============================================================
delete from `cs_dict` where d_id=535;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(535,'会话','Session','','');

delete from `cs_dict_item` where di_dict=535;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(535,'ID','id',6,36,0,1,11,15,300,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(535,'所属用户','user_id',1,11,0,15,15,100,20);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(535,'Agent','agent_id',6,36,0,15,15,120,30);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(535,'标题','title',6,512,0,15,15,6,200,1,4,40);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(535,'OMP会话ID','omp_session_id',6,255,0,15,15,160,50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(535,'状态','status',6,32,0,15,15,120,'active-活跃;archived-归档;deleted-删除',60);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(535,'模式','mode',6,32,0,15,15,120,'normal-普通;resumed-恢复;forked-分叉',70);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(535,'父会话','parent_session_id',6,36,0,15,15,120,80);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(535,'消息数','message_count',1,11,0,15,15,100,90);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(535,'最近用量','last_usage',8,65535,0,11,1,200,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(535,'归档时间','archived_time',5,20,0,11,1,160,110);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(535,'创建时间','create_time',5,20,0,11,1,160,120);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(535,'更新时间','update_time',5,20,0,11,1,160,130);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(535,'删除时间','delete_time',5,20,0,11,1,160,140);

-- ============================================================
-- 536: cs_system_config — 全局配置 KV 表 [不推荐转 DictCrudController]
--       cfg_value 为 JSON，属 KV 设置存储，并非固定列标准 CRUD 实体；
--       建议保留自定义 ConfigController。此处仅留候备用种子。
-- ============================================================
delete from `cs_dict` where d_id=536;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(536,'系统配置','SystemConfig','','cfg_');

delete from `cs_dict_item` where di_dict=536;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(536,'ID','cfg_id',1,11,0,1,1,11,15,0,80,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_filtered`,`di_fuzzy`,`di_show_order`)
values(536,'配置键','cfg_key',6,64,0,15,15,6,200,1,4,20);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(536,'配置值','cfg_value',8,65535,0,15,15,400,30);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_select`,`di_show_order`)
values(536,'类型','cfg_type',1,2,0,15,15,120,'1-字符串;2-整数;3-布尔;4-JSON;5-密钥',40);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(536,'分组','cfg_group',6,32,0,15,15,120,50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(536,'说明','cfg_remark',6,255,0,15,15,200,60);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(536,'创建时间','create_time',5,20,0,11,1,160,70);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(536,'更新时间','update_time',5,20,0,11,1,160,80);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_readonly`,`di_show_width`,`di_show_order`)
values(536,'删除时间','delete_time',5,20,0,11,1,160,90);
