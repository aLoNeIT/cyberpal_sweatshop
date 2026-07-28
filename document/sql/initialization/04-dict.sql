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
delete from `cs_dict` where d_id=100;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(100,'证件类型','CertificateType','','ct_');

delete from `cs_dict_item` where di_dict=100;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_inputed`)
values(100,'编码','ct_code',6,10,0,1,0,6,15);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`)
values(100,'名称','ct_name',6,50,0,6,15);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`)
values(100,'标准编码','ct_std_code',6,30,0,6,15);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`)
values(100,'标准名称','ct_std_name',6,30,0,6,15);



--   国家101
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
delete from `cs_dict` where d_id=105;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(105,'医院类型','HospitalType','','dt_');
delete from `cs_dict_item` where di_dict=105;
-- dt_id：医院类别ID，int主键自增，必填且新增/修改只读，列表宽度100。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(105,'序号','dt_id',1,-1,0,1,1,1,6,9,9,100,10);
-- dt_code：医院类别编码，varchar(30)，编码类字段支持精确筛选，新增/修改/详情显示。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(105,'编码','dt_code',6,30,0,6,15,15,120,20,1,0);
-- dt_name：医院类别名称，varchar(100)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(105,'名称','dt_name',6,100,0,6,15,15,180,30,1,4);
-- dt_state：状态，tinyint，固定选项1正常/0停用，默认启用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(105,'状态','dt_state',1,-1,0,1,15,15,100,40,'0-停用;1-正常','1');
-- dt_sort_no：排序号，int，默认0，用于列表排序。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(105,'排序号','dt_sort_no',1,-1,0,15,15,100,50,'0');
-- dt_remark：备注，varchar(255)，描述性字段，新增/修改/详情显示。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(105,'备注','dt_remark',6,255,0,15,15,240,60);

-- 岗位 106：d_name取PRD分类名，d_tablename按cs_job_type去掉cs_后转JobType，d_prefix使用字段公共前缀jt_。
delete from `cs_dict` where d_id=106;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(106,'岗位','JobType','','jt_');
delete from `cs_dict_item` where di_dict=106;
-- jt_id：职工身份ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(106,'序号','jt_id',1,-1,0,1,1,1,6,9,9,100,10);
-- jt_code：职工身份编码，varchar(64)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(106,'编码','jt_code',6,64,0,6,15,15,120,20,1,0);
-- jt_name：职工身份名称，varchar(255)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(106,'名称','jt_name',6,255,0,6,15,15,180,30,1,4);
-- jt_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(106,'状态','jt_state',1,-1,0,1,15,15,100,40,'0-停用;1-正常','1');
-- jt_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(106,'排序号','jt_sort_no',1,-1,0,15,15,100,50,'0');
-- jt_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(106,'备注','jt_remark',6,500,0,15,15,240,60);

-- 人员技术职称 107：d_name取PRD分类名，d_tablename按cs_position去掉cs_后转Position，d_prefix使用字段公共前缀pos_。
delete from `cs_dict` where d_id=107;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(107,'人员技术职称','Position','','pos_');
delete from `cs_dict_item` where di_dict=107;
-- pos_id：职务ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(107,'序号','pos_id',1,-1,0,1,1,1,6,9,9,100,10);
-- pos_code：职务编码，varchar(10)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(107,'编码','pos_code',6,10,0,6,15,15,120,20,1,0);
-- pos_name：职务/职称名称，varchar(50)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(107,'名称','pos_name',6,50,0,6,15,15,180,30,1,4);
-- pos_std_code：专业技术职称编码，varchar(30)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(107,'标准编码','pos_std_code',6,30,0,15,15,140,40,1,0);
-- pos_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(107,'状态','pos_state',1,-1,0,1,15,15,100,50,'0-停用;1-正常','1');
-- pos_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(107,'排序号','pos_sort_no',1,-1,0,15,15,100,60,'0');
-- pos_remark：备注，varchar(255)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(107,'备注','pos_remark',6,255,0,15,15,240,70);

-- 合并归类剂型 108：d_name取PRD分类名，d_tablename按cs_merge_dosage_form去掉cs_后转MergeDosageForm，d_prefix使用字段公共前缀mdf_。
delete from `cs_dict` where d_id=108;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(108,'合并归类剂型','MergeDosageForm','','mdf_');
delete from `cs_dict_item` where di_dict=108;
-- mdf_id：合并归类剂型ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(108,'序号','mdf_id',1,-1,0,1,1,1,6,9,9,100,10);
-- mdf_code：合并归类剂型编码，varchar(10)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(108,'编码','mdf_code',6,10,0,6,15,15,140,20,1,0);
-- mdf_name：合并归类剂型名称，varchar(100)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(108,'名称','mdf_name',6,100,0,6,15,15,180,30,1,4);
-- mdf_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(108,'状态','mdf_state',1,-1,0,1,15,15,100,40,'0-停用;1-正常','1');
-- mdf_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(108,'排序号','mdf_sort_no',1,-1,0,15,15,100,50,'0');
-- mdf_remark：备注，varchar(255)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(108,'备注','mdf_remark',6,255,0,15,15,240,60);

-- 药品通用分类 109：d_name取PRD分类名，d_tablename按cs_classification去掉cs_后转Classification，d_prefix使用字段公共前缀c_。
delete from `cs_dict` where d_id=109;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(109,'药品通用分类','Classification','','c_');
delete from `cs_dict_item` where di_dict=109;
-- c_id：药品分类ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(109,'序号','c_id',1,-1,0,1,1,1,6,9,9,100,10);
-- c_code：药品分类编码，varchar(255)，必填，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(109,'编码','c_code',6,255,0,6,15,15,160,20,1,0);
-- c_name：药品分类名称，varchar(255)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(109,'名称','c_name',6,255,0,6,15,15,180,30,1,4);
-- c_type：药品类型，tinyint，固定选项来自字段注释。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`,`di_filtered`) values(109,'药品类型','c_type',1,-1,0,1,15,15,120,40,'1-化学药品;2-中成药;3-中药饮片;4-计生药品','0',1);
-- c_parent_id：父级药品分类ID，疑似自关联外键，保留关联占位信息。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`) values(109,'父级','c_parent_id',1,-1,0,15,15,120,50,109,'Classification','c_id','c_name','parent_c');
-- c_level：分类层级，int，默认1。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(109,'层级','c_level',1,-1,0,15,15,100,60,'1');
-- c_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(109,'状态','c_state',1,-1,0,1,15,15,100,70,'0-停用;1-正常','1');
-- c_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(109,'排序号','c_sort_no',1,-1,0,15,15,100,80,'0');
-- c_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(109,'备注','c_remark',6,500,0,15,15,240,90);

-- 药品剂型 110：d_name取PRD分类名，d_tablename按cs_dosage_form去掉cs_后转DosageForm，d_prefix使用字段公共前缀df_。
delete from `cs_dict` where d_id=110;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(110,'药品剂型','DosageForm','','df_');
delete from `cs_dict_item` where di_dict=110;
-- df_id：剂型ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(110,'序号','df_id',1,-1,0,1,1,1,6,9,9,100,10);
-- df_code：剂型编码，varchar(10)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(110,'编码','df_code',6,10,0,6,15,15,120,20,1,0);
-- df_name：剂型名称，varchar(50)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(110,'名称','df_name',6,50,0,6,15,15,180,30,1,4);
-- df_merge_dosage_form：合并归类剂型ID，int unsigned非空字段，关联MergeDosageForm字典，新增/修改必填。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`) values(110,'合并归类剂型','df_merge_dosage_form',1,-1,0,6,15,15,140,40,108,'MergeDosageForm','mdf_id','mdf_name');
-- df_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(110,'状态','df_state',1,-1,0,1,15,15,100,50,'0-停用;1-正常','1');
-- df_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(110,'排序号','df_sort_no',1,-1,0,15,15,100,60,'0');
-- df_remark：备注，varchar(255)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(110,'备注','df_remark',6,255,0,15,15,240,70);

-- 药品服用方法 111：d_name取PRD分类名，d_tablename按cs_usage去掉cs_后转Usage，d_prefix使用字段公共前缀du_。
delete from `cs_dict` where d_id=111;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(111,'药品服用方法','Usage','','du_');
delete from `cs_dict_item` where di_dict=111;
-- du_id：用法ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(111,'序号','du_id',1,-1,0,1,1,1,6,9,9,100,10);
-- du_code：用法编码，varchar(64)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(111,'编码','du_code',6,64,0,6,15,15,120,20,1,0);
-- du_name：用法名称，varchar(255)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(111,'名称','du_name',6,255,0,6,15,15,180,30,1,4);
-- du_pinyin：用法拼音码，varchar(255)，拼音简码支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(111,'拼音码','du_pinyin',6,5,255,0,15,15,160,40,1,4);
-- du_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(111,'状态','du_state',1,-1,0,1,15,15,100,50,'0-停用;1-正常','1');
-- du_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(111,'排序号','du_sort_no',1,-1,0,15,15,100,60,'0');
-- du_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(111,'备注','du_remark',6,500,0,15,15,240,70);

-- 用药频次 112：d_name取PRD分类名，d_tablename按cs_frequency去掉cs_后转Frequency，d_prefix使用字段公共前缀fq_。
delete from `cs_dict` where d_id=112;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(112,'中西成药用药频次','Frequency','','fq_');
delete from `cs_dict_item` where di_dict=112;
-- fq_id：用药频次ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(112,'序号','fq_id',1,-1,0,1,1,1,6,9,9,100,10);
-- fq_code：用药频次编码，varchar(20)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(112,'编码','fq_code',6,20,0,6,15,15,140,20,1,0);
-- fq_name：用药频次名称，varchar(50)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(112,'名称','fq_name',6,50,0,6,15,15,180,30,1,4);
-- fq_pinyin：用药频次拼音码，varchar(255)，拼音简码支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(112,'拼音码','fq_pinyin',6,5,255,0,15,15,160,40,1,4);
-- fq_std_code：用药频次标准编码，varchar(30)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(112,'标准编码','fq_std_code',6,30,0,15,15,140,50,1,0);
-- fq_std_name：用药频次标准名称，varchar(30)，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(112,'标准名称','fq_std_name',6,30,0,15,15,160,60,1,4);
-- fq_times：每日次数，varchar(30)，默认1。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(112,'每日次数','fq_times',6,30,0,15,15,120,70,'1');
-- fq_days：周期天数，int，默认1。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(112,'周期天数','fq_days',1,-1,0,15,15,100,80,'1');
-- fq_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(112,'状态','fq_state',1,-1,0,1,15,15,100,90,'0-停用;1-正常','1');
-- fq_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(112,'排序号','fq_sort_no',1,-1,0,15,15,100,100,'0');
-- fq_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(112,'备注','fq_remark',6,500,0,15,15,240,110);

-- 药品单次剂量 113：d_name取PRD分类名，d_tablename按cs_dose去掉cs_后转Dose，d_prefix使用字段公共前缀dose_。
delete from `cs_dict` where d_id=113;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(113,'药品单次剂量','Dose','','dose_');
delete from `cs_dict_item` where di_dict=113;
-- dose_id：剂量ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(113,'序号','dose_id',1,-1,0,1,1,1,6,9,9,100,10);
-- dose_code：剂量编码，varchar(64)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(113,'编码','dose_code',6,64,0,6,15,15,120,20,1,0);
-- dose_name：剂量名称，varchar(255)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(113,'名称','dose_name',6,255,0,6,15,15,180,30,1,4);
-- dose_pinyin：剂量拼音码，varchar(255)，拼音简码支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(113,'拼音码','dose_pinyin',6,5,255,0,15,15,160,40,1,4);
-- dose_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(113,'状态','dose_state',1,-1,0,1,15,15,100,50,'0-停用;1-正常','1');
-- dose_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(113,'排序号','dose_sort_no',1,-1,0,15,15,100,60,'0');
-- dose_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(113,'备注','dose_remark',6,500,0,15,15,240,70);

-- 中药用法 114：d_name取PRD分类名，d_tablename按cs_herb_usage去掉cs_后转HerbUsage，d_prefix使用字段公共前缀hu_。
delete from `cs_dict` where d_id=114;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(114,'中药用法','HerbUsage','','hu_');
delete from `cs_dict_item` where di_dict=114;
-- hu_id：中药用法ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(114,'序号','hu_id',1,-1,0,1,1,1,6,9,9,100,10);
-- hu_code：中药用法编码，varchar(64)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(114,'编码','hu_code',6,64,0,6,15,15,140,20,1,0);
-- hu_name：中药用法名称，varchar(255)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(114,'名称','hu_name',6,255,0,6,15,15,180,30,1,4);
-- hu_pinyin：中药用法拼音码，varchar(255)，拼音简码支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(114,'拼音码','hu_pinyin',6,5,255,0,15,15,160,40,1,4);
-- hu_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(114,'状态','hu_state',1,-1,0,1,15,15,100,50,'0-停用;1-正常','1');
-- hu_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(114,'排序号','hu_sort_no',1,-1,0,15,15,100,60,'0');
-- hu_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(114,'备注','hu_remark',6,500,0,15,15,240,70);

-- 中药特殊要求 115：d_name取PRD分类名，d_tablename按cs_herb_special_require去掉cs_后转HerbSpecialRequire，d_prefix使用字段公共前缀hsr_。
delete from `cs_dict` where d_id=115;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(115,'中药特殊要求','HerbSpecialRequire','','hsr_');
delete from `cs_dict_item` where di_dict=115;
-- hsr_id：中药特殊要求ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(115,'序号','hsr_id',1,-1,0,1,1,1,6,9,9,120,10);
-- hsr_code：中药特殊要求编码，varchar(64)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(115,'编码','hsr_code',6,64,0,6,15,15,150,20,1,0);
-- hsr_name：中药特殊要求名称，varchar(255)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(115,'名称','hsr_name',6,255,0,6,15,15,180,30,1,4);
-- hsr_pinyin：中药特殊要求拼音码，varchar(255)，拼音简码支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(115,'拼音码','hsr_pinyin',6,5,255,0,15,15,160,40,1,4);
-- hsr_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(115,'状态','hsr_state',1,-1,0,1,15,15,100,50,'0-停用;1-正常','1');
-- hsr_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(115,'排序号','hsr_sort_no',1,-1,0,15,15,100,60,'0');
-- hsr_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(115,'备注','hsr_remark',6,500,0,15,15,240,70);

-- 中医诊断 116：d_name取PRD分类名，d_tablename按cs_herb_diagnose去掉cs_后转HerbDiagnose，d_prefix使用字段公共前缀hd_。
delete from `cs_dict` where d_id=116;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(116,'中医诊断','HerbDiagnose','','hd_');
delete from `cs_dict_item` where di_dict=116;
-- hd_id：中医诊断ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(116,'序号','hd_id',1,-1,0,1,1,1,6,9,9,110,10);
-- hd_code：中医诊断代码，varchar(255)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(116,'编码','hd_code',6,255,0,6,15,15,160,20,1,0);
-- hd_name：中医诊断名称，varchar(255)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(116,'名称','hd_name',6,255,0,6,15,15,180,30,1,4);
-- hd_pinyin：中医诊断拼音码，varchar(255)，拼音简码支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(116,'拼音码','hd_pinyin',6,5,255,0,15,15,160,40,1,4);
-- hd_source：数据来源，tinyint，固定选项来自字段注释。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`,`di_filtered`) values(116,'数据来源','hd_source',1,-1,0,15,15,110,50,'0-默认;1-省医保同步','0',1);
-- hd_version：版本号，varchar(255)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(116,'版本号','hd_version',6,255,0,15,15,120,60);
-- hd_state：状态，tinyint，固定选项1有效/0无效。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(116,'状态','hd_state',1,-1,0,1,15,15,100,70,'0-无效;1-有效','1');
-- hd_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(116,'备注','hd_remark',6,500,0,15,15,240,80);

-- 中医证候分类 117：d_name取PRD分类名，d_tablename按cs_herb_syndrome去掉cs_后转HerbSyndrome，d_prefix使用字段公共前缀hs_。
delete from `cs_dict` where d_id=117;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(117,'中医证候分类','HerbSyndrome','','hs_');
delete from `cs_dict_item` where di_dict=117;
-- hs_id：中医证候ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(117,'序号','hs_id',1,-1,0,1,1,1,6,9,9,110,10);
-- hs_code：中医证候代码，varchar(255)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(117,'编码','hs_code',6,255,0,6,15,15,160,20,1,0);
-- hs_name：中医证候分类名称，varchar(255)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(117,'名称','hs_name',6,255,0,6,15,15,190,30,1,4);
-- hs_pinyin：中医证候拼音码，varchar(255)，拼音简码支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(117,'拼音码','hs_pinyin',6,5,255,0,15,15,160,40,1,4);
-- hs_source：数据来源，tinyint，固定选项来自字段注释。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`,`di_filtered`) values(117,'数据来源','hs_source',1,-1,0,15,15,110,50,'0-默认;1-省医保同步','0',1);
-- hs_version：版本号，varchar(255)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(117,'版本号','hs_version',6,255,0,15,15,120,60);
-- hs_state：状态，tinyint，固定选项1有效/0无效。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(117,'状态','hs_state',1,-1,0,1,15,15,100,70,'0-无效;1-有效','1');
-- hs_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(117,'备注','hs_remark',6,500,0,15,15,240,80);

-- 西医诊断 118：d_name取PRD分类名，d_tablename按cs_illness去掉cs_后转Illness，d_prefix使用字段公共前缀ill_。
delete from `cs_dict` where d_id=118;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(118,'西医诊断','Illness','','ill_');
delete from `cs_dict_item` where di_dict=118;
-- ill_id：疾病ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(118,'序号','ill_id',1,-1,0,1,1,1,6,9,0,100,10);
-- ill_code：疾病编码，varchar(255)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(118,'编码','ill_code',6,255,0,6,15,15,160,20,1,0);
-- ill_name：疾病名称，varchar(255)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(118,'名称','ill_name',6,255,0,6,15,15,180,30,1,4);
-- ill_code_pinyin：疾病编码拼音码，varchar(255)，拼音简码支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(118,'编码拼音码','ill_code_pinyin',6,5,255,0,15,15,160,40,1,4);
-- ill_name_pinyin：疾病名称拼音码，varchar(255)，拼音简码支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(118,'名称拼音码','ill_name_pinyin',6,5,255,0,15,15,160,50,1,4);
-- ill_code_len：疾病编码长度，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(118,'编码长度','ill_code_len',1,-1,0,15,15,120,60,'0');
-- ill_med_code：国家医保编码，varchar(255)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(118,'国家医保编码','ill_med_code',6,255,0,15,15,160,70,1,0);
-- ill_med_name：国家医保名称，varchar(255)，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(118,'国家医保名称','ill_med_name',6,255,0,15,15,180,80,1,4);
-- ill_version：版本号，varchar(64)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(118,'版本号','ill_version',6,64,0,15,15,120,90);
-- ill_primary_selectable：主诊断是否可选，tinyint，固定选项来自字段注释。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(118,'主诊断是否可选','ill_primary_selectable',1,-1,0,15,15,130,100,'0-不可选;1-可选','1');
-- ill_is_tumor：是否肿瘤M码，tinyint，固定选项来自字段注释。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(118,'是否肿瘤M码','ill_is_tumor',1,-1,0,15,15,130,110,'0-不是;1-是','0');
-- ill_state：状态，tinyint，固定选项1有效/0无效。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(118,'状态','ill_state',1,-1,0,1,15,15,100,120,'0-无效;1-有效','1');
-- ill_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(118,'备注','ill_remark',6,500,0,15,15,240,130);

-- 通用症状 119：d_name取PRD分类名，d_tablename按cs_symptom去掉cs_后转Symptom，d_prefix使用字段公共前缀sym_。
delete from `cs_dict` where d_id=119;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(119,'通用症状','Symptom','','sym_');
delete from `cs_dict_item` where di_dict=119;
-- sym_code：症状编码，varchar(32)主键非自增，必填且修改只读，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(119,'编码','sym_code',6,32,0,1,0,6,4,15,15,140,10,1,0);
-- sym_name：症状名称，varchar(100)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(119,'名称','sym_name',6,100,0,6,15,15,180,20,1,4);
-- sym_state：状态，tinyint，固定选项1有效/0无效。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(119,'状态','sym_state',1,-1,0,1,15,15,100,30,'0-无效;1-有效','1');
-- sym_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(119,'排序号','sym_sort_no',1,-1,0,15,15,100,40,'0');
-- sym_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(119,'备注','sym_remark',6,500,0,15,15,240,50);

-- 药品存储方式 120：d_name取PRD分类名，d_tablename按cs_drug_storage_method去掉cs_后转DrugStorageMethod，d_prefix使用字段公共前缀dsm_。
delete from `cs_dict` where d_id=120;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(120,'药品存储方式','DrugStorageMethod','','dsm_');
delete from `cs_dict_item` where di_dict=120;
-- dsm_code：存储方式编码，varchar(20)主键非自增，必填且修改只读，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(120,'编码','dsm_code',6,20,0,1,0,6,4,15,15,140,10,1,0);
-- dsm_name：存储方式名称，varchar(50)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(120,'名称','dsm_name',6,50,0,6,15,15,180,20,1,4);


-- 中药炮制方式 121：d_name取中药炮制方式维护入口，d_tablename按cs_tcm_processing_dict去掉cs_后转TcmProcessingDict，d_prefix使用字段公共前缀tpd_。
delete from `cs_dict` where d_id=121;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(121,'中药炮制方式','TcmProcessingDict','','tpd_');
delete from `cs_dict_item` where di_dict=121;
-- tpd_id：中药炮制方式ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(121,'序号','tpd_id',1,-1,0,1,1,1,6,9,9,100,10);
-- tpd_code：炮制方式编码，varchar(20)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(121,'编码','tpd_code',6,20,0,6,15,15,140,20,1,0);
-- tpd_name：炮制方法名称，varchar(50)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(121,'名称','tpd_name',6,50,0,6,15,15,180,30,1,4);
-- tpd_parent_code：父级炮制方式编码，varchar(20)，自关联中药炮制方式字典的编码字段，空值表示一级分类。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`) values(121,'父级','tpd_parent_code',6,20,0,15,15,140,40,121,'TcmProcessingDict','tpd_code','tpd_name','parent_name');
-- tpd_level：炮制层级，固定选项1大类/2子类/3具体方法。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`,`di_filtered`) values(121,'层级','tpd_level',1,-1,0,6,15,15,100,50,'1-大类;2-子类;3-具体方法','1',1);
-- tpd_common_adjuvant：常用辅料，varchar(100)，如蜂蜜、黄酒。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(121,'常用辅料','tpd_common_adjuvant',6,100,0,15,15,160,60,1,4);
-- tpd_processing_purpose：炮制目的，varchar(255)，如润肺止咳、矫味。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(121,'炮制目的','tpd_processing_purpose',6,255,0,15,15,240,70,1,4);
-- tpd_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(121,'状态','tpd_state',1,-1,0,1,15,15,100,80,'0-停用;1-正常','1');
-- tpd_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(121,'排序号','tpd_sort_no',1,-1,0,15,15,100,90,'0');
-- tpd_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(121,'备注','tpd_remark',6,500,0,15,15,240,100);


-- 中药调剂与煎煮特殊要求 122：d_name取中药调剂与煎煮特殊要求维护入口，d_tablename按cs_tcm_decoction_special_req去掉cs_后转TcmDecoctionSpecialReq，d_prefix使用字段公共前缀tdsr_。
delete from `cs_dict` where d_id=122;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(122,'中药调剂与煎煮特殊要求','TcmDecoctionSpecialReq','','tdsr_');
delete from `cs_dict_item` where di_dict=122;
-- tdsr_id：主键ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(122,'序号','tdsr_id',1,-1,0,1,1,1,6,9,9,100,10);
-- tdsr_code：特殊要求编码，varchar(20)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(122,'编码','tdsr_code',6,20,0,6,15,15,140,20,1,0);
-- tdsr_name：特殊要求名称，varchar(50)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(122,'名称','tdsr_name',6,50,0,6,15,15,180,30,1,4);
-- tdsr_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(122,'状态','tdsr_state',1,-1,0,1,15,15,100,40,'0-停用;1-正常','1');
-- tdsr_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(122,'排序号','tdsr_sort_no',1,-1,0,15,15,100,50,'0');
-- tdsr_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(122,'备注','tdsr_remark',6,500,0,15,15,240,60);


-- 中药处方制备与用法 123：d_name取中药处方制备与用法维护入口，d_tablename按cs_tcm_prep_usage去掉cs_后转TcmPrepUsage，d_prefix使用字段公共前缀tpar_。
delete from `cs_dict` where d_id=123;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(123,'中药处方制备与用法','TcmPrepUsage','','tpar_');
delete from `cs_dict_item` where di_dict=123;
-- tpar_id：主键ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(123,'序号','tpar_id',1,-1,0,1,1,1,6,9,9,100,10);
-- tpar_code：用法编码，varchar(30)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(123,'编码','tpar_code',6,30,0,6,15,15,140,20,1,0);
-- tpar_name：用法名称，varchar(100)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(123,'名称','tpar_name',6,100,0,6,15,15,180,30,1,4);
-- tpar_prep_method：制备方式，varchar(50)，如水煎、研末、浓缩成膏。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(123,'制备方式','tpar_prep_method',6,50,0,6,15,15,160,40,1,4);
-- tpar_admin_route：给药途径，varchar(50)，如内服、外用、贴敷。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(123,'给药途径','tpar_admin_route',6,50,0,6,15,15,140,50,1,4);
-- tpar_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(123,'状态','tpar_state',1,-1,0,1,15,15,100,60,'0-停用;1-正常','1');
-- tpar_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(123,'排序号','tpar_sort_no',1,-1,0,15,15,100,70,'0');
-- tpar_remark：用法说明及注意事项，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(123,'用法说明','tpar_remark',6,500,0,15,15,240,80);


-- 中药处方用药频次 124：d_name取中药处方用药频次维护入口，d_tablename按cs_tcm_prep_freq_times去掉cs_后转TcmPrepFreqTimes，d_prefix使用字段公共前缀tpft_。
delete from `cs_dict` where d_id=124;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(124,'中药处方用药频次','TcmPrepFreqTimes','','tpft_');
delete from `cs_dict_item` where di_dict=124;
-- tpft_id：主键ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(124,'序号','tpft_id',1,-1,0,1,1,1,6,9,9,100,10);
-- tpft_code：频次编码，varchar(30)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(124,'编码','tpft_code',6,30,0,6,15,15,140,20,1,0);
-- tpft_name：频次名称，varchar(100)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(124,'名称','tpft_name',6,100,0,6,15,15,220,30,1,4);
-- tpft_tcm_freq：中药频次，varchar(50)，如每日1剂、隔日1剂。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(124,'中药频次','tpft_tcm_freq',6,50,0,6,15,15,140,40,1,4);
-- tpft_common_freq：通用频次，varchar(50)，如一日二次、一日三次。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(124,'通用频次','tpft_common_freq',6,50,0,6,15,15,140,50,1,4);
-- tpft_common_freq_code：通用频次编码，varchar(50)，如BID、TID。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(124,'通用频次编码','tpft_common_freq_code',6,50,0,6,15,15,140,60,1,0);
-- tpft_timing：服药时间，varchar(50)，如饭前、饭后、睡前。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(124,'服药时间','tpft_timing',6,50,0,6,15,15,120,70,1,4);
-- tpft_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(124,'状态','tpft_state',1,-1,0,1,15,15,100,80,'0-停用;1-正常','1');
-- tpft_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(124,'排序号','tpft_sort_no',1,-1,0,15,15,100,90,'0');
-- tpft_remark：适用症及说明，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(124,'适用说明','tpft_remark',6,500,0,15,15,240,100);


-- 中药处方煎煮次数 126：d_name取中药处方煎煮次数维护入口，d_tablename按cs_tcm_decoction_times去掉cs_后转TcmDecoctionTimes，d_prefix使用字段公共前缀tdt_。
delete from `cs_dict` where d_id=126;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(126,'中药处方煎煮次数','TcmDecoctionTimes','','tdt_');
delete from `cs_dict_item` where di_dict=126;
-- tdt_id：主键ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(126,'序号','tdt_id',1,-1,0,1,1,1,6,9,9,100,10);
-- tdt_code：煎煮次数编码，varchar(30)，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(126,'编码','tdt_code',6,30,0,6,15,15,140,20,1,0);
-- tdt_name：煎煮次数名称，varchar(100)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(126,'名称','tdt_name',6,100,0,6,15,15,220,30,1,4);
-- tdt_times：每剂煎煮次数，tinyint，必填整数。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_default`) values(126,'煎煮次数','tdt_times',1,10,1,6,15,15,100,40,1,'1');
-- tdt_description：煎煮方式说明，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(126,'煎煮说明','tdt_description',6,500,0,15,15,260,50);
-- tdt_state：状态，tinyint，固定选项1正常/0停用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_select`,`di_default`) values(126,'状态','tdt_state',1,-1,0,1,15,15,100,60,'0-停用;1-正常','1');
-- tdt_sort_no：排序号，int，默认0。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(126,'排序号','tdt_sort_no',1,-1,0,15,15,100,70,'0');
-- tdt_remark：备注，varchar(500)。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(126,'备注','tdt_remark',6,500,0,15,15,240,80);


-- 科室编码 125：d_name取科室编码表注释，d_tablename按cs_branch_no去掉cs_后转BranchNo，d_prefix使用字段公共前缀bn_。
delete from `cs_dict` where d_id=125;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(125,'科室编码','BranchNo','','bn_');
delete from `cs_dict_item` where di_dict=125;
-- bn_id：科室编码ID，int主键自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(125,'序号','bn_id',1,-1,0,1,1,1,6,9,9,100,10);
-- bn_pid：父级科室ID，int，默认0，自关联科室编码字典的主键字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`)  values(125,'父级科室','bn_pid',1,-1,0,'0',15,15,160,20,1,125,'BranchNo','bn_id','bn_branch_name','parent_branch');
-- bn_branch_name：科室名称，varchar(32)，必填，名称类字段支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(125,'名称','bn_branch_name',6,32,0,6,15,15,180,30,1,4);
-- bn_branch_no：科室编码，varchar(255)，必填，编码类字段支持筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(125,'编码','bn_branch_no',6,255,0,6,15,15,160,40,1,0);
-- bn_parent_code：父级科室编码，varchar(255)，根级记录允许为空，自关联科室编码字典的编码字段并使用独立联表别名。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`) values(125,'父级编码','bn_parent_code',6,255,0,15,15,160,50,1,0,125,'BranchNo','bn_branch_no','bn_branch_name','parent_code_branch');


-- 字典 299
delete from `cs_dict` where d_id=299;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(299,'字典','Dict','','d_');

delete from `cs_dict_item` where di_dict=299;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,
`di_inputed`,`di_sort`)
values(299,'唯一标识','d_id',1,-1,100,1,0,6,15,2);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_filtered`,`di_fuzzy`)
values(299,'名称','d_name',6,50,0,6,15,1,2);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_filtered`,`di_fuzzy`)
values(299,'表名','d_tablename',6,50,0,6,15,1,2);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`)
values(299,'子表名','d_sub',6,50,0,14,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_fuzzy`,`di_show_order`,
`di_inputed`,`di_curd`,`di_required`)
values(299,'前缀','d_prefix',6,10,0,1,2,1001,15,15,6);


-- 字典项 300
delete from `cs_dict` where d_id= 300;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(300,'字典项表','DictItem','','di_');

delete from `cs_dict_item` where di_dict=300;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_show_width`,`di_sort`)
values(300,'序号','di_id',1,-1,1,1,1,0,2);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_filtered`,`di_fuzzy`)
values(300,'字典号','di_dict',1,-1,0,6,299,'Dict','d_id','d_name',15,15,0,2);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_filtered`,`di_fuzzy`)
values(300,'列名','di_name',6,50,0,15,6,1,2);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_filtered`,`di_fuzzy`)
values(300,'字段名','di_fieldname',6,50,0,15,6,1,2);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,
                            `di_max`,`di_min`,`di_default`,`di_select`,`di_required`,`di_inputed`,`di_curd`)
values(300,'应用类型','di_app_type',1,3,0,0,'0-通用;1-平台;2-集团;3-药店;4-用户;5-渠道;6-开方机构',6,15,15);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_inputed`,`di_curd`,`di_required`)
values(300,'类型','di_type',1,4,0,'1-整数;2-小数;3-日期;4-时间;5-日期时间;6-字符串;7-布尔;8-长字符串;9-图像数据;10-二进制',14,15,6);
--
--   1：整数       subType 0：(无) 1：颜色 2：货币
--   2：小数    subType 0：(无) 2：货币
--   3,4,5 日期时间 subType 0:数据库原生时间日期类型 1:Unix时间戳   2:字符串形式 ,具体字符串格式写入di_select中
--   6：字符串 subtype 0:(无) 1:电话号码   2：手机号码  3：邮政编码  4：电子邮件 5:拼音简码
--   8: 字符 subtype 0：无（长字符串），1：json
--   9：图像数据  subtype 0:无(视为二进制流) 1：路径  2：base64
--   10：二进制数据  subtype 0:无 1：路径   2:base64
--
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_inputed`,`di_curd`,`di_required`)
values(300,'子类型','di_subtype',1,4,0,'0-默认',14,15,6);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_inputed`,`di_curd`)
values(300,'最大值','di_max',1,-1,0,-1,14,15);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_inputed`,`di_curd`)
values(300,'最小值','di_min',1,-1,0,0,14,15);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_default`,`di_inputed`,`di_curd`)
values(300,'默认值','di_default',6,-1,0,0,'',14,15);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_required`,`di_default`,`di_inputed`,`di_curd`)
values(300,'是否主键','di_pk',1,4,0,'0-否;1-是',6,0,15,15);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_required`,`di_default`,`di_inputed`,`di_curd`)
values(300,'是否自增','di_autoed',1,4,0,'0-否;1-是',6,0,15,15);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_required`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`)
values(300,'是否密码','di_pwded',1,4,0,'0-否;1-是',6,0,14,15,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_required`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`)
values(300,'是否必填','di_required',1,4,0,'0-不必填;2-新增;4-修改;6-新增与修改',6,0,14,15,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_required`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`)
values(300,'是否只读','di_readonly',1,4,0,'0-不必填;2-新增;4-修改;6-新增与修改',6,0,14,15,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`)
values(300,'页面显示','di_inputed',1,32,0,6,15,14,15,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`)
values(300,'增改查配置','di_curd',1,32,0,6,15,14,15,0);
-- 从小到大
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`)
values(300,'输入框长度','di_input_width',1,-1,0,6,100,14,15,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`)
values(300,'显示顺序','di_show_order',1,-1,0,0,100,14,15,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`)
values(300,'下拉选择','di_select',6,500,0,0,'',14,15,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_required`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`)
values(300,'是否筛选','di_filtered',1,4,0,'0-否;1-是',6,0,14,15,0);
-- fuzzy为非0时候，表示进行查询，1为全匹配，2为模糊匹配右匹配，3为模糊匹配左匹配，4为模糊匹配全匹配
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`)
values(300,'模糊查询','di_fuzzy',1,4,0,'0-不查询;1-全匹配;2-模糊匹配右匹配;3-模糊匹配左匹配;4-模糊匹配全匹配',0,14,15,0);

-- -1代表自动宽度，0代表不显示，非0代表指定px
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`)
values(300,'显示宽度','di_show_width',1,-1,0,100,14,15,0);
-- 奇数asc，偶数desc，数字越小越优先排序
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`)
values(300,'排序','di_sort',1,127,0,0,14,15,0);

-- insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
-- values(300,'外键字典号','di_key_dict',1,-1,0,6,299,'Dict','d_id','d_id');


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'外键表名','di_key_table',6,50,0,15,14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_curd`,`di_inputed`,`di_default`,`di_show_width`)
values(300,'外键字段','di_key_field',6,50,0,15,14,'',0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'外键显示','di_key_show',6,50,0,15,14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'外键别名','di_key_join_name',6,50,0,15,14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_inputed`,`di_show_width`)
values(300,'外键方式','di_key_join_type',6,50,0,'inner-内联;left-左连;right-右连',14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'外键条件','di_key_condition',6,50,0,15,14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'外键是否显示','di_key_visible',1,4,0,'0-否;1-是',15,14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'外键弹出宽度','di_key_width',1,-1,0,0,15,14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'外键弹出高度','di_key_height',1,-1,0,0,15,14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'链接表字典','di_link_dict',1,-1,0,0,15,14,0);

-- 链接表，优先与key_join_name一致，其次是key_table
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'链接表名','di_link_table',6,-1,0,'',15,14,0);
-- 必须要有关联外键才可使用，主要为了从外键表取冗余数据，填写到界面对应字段中
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_curd`,`di_inputed`,`di_default`,`di_show_width`)
values(300,'链接字段','di_link_field',6,50,0,15,14,'',0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'外显表字典号','di_show_dict',1,-1,0,0,15,14,0);

-- 优先与key_join_name一致，其次是key_table
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'外显表名','di_show_table',6,-1,0,'',15,14,0);
-- 必须要有关联外键才可使用，主要是为了显示更多的字段，设置了外显则代表当前字段是虚拟字段不存在
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'外显字段','di_show_field',6,-1,0,'',15,14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'单位','di_unit',6,50,0,15,14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_show_width`)
values(300,'分组','di_group',6,50,0,14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'校验规则','di_regex',6,500,0,15,14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_curd`,`di_inputed`,`di_show_width`)
values(300,'校验错误信息','di_regex_msg',6,500,0,15,14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_show_width`)
values(300,'备注','di_remark',8,-1,1,14,0);


--   账务状态   301
delete from `cs_dict` where d_id=301;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(301,'账务状态','AccountType','','at_');

delete from `cs_dict_item` where di_dict=301;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_required`)
values(301,'账务状态编码','at_code',6,20,0,1,0,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`)
values(301,'账务状态名称','at_name',6,50,0,15,6);






--   财务科目   302
delete from `cs_dict` where d_id=302;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(302,'财务科目','Subject','','sj_');

delete from `cs_dict_item` where di_dict=301;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_required`)
values(302,'财务科目编码','sj_code',6,20,0,1,0,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`)
values(302,'财务科目名称','sj_name',6,50,0,15,6);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(302,'父级编码','sj_parent',6,20,2,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_required`,`di_inputed`)
values(302,'是否父级菜单','sj_parented',1,2,0,'0-否;1-是',0,6,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_show_width` )
values(302,'菜单完整路径','sj_path',6,255,2,6,0,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`)
values(302,'级别','sj_level',1,4,2,6,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`)
values(302,'操作方式','sj_operator',1,2,0,'0-反向取值，1-正向取值',1);




--   账务状态   303
delete from `cs_dict` where d_id=303;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(303,'支付渠道表','PaymentChannel','','pc_');

delete from `cs_dict_item` where di_dict=303;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_required`)
values(303,'支付渠道编码','pc_code',6,10,0,1,0,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`)
values(303,'支付渠道名称','pc_name',6,50,0,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_required`)
values(303,'父级渠道编码','pc_parent',6,10,0,1,0,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_show_width`,`di_inputed`,`di_select`)
values(303,'是否父级','pc_parented',1,2,0,150,15,'0-否;1-是');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`)
values(303,'完整编码','pc_path',6,100,0,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(303,'状态','pc_state',7,-1,0,'1-启用;9-停用','1',15,15,10,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(303,'排序号','pc_sort',1,-1,0,'0',15,15,20,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(303,'创建时间','pc_create_time',5,1,-1,0,9,9,30,150);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(303,'更新时间','pc_update_time',5,1,-1,0,8,8,40,150);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(303,'删除时间','pc_delete_time',5,1,-1,0,0,0,50,0);



-- 支付场景   304
delete from `cs_dict` where d_id=304;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(304,'支付场景','PaymentScene','','ps_');

delete from `cs_dict_item` where di_dict=304;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_inputed`,`di_required`)
values(304,'支付场景编码','ps_code',6,10,0,1,0,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`)
values(304,'支付场景名称','ps_name',6,50,0,15,6);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(304,'状态','ps_state',7,-1,0,'1-启用;9-停用','1',15,15,10,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(304,'排序号','ps_sort',1,-1,0,'0',15,15,20,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(304,'创建时间','ps_create_time',5,1,-1,0,9,9,30,150);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(304,'更新时间','ps_update_time',5,1,-1,0,8,8,40,150);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(304,'删除时间','ps_delete_time',5,1,-1,0,0,0,50,0);





--   菜单500
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

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(503,'集团信息','usr_corporation',1,1,-1,0,
      1000,'Corporation','corp_id','corp_name','corporation_name',0,0,0,1,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(503,'集团信息','usr_corporation',1,1,-1,0,
       1000,'Corporation','corp_id','corp_name','corporation_name',15,14,6,2,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(503,'集团信息','usr_corporation',1,1,-1,0,
       1000,'Corporation','corp_id','corp_name','corporation_name',8,10,0,3,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(503,'集团信息','usr_corporation',1,1,-1,0,
      1000,'Corporation','corp_id','corp_name','corporation_name',8,9,0,5,0);


--   `usr_pharmacy` int(11) NOT NULL DEFAULT '0' COMMENT '药店',
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(503,'药店信息','usr_pharmacy',1,1,-1,0,
      1001,'Pharmacy','p_id','p_name','pharmacy_name',0,0,0,1,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(503,'药店信息','usr_pharmacy',1,1,-1,0,
       1001,'Pharmacy','p_id','p_name','pharmacy_name',0,0,6,2,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(503,'药店信息','usr_pharmacy',1,1,-1,0,
       1001,'Pharmacy','p_id','p_name','pharmacy_name',16,15,6,3,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(503,'药店信息','usr_pharmacy',1,1,-1,0,
      1001,'Pharmacy','p_id','p_name','pharmacy_name',9,9,0,5,0);

--   `usr_distributor` int(11) NOT NULL DEFAULT '0' COMMENT '渠道',
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(503,'渠道信息','usr_distributor',1,1,-1,0,
      1002,'Distributor','d_id','d_name','distributor_name',0,0,0,1,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(503,'渠道信息','usr_distributor',1,1,-1,0,
       1002,'Distributor','d_id','d_name','distributor_name',0,0,0,2,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(503,'渠道信息','usr_distributor',1,1,-1,0,
       1002,'Distributor','d_id','d_name','distributor_name',0,10,0,3,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(503,'渠道信息','usr_distributor',1,1,-1,0,
      1002,'Distributor','d_id','d_name','distributor_name',16,11,6,5,0);

--   `usr_hospital` int(11) NOT NULL DEFAULT '0' COMMENT '开方机构，关联hospital表的id',
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(503,'开方机构','usr_hospital',1,1,-1,0,
      1003,'Hospital','h_id','h_name','hospital_name',16,11,6,6,0);



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
values(506,'应用类型','r_app_type',1,3,0,3,'1-平台;2-集团;3-药店;5-渠道;6-开方机构',6,15,11,0,2,1,1,4);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_default`,`di_inputed`,`di_show_width`,`di_app_type`)
values(506,'关联表表名称','r_join_table',6,'',0,0,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_default`,`di_inputed`,`di_show_width`,`di_app_type`)
values(506,'关联表表字段','r_join_field',6,'',0,0,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_default`,`di_inputed`,`di_show_width`,`di_app_type`)
values(506,'归属主体','r_join_data',1,'',0,0,1);

-- 5-渠道=>1002 Distributor
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_required`,`di_inputed`,`di_curd`,
`di_show_width`,`di_show_order`,`di_app_type`)
values(506,'应用类型','r_app_type',1,3,0,3,'5-渠道',6,8,11,0,2,5);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_default`,`di_inputed`,`di_show_width`,`di_app_type`)
values(506,'关联表表名称','r_join_table',6,'Distributor',0,0,5);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_default`,`di_inputed`,`di_show_width`,`di_app_type`)
values(506,'关联表表字段','r_join_field',6,'d_id',0,0,5);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_app_type`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_show_order`)
values(506,'渠道商','r_join_data',1,-1,0,5,
1002,'Distributor','d_id','d_name',5);

-- 3-药店  药店表  1001 Pharmacy
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_required`,`di_inputed`,`di_curd`,
`di_show_width`,`di_show_order`,`di_app_type`)
values(506,'应用类型','r_app_type',1,3,0,3,'3-药店',6,8,11,0,2,3);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_default`,`di_inputed`,`di_show_width`,`di_app_type`)
values(506,'关联表表名称','r_join_table',6,'Pharmacy',0,0,3);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_default`,`di_inputed`,`di_show_width`,`di_app_type`)
values(506,'关联表表字段','r_join_field',6,'p_id',0,0,3);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_app_type`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_show_order`)
values(506,'医院','r_join_data',1,-1,0,3,
1001,'Pharmacy','p_id','h_name',5);

-- 2-集团  1000=》corporation
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_required`,`di_inputed`,`di_curd`,
`di_show_width`,`di_show_order`,`di_app_type`)
values(506,'应用类型','r_app_type',1,3,0,3,'2-集团',6,8,11,0,2,2);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_default`,`di_inputed`,`di_show_width`,`di_app_type`)
values(506,'关联表表名称','r_join_table',6,'Corporation',0,0,2);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_default`,`di_inputed`,`di_show_width`,`di_app_type`)
values(506,'关联表表字段','r_join_field',6,'corp_id',0,0,2);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_app_type`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_show_order`)
values(506,'集团','r_join_data',1,-1,0,2,
1000,'Corporation','corp_id','corp_name',5);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_fuzzy`,`di_required`,`di_inputed`,`di_show_width`,`di_show_order`)
values(506,'名称','r_name',6,50,2,2,6,15,150,10);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_curd`,
`di_default`,`di_select`,`di_show_width`,`di_show_order`,`di_app_type`)
values(506,'系统级','r_systemed',1,1,-1,0,9,0,15,0,'1-是;0-否',150,15,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_default`
,`di_inputed`,`di_required`,`di_curd`,`di_show_order`,`di_app_type`)
values(506,'等级','r_level',1,1,-1,1,1,15,6,15,16,1);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`,`di_curd`,`di_show_order`,`di_app_type`)
values(506,'等级','r_level',1,1,-1,0,9,0,15,16,3);

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
values(511,'更新时间','ac_update_time',5,1,1,-1,9,9,160,290,'状态与审计');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_select`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_group`)
values(511,'删除时间','ac_delete_time',5,1,1,-1,0,9,0,300,'状态与审计');




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
delete from `cs_dict` where d_id=520;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(520,'账户表','Account','','acc_');

delete from `cs_dict_item` where di_dict=520;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(520,'序号','acc_id',1,-1,0,1,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(520,'集团名称','acc_corporation',1,-1,0,
1000,'Corporation','corp_id','corp_name');


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_app_type`,`di_inputed`)
values(520,'集团名称','acc_corporation',1,-1,0,
1000,'Corporation','corp_id','corp_name',1,7);



insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(520,'药店名称','acc_pharmacy',1,-1,0,
1001,'Pharmacy','p_id','p_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_app_type`,`di_inputed`)
values(520,'药店名称','acc_pharmacy',1,-1,0
,1001,'Pharmacy','p_id','p_name',1,7);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(520,'渠道信息','acc_distributor',1,1,-1,0,
      1002,'Distributor','d_id','d_name','distributor_name',0,0,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_fuzzy`,`di_inputed`)
values(520,'账务编码','acc_code',6,30,0,2,11);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_inputed`)
values(520,'账户类型','acc_type',1,2,1,'1-渠道药店账户；2-渠道集团账户',11);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_fuzzy`,`di_required`,`di_inputed`)
values(520,'账户名','acc_name',6,50,2,4,6,15);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_inputed`)
values(520,'信用额度','acc_credit_line',2,10000000,1,0.00,9);



insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_inputed`)
values(520,'付款总额','acc_payment_cash',2,10000000,1,0.00,9);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_inputed`)
values(520,'消费总额','acc_spent_cash',2,10000000,1,0.00,9);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_inputed`)
values(520,'账户余额','acc_remain_cash',2,10000000,-10000000,0.00,9);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`)
values(520,'最后结算时间','acc_spent_settled_time',5,1,-1,0,9,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_show_width`,`di_inputed`)
values(520,'已结算付款总额','acc_payment_settled_cash',2,10000000,1,0.00,150,9);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_show_width`,`di_inputed`)
values(520,'已结算消费总额','acc_spent_settled_cash',2,10000000,1,0.00,150,9);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_inputed`)
values(520,'状态','acc_state',1,2,0,'0-关闭;1-开启',15);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`)
values(520,'创建人','acc_create_user',1,-1,0
,503,'User','usr_id','usr_real_name',11);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`)
values(520,'创建时间','acc_create_time',5,1,-1,0,9,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`)
values(520,'更新时间','acc_update_time',5,1,-1,0,8,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`)
values(520,'删除时间','acc_delete_time',5,1,-1,0,8,0);






-- 账务明细表
delete from `cs_dict` where d_id=521;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(521,'账务明细表','AccountDetail','','ad_');

delete from `cs_dict_item` where di_dict=521;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(521,'序号','ad_id',1,-1,0,1,1);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(521,'集团名称','ad_corporation',1,-1,0,
1000,'Corporation','corp_id','corp_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(521,'药店名称','ad_pharmacy',1,-1,0,
1001,'Pharmacy','p_id','p_name');


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(521,'渠道信息','ad_distributor',1,1,-1,0,
      1002,'Distributor','d_id','d_name','distributor_name',0,0,0,0,0);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(521,'账户信息','ad_account',1,1,-1,0,
      520,'Account','acc_id','acc_name','account_name',0,0,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_autoed`)
values(521,'明细编码','ad_code',6,26,0,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(521,'账务科目','ad_subject',6,10,2,15
,302,'Subject','sj_code','sj_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(521,'账务类型','ad_type',6,10,2,11
,301,'AccountType','at_code','at_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(521,'付款金额','ad_payment_cash',2,99999999,0,11);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(521,'消费金额','ad_spent_cash',2,99999999,0,11);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_order`)
values(521,'交易凭证','ad_file',9,1,-1,0
      ,510,'File','f_id','f_url',14,14,75);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_inputed`)
values(521,'是否结算','ad_settled',7,1,0,'0-未结算;1-已结算',9);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(521,'结算时间','ad_settlement_time',5,-1,0,9);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`)
values(521,'结算人','ad_settlement_user',1,-1,0,9
,503,'User','usr_id','usr_real_name','settled_user');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_inputed`,`di_default`)
values(521,'状态','ad_state',7,1,0,'0-禁止结算;1-允许结算',9,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_inputed`,`di_default`)
values(521,'支付状态','ad_pay_state',7,1,0,'0-未支付；1-支付中；2-已支付',9,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_show_width`)
values(521,'数据来源表表名','ad_source_table',6,100,0,9,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_show_width`)
values(521,'数据来源表键名','ad_source_field',6,100,0,9,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_show_width`)
values(521,'数据来源表主键','ad_source_value',1,-1,0,9,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(521,'备注','ad_remark',8,1000,0,15);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(521,'创建用户','ad_create_user',1,-1,0,9
,503,'User','usr_id','usr_real_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`)
values(521,'创建时间','ad_create_time',5,1,-1,0,9,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`)
values(521,'更新时间','ad_update_time',5,1,-1,0,9,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`)
values(521,'删除时间','ad_delete_time',5,1,-1,0,8,0);





-- 账户信用值调整记录
delete from `cs_dict` where d_id=522;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(522,'账户信用值调整记录','AccountCreditRecord','','acr_');

delete from `cs_dict_item` where di_dict=522;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`)
values(522,'序号','acr_id',1,-1,0,1,1);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(522,'集团名称','acr_corporation',1,-1,0,
1000,'Corporation','corp_id','corp_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(522,'药店名称','acr_pharmacy',1,-1,0,
1001,'Pharmacy','p_id','p_name');


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(522,'渠道信息','acr_distributor',1,1,-1,0,
      1002,'Distributor','d_id','d_name','distributor_name',0,0,0,0,0);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,
`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`)
values(522,'账户信息','acr_account',1,1,-1,0,
      520,'Account','acc_id','acc_name','account_name',0,0,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(522,'信用额度变更前','acr_credit_line_old',2,99999999,0,11);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(522,'信用额度变更后','acr_credit_line_new',2,99999999,0,11);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`)
values(522,'变更时账户余额','acr_remain_cash',2,99999999,0,11);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`)
values(522,'创建用户','acr_create_user',1,-1,0,9
,503,'User','usr_id','usr_real_name');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`)
values(522,'创建时间','acr_create_time',5,1,-1,0,9,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`)
values(522,'更新时间','acr_update_time',5,1,-1,0,9,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_required`)
values(522,'删除时间','acr_delete_time',5,1,-1,0,8,0);




-- 集团信息表   1000
delete from `cs_dict` where d_id=1000;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(1000,'集团信息','Corporation','','corp_');

delete from `cs_dict_item` where di_dict=1000;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,
                            `di_inputed`,`di_show_order`,`di_sort`,`di_show_width`)
values(1000,'序号','corp_id',1,-1,0,1,1,9,1,2,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_readonly`,
`di_show_order`,`di_filtered`,`di_fuzzy`)
values(1000,'编码','corp_code',6,32,0,9,15,2,4,2,1,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`
,`di_required`,`di_show_width`,`di_filtered`)
values(1000,'名称','corp_name',6,100,0,14,15,5,6,200,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`,
`di_show_order`,`di_show_width`,`di_filtered`)
values(1000,'简称','corp_alias',0,60,0,15,0,5,150,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_filtered`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(1000,'行政区划','corp_house_area',1,-1,0,6,1
,103,'HouseArea','ha_code','ha_name',15,15,150,10);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_curd`,`di_inputed`,`di_filtered`,`di_show_width`,`di_show_order`)
values(1000,'地址','corp_address',8,255,0,14,14,0,200,10);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_fuzzy`,`di_required`,`di_inputed`,`di_show_width`,`di_show_order`)
values(1000,'联系电话','corp_mp',6,20,0,2,0,15,150,10);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`,`di_show_order`,`di_filtered`)
values(1000,'截止日期','corp_expire_date',3,1,-1,0,9,9,6,2,150,50,1);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`,`di_show_order`,`di_filtered`)
values(1000,'截止日期','corp_expire_date',3,1,-1,0,15,15,6,1,150,50,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,
`di_show_order`,`di_required`,`di_filtered`)
values(1000,'状态','corp_state',7,2,0,'0-关闭;1-开启',1,15,15,80,0,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`)
values(1000,'创建人','corp_create_user',1,-1,0,
       503,'User','usr_id','usr_real_name','create_user');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`)
values(1000,'创建时间','corp_create_time',5,1,-1,0,9,15,0,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_show_width`)
values(1000,'更新时间','corp_update_time',5,1,-1,0,8,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`)
values(1000,'删除时间','corp_delete_time',5,1,-1,0,16,9,0,0);


-- 药店信息   1001
delete from `cs_dict` where d_id=1001;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(1001,'药店信息','Pharmacy','','p_');

delete from `cs_dict_item` where di_dict=1001;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,
                            `di_inputed`,`di_show_order`,`di_sort`,`di_show_width`)
values(1001,'序号','p_id',1,-1,0,1,1,9,1,2,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_app_type`,`di_show_width`)
values(1001,'集团','p_corporation',1,-1,0,1
,1000,'Corporation','corp_id','corp_name',15,15,1,3,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_app_type`,`di_show_width`)
values(1001,'集团','p_corporation',1,-1,0,1
,1000,'Corporation','corp_id','corp_name',15,15,1,1,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_app_type`,`di_show_width`)
values(1001,'集团','p_corporation',1,-1,0,1
,1000,'Corporation','corp_id','corp_name',15,15,1,5,150);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_app_type`,`di_show_width`)
values(1001,'集团','p_corporation',1,-1,0,1
,1000,'Corporation','corp_id','corp_name',15,15,1,2,150);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_readonly`,
`di_show_order`,`di_filtered`,`di_fuzzy`,`di_show_width`)
values(1001,'编码','p_code',6,32,0,9,15,2,4,2,1,1,120);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_order`,`di_required`,`di_show_width`)
values(1001,'名称','p_name',6,100,0,1,14,15,2,6,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_inputed`,`di_required`,`di_show_order`,`di_show_width`)
values(1001,'简称','p_alias',0,60,0,1,15,0,3,100);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`)
values(1001,'行政区划','p_house_area',1,-1,0,1
,103,'HouseArea','ha_code','ha_name',14,15,6,10,200);

insert into cs_dict_item(di_dict,di_name,di_fieldname,di_type,di_max,di_min,di_inputed,di_curd,di_show_width,`di_show_order`)
values(1001,'经度','p_lng',2,99999999,0,14,15,0,10);

insert into cs_dict_item(di_dict,di_name,di_fieldname,di_type,di_max,di_min,di_inputed,di_curd,di_show_width,`di_show_order`)
values(1001,'纬度','p_lat',2,99999999,0,14,15,0,10);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_curd`,`di_filtered`,`di_inputed`,`di_show_order`,`di_show_width`)
values(1001,'地址','p_address',8,255,0,15,0,14,20,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_fuzzy`,`di_required`,`di_inputed`,`di_show_width`,`di_show_order`)
values(1001,'药店电话','p_mp',6,20,0,2,0,14,0,20);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_app_type`,
`di_required`,`di_show_order`,`di_show_width`)
values(1001,'负责人','p_principal',6,50,0,14,15,5,0,15,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_app_type`,
`di_required`,`di_show_order`,`di_show_width`)
values(1001,'负责人','p_principal',6,50,0,14,15,1,0,15,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_app_type`,
`di_required`,`di_show_order`,`di_show_width`)
values(1001,'负责人','p_principal',6,50,0,14,15,3,0,15,100);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_inputed`,`di_curd`,`di_app_type`,
`di_show_order`,`di_required`,`di_show_width`)
values(1001,'联系电话','p_principal_mp',6,20,0,'','',14,15,5,15,0,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_inputed`,`di_curd`,`di_app_type`,
`di_show_order`,`di_required`,`di_show_width`)
values(1001,'联系电话','p_principal_mp',6,20,0,'','',14,15,1,15,0,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_inputed`,`di_curd`,`di_app_type`,
`di_show_order`,`di_required`,`di_show_width`)
values(1001,'联系电话','p_principal_mp',6,20,0,'','',14,15,3,15,0,100);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_order`,`di_required`,`di_show_width`)
values(1001,'营业执照','p_business_license',6,100,0,1,14,15,2,6,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_filtered`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_order`,`di_show_width`)
values(1001,'截止日期','p_expire_date',3,1,-1,0,1,9,9,6,5,100,120);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_filtered`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_order`,`di_show_width`)
values(1001,'截止日期','p_expire_date',3,1,-1,0,1,15,15,6,1,100,120);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,
`di_show_order`,`di_required`,`di_show_width`)
values(1001,'状态','p_state',7,2,0,'0-关闭;1-开启',1,15,12,200,6,80);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,`di_show_order`)
values(1001,'创建人','p_create_user',1,-1,0,
       503,'User','usr_id','usr_real_name','create_user',300);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`)
values(1001,'创建时间','p_create_time',5,1,-1,0,9,15,0,300,120);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_show_width`)
values(1001,'更新时间','p_update_time',5,1,-1,0,8,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`
,`di_show_width`)
values(1001,'删除时间','p_delete_time',5,1,-1,0,16,9,0,0);




-- 渠道商表   1002
delete from `cs_dict` where d_id=1002;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(1002,'渠道商','Distributor','','d_');

delete from `cs_dict_item` where di_dict=1002;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,
                            `di_inputed`,`di_show_order`,`di_sort`,`di_show_width`)
values(1002,'序号','d_id',1,-1,0,1,1,9,1,2,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_readonly`,
`di_show_order`,`di_filtered`,`di_fuzzy`)
values(1002,'编码','d_code',6,32,0,9,15,2,4,2,1,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_order`,`di_required`,`di_show_width`)
values(1002,'名称','d_name',6,100,0,1,14,15,5,6,200);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_app_type`,
`di_required`,`di_show_order`)
values(1002,'负责人','d_principal',6,50,0,15,15,5,0,13);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_app_type`,
`di_required`,`di_show_order`)
values(1002,'负责人','d_principal',6,50,0,15,15,1,0,13);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_inputed`,`di_curd`,`di_app_type`,
`di_show_order`,`di_required`)
values(1002,'负责人电话','d_principal_mp',6,20,0,'','',15,15,5,13,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_inputed`,`di_curd`,`di_app_type`,
`di_show_order`,`di_required`)
values(1002,'负责人电话','d_principal_mp',6,20,0,'','',15,15,1,13,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_filtered`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`,`di_show_order`)
values(1002,'截止日期','d_expire_date',3,1,-1,0,1,9,9,0,5,150,50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_filtered`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`,`di_show_order`)
values(1002,'截止日期','d_expire_date',3,1,-1,0,1,15,15,1,1,150,50);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,
`di_show_order`,`di_required`,`di_filtered`)
values(1002,'状态','d_state',7,2,0,'0-关闭;1-开启',1,15,15,80,0,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`)
values(1002,'创建人','d_create_user',1,-1,0,
       503,'User','usr_id','usr_real_name','create_user');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`)
values(1002,'创建时间','d_create_time',5,1,-1,0,9,15,0,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_show_width`)
values(1002,'更新时间','d_update_time',5,1,-1,0,8,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`)
values(1002,'删除时间','d_delete_time',5,1,-1,0,16,9,0,0);


-- 医疗机构表   1003
delete from `cs_dict` where d_id=1003;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(1003,'医疗机构','Hospital','','h_');

delete from `cs_dict_item` where di_dict=1003;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,
                            `di_inputed`,`di_show_order`,`di_sort`,`di_show_width`)
values(1003,'序号','h_id',1,-1,0,1,1,9,1,2,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,
`di_show_order`,`di_required`)
values(1003,'类型','h_type',1,2,0,'1-医院;2-平台',1,9,9,1,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_readonly`,
`di_show_order`,`di_filtered`,`di_fuzzy`,`di_show_width`)
values(1003,'编码','h_code',6,50,0,9,15,2,4,2,1,1,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,
`di_inputed`,`di_curd`,`di_show_order`,`di_required`,`di_show_width`)
values(1003,'名称','h_name',6,100,0,1,14,15,5,6,200);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`,
`di_show_order`,`di_show_width`,`di_filtered`)
values(1003,'简称','h_alias_name',6,60,0,15,0,5,150,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(1003,'医院等次','h_grade',6,10,0,'1-甲;2-乙;3-丙;4-合格;5-未评',14,15,7,100);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(1003,'机构级别','h_level',6,10,0,'1-一级;2-二级;3-三级;4-未定级;5-无级别',14,15,8,100);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,`di_curd`,`di_inputed`,`di_show_width`,`di_show_order`)
values(1003,'医院类别','h_ht_code',6,10,0,0,105,'HospitalType','dt_code','dt_name','hospital_type_code',15,14,160,9);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,di_filtered
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_width`,`di_show_order`)
values(1003,'类别','h_category',1,-1,0,0,105,'HospitalType','dt_id','dt_name',15,14,150,8);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_required`,`di_show_width`)
values(1003,'执业许可证','h_medical_license_no',6,50,0,14,15,9,0,160);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(1003,'备案号','h_record_no',6,50,0,14,15,9,160);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_filtered`,`di_show_order`,`di_required`,`di_show_width`)
values(1003,'统一信用代码','h_org_code',6,50,0,15,15,1,9,6,160);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(1003,'行政区划','h_house_area',1,-1,0,6
,103,'HouseArea','ha_code','ha_name',14,14,150,10);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_curd`,`di_inputed`,`di_required`,`di_filtered`,`di_show_width`,`di_show_order`)
values(1003,'地址','h_address',8,255,0,14,14,6,0,200,10);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_inputed`,`di_curd`,`di_app_type`,
`di_show_order`,`di_required`)
values(1003,'负责人电话','h_principal_phone',6,32,0,'','',14,14,1,13,6);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`,`di_show_order`,`di_filtered`)
values(1003,'截止日期','h_expire_date',3,1,-1,0,0,0,0,1,0,55,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_fuzzy`,`di_required`,`di_inputed`,`di_show_width`,`di_show_order`)
values(1003,'电话','h_phone',6,32,0,2,0,14,150,20);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_required`,`di_show_width`)
values(1003,'Logo','h_logo_url',9,1,500,0,14,14,21,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(1003,'简介','h_introduction',8,1000,0,14,14,22,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(1003,'实体医院服务方','h_offline_source',6,255,0,14,14,30,240);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(1003,'定点医药机构名称','h_offline_fixmedins_name',6,255,0,14,14,31,240);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(1003,'定点医药机构编码','h_offline_fixmedins_code',6,255,0,1,14,14,32,200);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(1003,'问诊小程序appid','h_online_inquiry_appid',6,50,0,14,15,23,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`,`di_default`)
values(1003,'诊室有效时长','h_consultation_room_valid_minutes',1,-1,0,14,15,24,120,'60');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(1003,'处方是否复核','h_prescription_review_required',7,-1,0,'0-否;1-是','0',14,15,25,100);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`,`di_default`)
values(1003,'处方有效天数','h_prescription_valid_days',1,-1,0,14,15,26,120,'3');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(1003,'显示药品用法','h_show_drug_usage',7,-1,0,'0-否;1-是','1',0,0,27,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_select`,
`di_show_order`, `di_show_width` )
values(1003,'开方机构服务方','h_source',6,255,0,0,0,0,'HHIS-红杉HIS',50,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,
`di_show_order`, `di_show_width` )
values(1003,'开方机构服务标识','h_source_code',6,255,0,0,0,0,50,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`)
values(1003,'最后同步时间','h_last_sync_data_time',5,1,-1,0,0,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,
`di_show_order`,`di_required`,`di_filtered`)
values(1003,'状态','h_status',7,3,-1,'-1-禁用;0-关闭;1-正常;2-即将过期;3-过期',1,15,15,80,0,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(1003,'到期后允许登录','h_allow_login_after_expired',7,-1,0,'0-允许;1-不允许','0',15,15,82,120);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_default`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(1003,'扩展信息','h_extend',8,1,-1,'[]',0,14,14,83,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`)
values(1003,'创建人','h_create_user',1,-1,0,
       503,'User','usr_id','usr_real_name','create_user');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`)
values(1003,'创建时间','h_create_time',5,1,-1,0,9,15,0,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_show_width`)
values(1003,'更新时间','h_update_time',5,1,-1,0,8,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`)
values(1003,'删除时间','h_delete_time',5,1,-1,0,16,9,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(1003,'创建人','h_created_user',6,64,0,9,9,120,102);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`)
values(1003,'更新人','h_updated_user',6,64,0,8,8,120,104);




-- 渠道医院表   1004
delete from `cs_dict` where d_id=1004;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(1004,'渠道医院','DistributorHospital','','dh_');

delete from `cs_dict_item` where di_dict=1004;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,
                            `di_inputed`,`di_show_order`,`di_sort`,`di_show_width`)
values(1004,'序号','dh_id',1,-1,0,1,1,9,1,2,0);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_key_dict`
,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`)
values(1004,'渠道','dh_distributor',1,-1,0,1002,'Distributor','d_id','d_name',15,16,5,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,di_filtered
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_required`,`di_show_width`)
values(1004,'医院','dh_hospital',1,-1,0,1,1003,'Hospital','h_id','h_name',15,15,5,6,200);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_show_order`,di_filtered,`di_required`,`di_show_width`)
values(1004,'医院名称','dh_hospital_name',6,60,0,15,10,1,6,150);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_app_type`,
`di_required`,`di_show_order`)
values(1004,'负责人','dh_principal_name',6,50,0,15,15,1,0,13);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_app_type`,
`di_required`,`di_show_order`)
values(1004,'负责人','dh_principal_name',6,50,0,15,15,5,0,13);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_inputed`,`di_curd`,`di_app_type`,
`di_show_order`,`di_required`)
values(1004,'联系电话','dh_principal_phone',6,32,0,'','',15,15,1,13,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_inputed`,`di_curd`,`di_app_type`,
`di_show_order`,`di_required`)
values(1004,'联系电话','dh_principal_phone',6,32,0,'','',15,15,5,13,0);


INSERT INTO `cs_dict_item` (`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_show_width`, `di_inputed`, `di_curd`,`di_show_order`)
VALUES (1004, '默认签方金额', 'dh_sign_default_price', 2, 100, 8, 8,60);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`,`di_show_order`,di_filtered)
values(1004,'合作开始日期','dh_cooperation_start_date',3,1,-1,0,14,15,6,1,150,50,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`,`di_show_order`,di_filtered)
values(1004,'合作结束日期','dh_cooperation_end_date',3,1,-1,0,14,15,6,1,150,55,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`,`di_show_order`,di_filtered)
values(1004,'合作开始日期','dh_cooperation_start_date',3,1,-1,0,14,15,6,5,150,50,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`,`di_show_order`,di_filtered)
values(1004,'合作结束日期','dh_cooperation_end_date',3,1,-1,0,14,15,6,5,150,55,0);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,
`di_show_order`,`di_required`,`di_show_width`,di_filtered)
values(1004,'状态','dh_state',7,2,0,'0-关闭;1-开启',1,15,15,60,0,80,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,`di_show_order`)
values(1004,'创建人','dh_create_user',1,-1,0,
       503,'User','usr_id','usr_real_name','create_user',100);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`
,`di_required`,`di_show_width`,`di_show_order`)
values(1004,'创建时间','dh_create_time',5,1,-1,0,9,15,0,200,200);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_show_width`)
values(1004,'更新时间','dh_update_time',5,1,-1,0,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`)
values(1004,'删除时间','dh_delete_time',5,1,-1,0,0,9,0,0);




-- 渠道药店表   1005
delete from `cs_dict` where d_id=1005;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(1005,'渠道药店表','DistributorPharmacy','','dp_');

delete from `cs_dict_item` where di_dict=1005;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,
                            `di_inputed`,`di_show_order`,`di_sort`,`di_show_width`)
values(1005,'序号','dp_id',1,-1,0,1,1,9,1,2,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_width`,`di_show_order`)
values(1005,'渠道','dp_distributor',1,-1,0,1002,'Distributor','d_id','d_name',15,16,0,2);


insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,di_filtered
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_required`,`di_show_width`,`di_show_order`)
values(1005,'药店名称','dp_pharmacy',1,-1,0,1
,1001,'Pharmacy','p_id','p_name',15,15,6,150,2);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`,di_filtered,`di_show_order`,`di_show_width`)
values(1005,'简称','dp_alias',6,60,0,15,6,1,3,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_app_type`,
`di_required`,`di_show_order`)
values(1005,'负责人','dp_principal',6,50,0,15,15,1,0,13);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_app_type`,
`di_required`,`di_show_order`)
values(1005,'负责人','dp_principal',6,50,0,15,15,5,0,13);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_inputed`,`di_curd`,`di_app_type`,
`di_show_order`,`di_required`)
values(1005,'联系电话','dp_principal_mp',6,20,0,'','',15,15,1,13,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_select`,`di_inputed`,`di_curd`,`di_app_type`,
`di_show_order`,`di_required`)
values(1005,'联系电话','dp_principal_mp',6,20,0,'','',15,15,5,13,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_select`,
`di_show_order`, `di_show_width` )
values(1005,'服务方','dp_source',6,255,0,15,0,'HHIS-红杉HIS',50,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`,
`di_show_order`, `di_show_width` )
values(1005,'服务标识','dp_source_code',6,255,0,15,0,50,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_show_order`,
                       `di_inputed`, `di_curd`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`)
values(1005,'拓展人','dp_agency_user',1,-1,0,60,
       15,15,503,'User','usr_id','usr_real_name','create_user');


INSERT INTO `cs_dict_item` (`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_show_width`, `di_inputed`, `di_curd`,`di_show_order`)
VALUES (1005, '默认签方金额', 'dp_sign_default_price', 2, 100, 15, 15,180);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`,`di_show_order`,di_filtered)
values(1005,'合作开始日期','dp_cooperation_start_date',3,1,-1,0,14,14,6,1,150,100,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`,`di_show_order`,di_filtered)
values(1005,'合作结束日期','dp_cooperation_end_date',3,1,-1,0,14,14,6,1,150,105,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`,`di_show_order`,di_filtered)
values(1005,'合作开始日期','dp_cooperation_start_date',3,1,-1,0,14,14,6,5,150,100,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_app_type`,`di_show_width`,`di_show_order`,di_filtered)
values(1005,'合作结束日期','dp_cooperation_end_date',3,1,-1,0,14,14,6,5,150,105,0);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_show_order`,`di_inputed`,`di_curd`,`di_show_width`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`)
values(1005,'审核人','dp_audit_user',1,-1,0,150,9,15,0,
       503,'User','usr_id','usr_real_name','create_user');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`)
values(1005,'审核时间','dp_audit_time',5,1,-1,0,9,15,0,0,150);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
`di_inputed`,`di_required`,di_filtered,`di_show_order`,`di_show_width`)
values(1005,'审核备注','dp_audit_remark',8,60,0,15,0,0,150,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_curd`,`di_inputed`,`di_show_width`)
values(1005,'扩展','dp_extend',8,1,-1,0,14,16,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,
`di_show_order`,`di_required`,`di_show_width`,di_filtered)
values(1005,'状态','dp_state',7,2,0,'0-关闭;1-开启;2-待审核;9-审核失败',1,15,15,200,0,80,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`)
values(1005,'创建人','dp_create_user',1,-1,0,
       503,'User','usr_id','usr_real_name','create_user');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`)
values(1005,'创建时间','dp_create_time',5,1,-1,0,9,15,0,200);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_show_width`)
values(1005,'更新时间','dp_update_time',5,1,-1,0,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`)
values(1005,'删除时间','dp_delete_time',5,1,-1,0,0,0,0,0);




-- 渠道药店医院关联表   1006
delete from `cs_dict` where d_id=1006;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(1006,'渠道药店医院关联表','DistributorPharmacyHospital','','dph_');

delete from `cs_dict_item` where di_dict=1006;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,
                            `di_inputed`,`di_show_order`,`di_sort`,`di_show_width`)
values(1006,'序号','dph_id',1,-1,0,1,1,9,1,2,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_width`,`di_show_order`)
values(1006,'渠道','dph_distributor',1,-1,0,1002,'Distributor','d_id','d_name',15,16,0,2);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_readonly`,
`di_show_order`,`di_filtered`,`di_fuzzy`)
values(1006,'渠道商编码','dph_distributor_code',6,32,0,9,15,2,4,2,1,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,di_filtered
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_required`,`di_show_width`,`di_show_order`)
values(1006,'渠道药店','dph_distributor_pharmacy',1,-1,0,1
,1005,'DistributorPharmacy','dp_id','dp_alias',15,15,6,150,2);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,di_filtered
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_required`,`di_readonly`,`di_inputed`,`di_show_width`,`di_show_order`,`di_app_type`)
values(1006,'渠道药店','dph_distributor_pharmacy',1,-1,0,0
,1005,'DistributorPharmacy','dp_id','dp_alias',0,0,0,0,0,2,3);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_readonly`,
`di_show_order`,`di_filtered`,`di_fuzzy`,`di_show_width`)
values(1006,'药店编码','dph_pharmacy_code',6,32,0,14,15,2,4,10,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,di_filtered
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_required`,`di_show_width`,`di_show_order`)
values(1006,'渠道医院','dph_distributor_hospital',1,-1,0,1
,1004,'DistributorHospital','dh_id','dh_hospital_name',15,15,6,150,2);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_readonly`,
`di_show_order`,`di_filtered`,`di_fuzzy`,`di_show_width`)
values(1006,'医院编码','dph_hospital_code',6,32,0,14,15,2,4,10,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_select`,
`di_show_order`, `di_show_width` )
values(1006,'服务方','dph_source',6,255,0,15,0,'HHIS-红杉HIS',50,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`,
`di_show_order`, `di_show_width` )
values(1006,'服务标识','dph_source_code',6,255,0,15,0,50,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`)
values(1006,'操作人','dph_agency_user',1,-1,0,
       503,'User','usr_id','usr_real_name','create_user');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`)
values(1006,'创建人','dph_create_user',1,-1,0,
       503,'User','usr_id','usr_real_name','create_user');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`)
values(1006,'创建时间','dph_create_time',5,1,-1,0,9,15,0,200);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_show_width`)
values(1006,'更新时间','dph_update_time',5,1,-1,0,0,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`)
values(1006,'删除时间','dph_delete_time',5,1,-1,0,0,0,0,0);




-- 处方   1100
delete from `cs_dict` where d_id=1100;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`)
values(1100,'处方','Prescription','','p_');

delete from `cs_dict_item` where di_dict=1100;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,
                            `di_inputed`,`di_show_order`,`di_sort`,`di_show_width`)
values(1100,'序号','p_id',1,-1,0,1,1,9,1,2,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`)
values(1100,'集团','p_corporation',1,-1,0,1000,'Corporation','corp_id','corp_name',16,16,5,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'集团','p_corporation',1,-1,0,1,1000,'Corporation','corp_id','corp_name',15,16,5,150,5);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`)
values(1100,'药店','p_pharmacy',1,-1,0,1001,'Pharmacy','p_id','p_name',16,16,5,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'渠道','p_distributor',1,-1,0,1002,'Distributor','d_id','d_name',15,16,5,150,1);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'渠道','p_distributor',1,-1,0,1002,'Distributor','d_id','d_name',15,16,5,150,2);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'渠道','p_distributor',1,-1,0,1002,'Distributor','d_id','d_name',15,16,5,150,3);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'渠道','p_distributor',1,-1,0,1002,'Distributor','d_id','d_name',15,16,5,0,5);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'药店','p_distributor_pharmacy',1,-1,0,1005,'DistributorPharmacy','dp_id','dp_alias',16,9,5,150,1);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'药店','p_distributor_pharmacy',1,-1,0,1,1005,'DistributorPharmacy','dp_id','dp_alias',9,9,5,150,2);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'药店','p_distributor_pharmacy',1,-1,0,1005,'DistributorPharmacy','dp_id','dp_alias',16,9,5,150,3);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'药店','p_distributor_pharmacy',1,-1,0,1,1005,'DistributorPharmacy','dp_id','dp_alias',9,9,5,150,5);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_show_order`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,`di_app_type`,`di_curd`,`di_inputed`)
values(1100,'拓展人','p_distributor_pharmacy_agency',1,-1,0,1,400,
       503,'User','usr_id','usr_real_name','agency_user',5,15,15);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`,`di_default`)
values(1100,'开方机构','p_hospital',1,-1,0,1,1003,'Hospital','h_id','h_name',15,9,5,150,'0');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`)
values(1100,'医院','p_distributor_hospital',1,-1,0,1,1004,'DistributorHospital','dh_id','dh_hospital_name',15,9,5,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_readonly`,
`di_show_order`,`di_filtered`,`di_fuzzy`,`di_show_width`)
values(1100,'处方编码','p_code',6,32,0,14,15,2,4,10,0,0,0);

-- insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,
-- `di_show_order`,`di_required`,`di_show_width`,`di_filtered`)
-- values(1100,'处方类型','p_type',7,2,0,'0-普通门诊;1-门诊慢病;2-特种病;3-门诊统筹',0,15,15,30,0,100,1);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,
`di_show_order`,`di_required`,`di_show_width`,`di_filtered`)
values(1100,'处方类型','p_type',6,2,0,'00-普通门诊;10-门诊慢病;11-门诊统筹;20-特种病','00',15,15,30,0,100,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,
`di_show_order`,`di_required`,`di_show_width`,`di_filtered`)
values(1100,'问诊类型','p_consultation_type',7,2,0,'1-图文;2-视频;9-其他',1,15,15,30,0,100,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,
`di_show_order`,`di_required`,`di_show_width`,`di_filtered`)
values(1100,'药品类型','p_category',7,2,0,'1-西|中成药;2-中草药',1,15,15,35,0,100,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_required`,`di_show_width`)
values(1100,'患者姓名','p_sufferer_name',6,100,0,14,15,30,6,100);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_filtered`,`di_inputed`
,`di_fuzzy`,`di_show_order`,`di_show_width`)
values(1100,'患者电话','p_sufferer_mp',6,50,0,0,0,15,0,30,120);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_required`,`di_select`,
`di_show_order`, `di_show_width` )
values(1100,'来源','p_source',6,255,0,15,6,'HHIS-红杉HIS',50,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`
,`di_fuzzy`,`di_show_order`,`di_show_width`,`di_filtered`)
values(1100,'来源系统标识','p_source_trade_no',6,255,0,0,9,0,100,0,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_filtered`
,`di_fuzzy`,`di_curd`,`di_inputed`)
values(1100,'处方文件预览地址','p_prescription_url',9,255,0,0,0
,0,14,16);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`,`di_filtered`)
values(1100,'开方时间','p_order_time',5,1,-1,0,9,9,0,420,150,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`,`di_filtered`)
values(1100,'处方到期时间','p_vaild_time',5,1,-1,0,9,9,0,422,150,1);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`,`di_filtered`)
values(1100,'签方时间','p_doctor_sign_time',5,1,-1,0,9,9,0,425,150,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`,`di_filtered`)
values(1100,'审方时间','p_pharmacist_sign_time',5,1,-1,0,9,9,0,430,150,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`
,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_show_order`,`di_curd`,`di_inputed`)
values(1100,'复核出药人','p_check_user',1,-1,0,
503,'User','usr_id','usr_real_name',0,16,16);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_filtered`
,`di_inputed`,`di_fuzzy`,`di_curd`,`di_show_order`)
values(1100,'复核自查备注','p_check_remark',6,255,0,0,0,16,0,16,100);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`)
values(1100,'复核时间','p_check_time',5,1,-1,0,9,9,0,435,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`)
values(1100,'记账时间','p_accounting_time',5,1,-1,0,9,9,0,440,150);

INSERT INTO `cs_dict_item` (`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_show_width`, `di_inputed`, `di_curd`,`di_show_order`,`di_app_type`)
VALUES (1100, '签方成本', 'p_sign_cost_price', 2, 100, 16, 16,0,3);
INSERT INTO `cs_dict_item` (`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_show_width`, `di_inputed`, `di_curd`,`di_show_order`,`di_app_type`)
VALUES (1100, '签方成本', 'p_sign_cost_price', 2, 100, 9, 9,200,5);

INSERT INTO `cs_dict_item` (`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_show_width`, `di_inputed`, `di_curd`,`di_show_order`)
VALUES (1100, '签方费用', 'p_sign_transaction_price', 2, 100, 15, 15,200);

INSERT INTO `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_show_width`)
VALUES(1100,'扩展信息','p_extend',8,-1,0,0,'','','',14,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,
`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_curd`,`di_inputed`,`di_show_order`,`di_show_width`,`di_default`)
values(1100,'驳回人','p_reject_user',1,-1,0,503,'User','usr_id','usr_real_name',9,9,445,150,'0');

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,
`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`)
values(1100,'驳回时间','p_reject_time',5,1,-1,0,9,9,0,446,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_order`,`di_show_width`)
values(1100,'驳回原因','p_reject_reason',6,500,0,9,9,447,240);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,
`di_required`,`di_show_order`,`di_filtered`,`di_show_width`)
values(1100,'状态','p_state',7,2,0,'0-失效;1-开方中;2-已开方;3-已核销;4-已拒方;9-未知',1,15,12,0,450,1,80);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,
                            `di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`,`di_show_order`,`di_show_width`)
values(1100,'创建人','p_create_user',1,-1,0,16,15,
       503,'User','usr_id','usr_real_name','create_user',500,0);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`)
values(1100,'创建时间','p_create_time',5,1,-1,0,9,9,0,500,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`)
values(1100,'更新时间','p_update_time',5,1,-1,0,9,9,0,510,150);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`)
values(1100,'删除时间','p_delete_time',5,1,-1,0,9,9,0,520,150);

-- app_type=3 药店端只显示签方时间，其余处方时间字段隐藏
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`,`di_filtered`,`di_app_type`)
values(1100,'开方时间','p_order_time',5,1,-1,0,0,0,0,420,0,0,3);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`,`di_filtered`,`di_app_type`)
values(1100,'审方时间','p_pharmacist_sign_time',5,1,-1,0,0,0,0,430,0,0,3);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'复核时间','p_check_time',5,1,-1,0,0,0,0,435,0,3);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'记账时间','p_accounting_time',5,1,-1,0,0,0,0,440,0,3);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'创建时间','p_create_time',5,1,-1,0,0,0,0,500,0,3);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'更新时间','p_update_time',5,1,-1,0,0,0,0,510,0,3);

insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`
,`di_inputed`,`di_curd`,`di_required`,`di_show_order`,`di_show_width`,`di_app_type`)
values(1100,'删除时间','p_delete_time',5,1,-1,0,0,0,0,520,0,3);

-- 西药/中成药 1101：d_name按西药/中成药维护入口设置，d_tablename按cs_dict_drug去掉cs_后转DictDrug，d_prefix使用字段公共前缀dd_；di_inputed/di_curd按1刷新、2新增、4修改、8读取组合。
delete from `cs_dict` where d_id=1101;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1101,'西药/中成药','DictDrug','','dd_');
delete from `cs_dict_item` where di_dict=1101;
-- dd_id：主键，int自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'药品ID','dd_id',1,-1,0,1,1,1,6,0,9,0,10);
-- dd_genname：药品名称，varchar(150)，新增/修改必填、编辑只读，支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(1101,'药品名称','dd_genname',6,150,0,6,4,15,15,180,20,1,4);
-- dd_alias：别名，varchar(500)，维护字段，详情展示。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'别名','dd_alias',6,500,0,14,15,0,30);
-- dd_pinyin：拼音助记码，varchar(100)，用于keyword模糊查询，非主要维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(1101,'拼音助记码','dd_pinyin',6,5,100,0,9,9,140,40,1,4);
-- dd_bar_code：药品条形码，varchar(64)，列表展示并支持精确筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(1101,'药品条形码','dd_bar_code',6,64,0,15,15,140,50,1,0);
-- dd_tracing_code：追溯码前7位标识，text，多个值使用英文逗号分隔，新增/修改由后端同步到cs_dict_drug_tracing_code。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'追溯码标识','dd_tracing_code',8,-1,0,15,15,140,45);
-- dd_med_list_codg：医保编码，varchar(64)，列表展示并支持精确筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(1101,'医保编码','dd_med_list_codg',6,64,0,15,15,150,60,1,0);
-- dd_med_list_name：医保名称，varchar(150)，列表展示和维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'医保名称','dd_med_list_name',6,150,0,15,15,180,70);
-- dd_code：HIS编码/药品唯一标识码，当前西药入口隐藏且不参与通用CRUD。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`) values(1101,'HIS编码','dd_code',6,128,0,0,0,0,80,0);
-- dd_category：中药分类，tinyint，西药/中成药入口固定为无，前端隐藏但后端新增/修改允许写入。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'中药分类','dd_category',1,-1,0,'0-无;1-中药饮片;2-免煎药','0',0,6,0,90);
-- dd_drug_type：药品类型，tinyint，西药入口仅维护西药/中成药，新增/修改必填。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`) values(1101,'药品类型','dd_drug_type',1,-1,0,'1-西药;2-中成药','1',6,15,15,100,100,1);
-- dd_is_essential：是否基药，tinyint，布尔选项。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'是否基药','dd_is_essential',7,-1,0,'0-否;1-是','0',14,15,100,120);
-- dd_prodentp_name：生产厂商，varchar(150)，列表展示和维护字段，新增/修改必填。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'生产厂商','dd_prodentp_name',6,150,0,6,15,15,180,130);
-- dd_aprvno：国药准字，varchar(100)，列表展示并支持精确筛选，新增/修改必填。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(1101,'国药准字','dd_aprvno',6,100,0,6,15,15,160,140,1,0);
-- dd_is_antibacterial：是否抗菌药物，tinyint，布尔选项。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'是否抗菌药物','dd_is_antibacterial',7,-1,0,'0-否;1-是','0',14,15,120,150);
-- dd_antibacterial_level：抗菌药物级别，tinyint，固定选项来自字段注释。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'抗菌药物级别','dd_antibacterial_level',1,-1,0,'0-无;1-非限制级;2-限制级;3-特殊使用级','0',14,15,140,160);
-- dd_drug_toxicology：药品毒理类别，tinyint，固定选项1-普通;2-麻醉;3-精一;4-精二，默认1。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'药品毒理类别','dd_drug_toxicology',1,-1,0,'1-普通;2-麻醉;3-精一;4-精二','1',14,15,120,165);
-- dd_storage_method：存储方式，varchar(20)，关联药品存储方式码表，当前西药入口隐藏且不参与通用CRUD。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`) values(1101,'存储方式','dd_storage_method',6,20,0,0,0,0,0,170,0,120,'DrugStorageMethod','dsm_code','dsm_name');
-- dd_need_skin_test：是否皮试，tinyint，布尔选项，当前西药入口隐藏且不参与通用CRUD。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'是否皮试','dd_need_skin_test',7,-1,0,'0-否;1-是','0',0,0,0,180);
-- dd_drug_origin：药品来源目录，tinyint，固定选项来自字段注释，当前西药入口隐藏且不参与通用CRUD。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'药品来源目录','dd_drug_origin',1,-1,0,'0-未知;1-国家目录;2-地方目录;3-自费','0',0,0,0,190);
-- dd_drug_source：来源类型，tinyint，固定选项来自字段注释，当前西药入口隐藏且不参与通用CRUD。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'来源类型','dd_drug_source',1,-1,0,'0-未知;1-国产;2-进口;3-合资;4-医院外购;5-自采','0',0,0,0,200);
-- dd_classification_code：分类编码，varchar(255)，关联药品通用分类c_code，供症状诊断关系使用。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_key_join_name`) values(1101,'分类编码','dd_classification_code',6,255,0,14,15,140,210,109,'Classification','c_code','c_name','classification');
-- dd_package_spec：包装规格，varchar(100)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'包装规格','dd_package_spec',6,100,0,14,15,0,220);
-- dd_drug_dosform：剂型，varchar(64)，维护字段，新增/修改必填。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'剂型','dd_drug_dosform',6,64,0,6,14,15,120,230);
-- dd_dosform_spec：剂型规格，varchar(500)，列表规格优先展示字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'剂型规格','dd_dosform_spec',6,500,0,9,9,160,240);
-- dd_sale_unit：销售单位，varchar(32)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'销售单位','dd_sale_unit',6,32,0,14,15,100,250);
-- dd_min_pacunt：最小包装单位，varchar(32)，列表展示字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'最小包装单位','dd_min_pacunt',6,32,0,9,9,110,260);
-- dd_status：状态，tinyint，列表展示并支持精确筛选，新增/修改必填。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_required`,`di_filtered`,`di_fuzzy`) values(1101,'状态','dd_status',7,-1,0,'0-正常/启用;1-禁用/停用','0',15,15,100,270,6,1,0);
-- dd_adverse_reaction：不良反应，text，当前西药入口隐藏且不参与通用CRUD。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'不良反应','dd_adverse_reaction',8,-1,0,0,0,0,280);
-- dd_notice：注意事项，text，当前西药入口隐藏且不参与通用CRUD。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'注意事项','dd_notice',8,-1,0,0,0,0,290);
-- dd_reject_drug_note：抗拒药说明，text，当前西药入口隐藏且不参与通用CRUD。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'抗拒药说明','dd_reject_drug_note',8,-1,0,0,0,0,295);
-- dd_antibacterial_note：抗菌药说明，text，最大长度500，当前西药入口隐藏且不参与通用CRUD。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'抗菌药说明','dd_antibacterial_note',8,500,0,0,0,0,296);
-- dd_drug_spec：药品规格，varchar(255)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'药品规格','dd_drug_spec',6,255,0,0,15,15,160,300);
-- dd_spec_measure：规格计量，varchar(32)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'规格计量','dd_spec_measure',6,32,0,14,15,100,310);
-- dd_default_usage：默认用法，varchar(64)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'默认用法','dd_default_usage',6,64,0,14,15,120,320);
-- dd_default_frequency：默认频次，varchar(64)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'默认频次','dd_default_frequency',6,64,0,14,15,120,330);
-- dd_default_dose：默认剂量，varchar(32)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'默认剂量','dd_default_dose',6,32,0,14,15,100,340);
-- dd_default_dose_unit：默认剂量单位，varchar(32)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'默认剂量单位','dd_default_dose_unit',6,32,0,14,15,120,350);
-- dd_suggested_dose：建议剂量，varchar(32)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'建议剂量','dd_suggested_dose',6,32,0,14,15,100,360);
-- dd_suggested_dose_unit：建议剂量单位，varchar(32)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'建议剂量单位','dd_suggested_dose_unit',6,32,0,14,15,120,370);
-- dd_special_requirement：特殊要求，varchar(64)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1101,'特殊要求','dd_special_requirement',6,64,0,14,15,140,380);
-- dd_create_time：创建时间，bigint Unix时间戳，读取字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`) values(1101,'创建时间','dd_create_time',5,1,-1,0,9,9,0,150,390);
-- dd_update_time：更新时间，bigint Unix时间戳，读取字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`) values(1101,'更新时间','dd_update_time',5,1,-1,0,8,8,0,150,400);
-- dd_delete_time：删除时间，bigint Unix时间戳，系统软删除字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`,`di_default`) values(1101,'删除时间','dd_delete_time',5,1,-1,0,0,0,0,0,410,'0');

-- 中药饮片 1102：d_name按中药饮片入口设置，d_tablename按cs_dict_drug去掉cs_后转DictDrug，d_prefix使用字段公共前缀dd_；dd_category由中药分类下拉维护，dd_drug_type维护中草药/免煎药选项。
delete from `cs_dict` where d_id=1102;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1102,'中药饮片','DictDrug','','dd_');
delete from `cs_dict_item` where di_dict=1102;
-- dd_id：主键，int自增，必填且新增/修改只读。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'药品ID','dd_id',1,-1,0,1,1,1,6,0,9,0,10);
-- dd_genname：药品名称，varchar(150)，新增必填、编辑只读，支持模糊筛选。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`) values(1102,'药品名称','dd_genname',6,150,0,2,4,15,15,180,30,1,4);
-- dd_alias：别名，varchar(500)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'别名','dd_alias',6,500,0,14,15,0,40);
-- dd_med_list_codg：医保编码，varchar(64)，列表展示和维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'医保编码','dd_med_list_codg',6,64,0,15,15,150,50);
-- dd_med_list_name：医保名称，varchar(150)，列表展示和维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'医保名称','dd_med_list_name',6,150,0,15,15,180,60);
-- dd_category：中药分类，tinyint，中药入口可在中药饮片/免煎药间选择，新增/修改必填。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`) values(1102,'中药分类','dd_category',1,-1,0,'1-中药饮片;2-免煎药','1',6,15,15,120,70,1);
-- dd_drug_type：药品类型，tinyint，中药饮片入口维护中草药/免煎药，隐藏且不参与通用CRUD。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'药品类型','dd_drug_type',1,-1,0,'3-中草药;4-免煎药','3',6,0,0,0,80);
-- dd_drug_spec：规格，varchar(255)，维护字段，新增/修改必填。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'规格','dd_drug_spec',6,255,0,6,15,15,160,90);
-- dd_prodentp_name：生产厂商，varchar(150)，列表展示和维护字段，新增/修改必填。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'生产厂商','dd_prodentp_name',6,150,0,6,15,15,180,100);
-- dd_drug_dosform：剂型，varchar(64)，列表展示和维护字段，新增/修改必填。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'剂型','dd_drug_dosform',6,64,0,6,15,15,120,110);
-- dd_aprvno：国药准字，varchar(100)，列表展示和维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'国药准字','dd_aprvno',6,100,0,15,15,160,120);
-- dd_origin_place：产地，varchar(100)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'产地','dd_origin_place',6,100,0,14,15,120,130);
-- dd_drug_source：药品来源，tinyint，固定选项来自字段注释。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'药品来源','dd_drug_source',1,-1,0,'0-未知;1-国产;2-进口;3-合资;4-医院外购;5-自采','0',14,15,120,140);
-- dd_drug_toxicology：药品毒理类别，tinyint，固定选项1-普通;2-麻醉;3-精一;4-精二，默认1。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'药品毒理类别','dd_drug_toxicology',1,-1,0,'1-普通;2-麻醉;3-精一;4-精二','1',14,15,120,147);
-- dd_status：状态，tinyint，列表展示和启停维护字段，新增/修改必填。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_required`) values(1102,'状态','dd_status',7,-1,0,'0-正常/启用;1-禁用/停用','0',15,15,100,150,6);
-- dd_default_dose：默认剂量，varchar(32)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'默认剂量','dd_default_dose',6,32,0,14,15,100,160);
-- dd_default_dose_unit：默认剂量单位，varchar(32)，列表展示和维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'默认剂量单位','dd_default_dose_unit',6,32,0,15,15,120,170);
-- dd_suggested_dose：建议剂量，varchar(32)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'建议剂量','dd_suggested_dose',6,32,0,14,15,100,180);
-- dd_suggested_dose_unit：建议剂量单位，varchar(32)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'建议剂量单位','dd_suggested_dose_unit',6,32,0,14,15,120,190);
-- dd_special_requirement：特殊要求，varchar(64)，维护字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1102,'特殊要求','dd_special_requirement',6,64,0,14,15,140,200);
-- dd_create_time：创建时间，bigint Unix时间戳，新增时后端写入。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`) values(1102,'创建时间','dd_create_time',5,1,-1,0,9,9,0,150,210);
-- dd_update_time：更新时间，bigint Unix时间戳，新增/编辑时后端写入。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`) values(1102,'更新时间','dd_update_time',5,1,-1,0,8,8,0,150,220);
-- dd_delete_time：删除时间，bigint Unix时间戳，系统软删除字段。
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_required`,`di_show_width`,`di_show_order`,`di_default`) values(1102,'删除时间','dd_delete_time',5,1,-1,0,0,0,0,0,230,'0');

-- 用户协议管理 1103：d_tablename按cs_hospital_protocol去掉cs_后转HospitalProtocol，d_prefix使用字段公共前缀hp_。
delete from `cs_dict` where d_id=1103;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1103,'用户协议管理','HospitalProtocol','','hp_');
delete from `cs_dict_item` where di_dict=1103;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1103,'ID','hp_id',1,-1,0,1,1,1,6,9,9,100,10,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(1103,'开方机构','hp_hospital',1,-1,0,1,1003,'Hospital','h_id','h_name',15,15,150,15,'0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1103,'医院编码','hp_hospital_code',6,30,0,0,0,0,0,15,15,150,20,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1103,'用户协议名','hp_name',6,50,0,0,0,0,0,15,15,180,30,1,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1103,'协议归属','hp_type',1,-1,0,0,0,0,0,15,15,120,40,1,0,'0-通用;1-医生;2-医助;3-药师;4-患者','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1103,'场景编码','hp_scence',6,50,0,0,0,0,0,15,15,160,50,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1103,'存储方式','hp_way',6,20,0,0,0,0,0,15,15,120,60,1,0,'default-富文本内容;file-文件','default');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1103,'创建人员','hp_admin',1,-1,0,0,0,0,0,15,15,100,70,0,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1103,'富文本内容','hp_text',8,-1,0,0,0,0,0,15,15,0,80,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1103,'有效标志','hp_status',7,-1,0,0,0,0,0,15,15,100,90,1,0,'0-弃用;1-有效','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1103,'新建时间','hp_create_time',5,1,-1,0,9,9,150,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1103,'修改时间','hp_update_time',5,1,-1,0,8,8,150,110);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1103,'删除时间','hp_delete_time',5,1,-1,0,0,0,0,120);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1103,'系统文件','hp_sys_file',1,-1,0,0,0,0,0,15,15,100,130,0,0,'','0');

-- 电子签名模板表 1104：d_tablename按cs_esign_template去掉cs_后转EsignTemplate，d_prefix使用字段公共前缀et_。
delete from `cs_dict` where d_id=1104;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1104,'电子签名模板','EsignTemplate','','et_');
delete from `cs_dict_item` where di_dict=1104;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1104,'模板ID','et_id',1,-1,0,1,1,1,6,9,9,100,10,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1104,'上传文件名','et_template_name',6,255,0,0,0,1,0,15,15,220,20,1,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1104,'法大大模板ID','et_template_id',6,32,0,0,0,0,0,15,15,160,30,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1104,'医院编码','et_hospital_code',6,16,0,0,0,0,0,15,15,140,40,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1104,'签名驱动','et_sign_driver',6,20,0,0,0,0,0,15,15,120,50,1,0,'Esign-电子签名','Esign');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1104,'模板类型','et_type',1,-1,0,0,0,0,0,15,15,120,60,1,0,'1-西药处方;2-中药处方;3-病历','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1104,'是否默认','et_default',7,-1,0,0,0,0,0,15,15,100,70,1,0,'0-否;1-是','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1104,'是否生效','et_state',7,-1,0,0,0,0,0,15,15,100,80,1,0,'0-不生效;1-生效','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1104,'创建人','et_user',1,-1,0,0,0,0,0,15,15,100,90,0,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1104,'药师审方类型','et_pharm_review_type',1,-1,0,0,0,0,0,15,15,140,100,1,0,'1-无需药师复核;2-需要药师复核','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1104,'创建时间','et_create_time',5,1,-1,0,9,9,150,110);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1104,'更新时间','et_update_time',5,1,-1,0,8,8,150,120);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1104,'删除时间','et_delete_time',5,1,-1,0,0,0,0,130);

-- 电子签名印章表 1105：d_tablename按cs_esign_seals去掉cs_后转EsignSeals，主要字段公共前缀为es_，ea_account_id保留完整字段名。
delete from `cs_dict` where d_id=1105;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1105,'电子签名印章','EsignSeals','','es_');
delete from `cs_dict_item` where di_dict=1105;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1105,'印章ID','es_id',1,-1,0,1,1,1,6,9,9,100,10,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1105,'医院编码','es_hospital_code',6,16,0,0,0,0,0,15,15,140,20,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1105,'印章名称','es_seal_name',6,40,0,0,0,0,0,15,15,160,30,1,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1105,'印章文件标识','es_file_key',6,255,0,0,0,0,0,15,15,180,40,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1105,'印章唯一识别码','es_seal_id',6,50,0,0,0,0,0,15,15,180,50,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1105,'个人账号ID','ea_account_id',6,50,0,0,0,0,0,15,15,160,60,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1105,'是否默认','es_default',7,-1,0,0,0,0,0,15,15,100,70,1,0,'0-否;1-是','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1105,'审核结果','es_validate',1,-1,0,0,0,0,0,15,15,120,80,1,0,'0-未审核;1-审核中;2-审核成功;3-审核失败','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1105,'签名驱动','es_sign_driver',6,20,0,0,0,0,0,15,15,120,90,1,0,'Esign-电子签名','Esign');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1105,'创建人','es_user',1,-1,0,0,0,0,0,15,15,100,100,0,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1105,'创建时间','es_create_time',5,1,-1,0,9,9,150,110);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1105,'更新时间','es_update_time',5,1,-1,0,8,8,150,120);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1105,'删除时间','es_delete_time',5,1,-1,0,0,0,0,130);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1105,'印章结果','es_result',6,500,0,0,0,0,0,15,15,0,140,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1105,'申请编号','es_apply_code',6,50,0,0,0,0,0,15,15,160,150,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1105,'免验证签信息','es_free_sign',8,-1,0,0,0,0,0,14,15,0,160,0,0,'','');

-- 主体三方平台用户对接表 1106：d_tablename按cs_user_third_platform去掉cs_后转UserThirdPlatform，d_prefix使用字段公共前缀utp_。
delete from `cs_dict` where d_id=1106;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1106,'主体三方平台用户','UserThirdPlatform','','utp_');
delete from `cs_dict_item` where di_dict=1106;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'ID','utp_id',1,-1,0,1,1,1,6,9,9,100,10,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'三方应用识别编码','utp_appid',6,30,0,0,0,0,0,15,15,150,20,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'OpenID','utp_openid',6,50,0,0,0,0,0,15,15,160,30,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'UnionID','utp_unionid',6,32,0,0,0,0,0,15,15,150,40,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'第三方唯一标识','utp_third_union_code',6,64,0,0,0,0,0,15,15,180,50,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'账户昵称','utp_nickname',6,200,0,0,0,0,0,15,15,180,60,1,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'性别','utp_sex',7,-1,0,0,0,0,0,15,15,80,70,1,0,'0-未知;1-男;2-女','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'头像','utp_header_img',6,255,0,0,0,0,0,14,15,0,80,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'市','utp_city',6,32,0,0,0,0,0,15,15,100,90,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'省','utp_province',6,32,0,0,0,0,0,15,15,100,100,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'国家','utp_country',6,32,0,0,0,0,0,15,15,100,110,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'备注','utp_remark',6,255,0,0,0,0,0,14,15,0,120,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'来源appid','utp_source_appid',6,32,0,0,0,0,0,15,15,150,130,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'账户类型','utp_account_type',1,-1,0,0,0,0,0,15,15,100,140,1,0,'1-小程序;2-公众号;3-手机app;9-其他','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'账户分组','utp_account_group',1,-1,0,0,0,0,0,15,15,100,150,1,0,'1-微信;2-支付宝;3-应用软件;9-其他','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'用户','utp_user',1,-1,0,0,0,0,0,15,15,100,160,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1106,'扩展信息','utp_extend',8,-1,0,0,0,0,0,14,15,0,170,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1106,'创建时间','utp_create_time',5,1,-1,0,9,9,150,180);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1106,'修改时间','utp_update_time',5,1,-1,0,8,8,150,190);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1106,'删除时间','utp_delete_time',5,1,-1,0,0,0,0,200);

-- 家庭成员表 1107：字段统一使用m_前缀，di_fieldname保留完整物理字段名。
delete from `cs_dict` where d_id=1107;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1107,'家庭成员','Member','','m_');
delete from `cs_dict_item` where di_dict=1107;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'序号','m_id',1,-1,0,1,1,1,6,9,9,100,10);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(1107,'开方机构','m_hospital',1,-1,0,1,1003,'Hospital','h_id','h_name',15,15,160,20,'0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_filtered`,`di_fuzzy`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'姓名','m_real_name',6,32,0,6,1,4,15,15,140,30);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'手机号','m_mobile',6,11,0,6,1,15,15,120,40);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'备用联系方式','m_mp',6,15,0,15,15,120,50);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_pwded`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'身份证号','m_idcard',6,6,32,0,1,15,15,180,60);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'证件类型','m_certificate_type',6,3,0,100,'CertificateType','ct_code','ct_name',15,15,160,70);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_required`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'证件号','m_cert_code',6,50,0,6,15,15,180,80);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'性别','m_sex',7,-1,0,'0-未知;1-男;2-女','0',1,15,15,80,90);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'年龄','m_age',1,-1,0,'0',15,15,80,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'年龄单位','m_age_unit',1,-1,0,'1-岁;2-月;3-天','1',15,15,100,110);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'出生日期','m_birth',3,1,-1,0,15,15,120,120);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'患者体重','m_weight',6,32,0,15,15,100,130);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'用户','m_user_id',1,-1,0,'0',1,15,15,100,140);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'行政区划','m_house_area',6,10,0,1,103,'HouseArea','ha_code','ha_name',15,15,160,150);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'居住地址','m_address',8,255,0,14,14,240,160);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'关系','m_relation',1,-1,0,'0-本人;1-父母;2-子女;3-夫妻;4-亲属;5-朋友;6-其他','6',1,15,15,120,170);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'民族','m_nation',6,2,0,102,'Nation','na_code','na_name',15,15,120,180);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'健康卡信息','m_health_card',6,500,0,14,14,0,190);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'健康卡扩展信息','m_health_card_extend',8,1,-1,0,14,14,0,200);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'健康卡状态','m_health_card_state',7,-1,0,'0-不可用;1-可用','0',1,15,15,100,210);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'医保标识','m_med_card',6,500,0,14,14,0,220);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'医保扩展信息','m_med_card_extend',8,1,-1,0,14,14,0,230);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_fuzzy`) values(1107,'监护人姓名','m_guardian_name',6,50,0,15,15,140,240,1);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'监护人关系','m_guardian_relation',1,-1,0,'0',15,15,120,250);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_fuzzy`) values(1107,'监护人关系名称','m_guardian_relation_name',6,255,0,15,15,180,260,1);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_pwded`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'监护人证件号','m_guardian_id_card',6,6,100,0,1,15,15,180,270);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'监护人手机号','m_guardian_mp',6,20,0,15,15,120,280);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_filtered`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'是否实名','m_is_real_name',7,-1,0,'0-否;1-是','0',1,15,15,100,290);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'创建时间','m_create_time',5,1,-1,0,9,9,160,300);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'更新时间','m_update_time',5,1,-1,0,8,8,160,310);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1107,'删除时间','m_delete_time',5,1,-1,0,0,0,0,320);

-- 互联网医院就诊单表 1108：d_tablename按cs_book_order去掉cs_后转BookOrder，d_prefix使用字段公共前缀bo_。
delete from `cs_dict` where d_id=1108;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1108,'互联网医院就诊单','BookOrder','','bo_');
delete from `cs_dict_item` where di_dict=1108;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'就诊单ID','bo_id',1,-1,0,1,1,1,6,9,9,100,10,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(1108,'开方机构','bo_hospital',1,-1,0,1,1003,'Hospital','h_id','h_name',15,15,150,15,'0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'医院编码','bo_hospital_code',6,32,0,0,0,0,0,15,15,150,20,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'就诊号','bo_book_no',6,32,0,0,0,0,0,15,15,150,30,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'小程序用户ID','bo_user_id',1,-1,0,0,0,0,0,15,15,100,40,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'就诊人ID','bo_member_id',1,-1,0,0,0,0,0,15,15,100,50,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'患者姓名','bo_member_name',6,32,0,0,0,0,0,15,15,120,60,1,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_pwded`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'患者身份证','bo_member_idcard',6,6,100,0,0,0,0,0,1,15,15,180,70,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'患者手机号','bo_member_mobile',6,20,0,0,0,0,0,15,15,120,80,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'患者性别','bo_member_sex',7,-1,0,0,0,0,0,15,15,80,90,1,0,'0-未知;1-男;2-女','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'患者年龄','bo_member_age',1,-1,0,0,0,0,0,15,15,80,100,0,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'年龄单位','bo_member_age_unit',6,10,0,0,0,0,0,15,15,80,110,0,0,'1-岁;2-月;3-天','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'患者体重','bo_member_weight',6,32,0,0,0,0,0,15,15,100,120,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'监护人姓名','bo_guardian_name',6,50,0,0,0,0,0,15,15,140,130,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_pwded`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'监护人身份证号','bo_guardian_idcard',6,6,100,0,0,0,0,0,1,15,15,180,140,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'科室ID','bo_branch_id',1,-1,0,0,0,0,0,15,15,100,150,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'科室名称','bo_branch_name',6,50,0,0,0,0,0,15,15,140,160,1,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'医生ID','bo_doctor_id',1,-1,0,0,0,0,0,15,15,100,170,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'医生名称','bo_doctor_name',6,50,0,0,0,0,0,15,15,140,180,1,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'就诊类型','bo_visit_type',1,-1,0,0,0,0,0,15,15,120,190,1,0,'1-图文问诊;2-视频问诊;9-其他','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'挂号类型','bo_regist_type',1,-1,0,0,0,0,0,15,15,120,195,1,0,'1-复诊购药;2-在线问诊','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'挂号方式','bo_regist_way',1,-1,0,0,0,0,0,15,15,140,200,1,0,'1-咨询购药;2-实名健康卡;3-医保挂号','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'来源','bo_source',1,-1,0,0,0,0,0,15,15,100,210,1,0,'1-互联网医院小程序;2-实体医院流转;3-第三方','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'来源标识','bo_source_name',6,255,0,0,0,0,0,15,15,200,215,1,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'来源方唯一就诊标识','bo_source_union_code',6,255,0,0,0,0,0,15,15,240,218,1,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'问诊组编码','bo_group_code',6,64,0,0,0,0,0,15,15,160,220,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'就诊状态','bo_status',1,-1,0,0,0,0,0,15,15,120,230,1,0,'0-草稿;1-待接诊;2-接诊中;3-已完成;4-已取消;5-已过期','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1108,'有效截止时间','bo_valid_until_time',5,1,-1,0,9,9,150,240);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1108,'接诊时间','bo_accept_time',5,1,-1,0,9,9,150,250);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1108,'完成时间','bo_finish_time',5,1,-1,0,9,9,150,260);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1108,'取消时间','bo_cancel_time',5,1,-1,0,9,9,150,270);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1108,'扩展信息','bo_extend',8,-1,0,0,0,0,0,14,15,0,280,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1108,'创建时间','bo_create_time',5,1,-1,0,9,9,150,290);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1108,'更新时间','bo_update_time',5,1,-1,0,8,8,150,300);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1108,'删除时间','bo_delete_time',5,1,-1,0,0,0,0,310);

-- 互联网医院处方明细表 1109：d_tablename按cs_prescription_detail去掉cs_后转PrescriptionDetail，d_prefix使用字段公共前缀pd_。
delete from `cs_dict` where d_id=1109;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1109,'互联网医院处方明细','PrescriptionDetail','','pd_');
delete from `cs_dict_item` where di_dict=1109;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'处方明细ID','pd_id',1,-1,0,1,1,1,6,9,9,100,10,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'处方ID','pd_prescription_id',1,-1,0,0,0,0,0,15,15,100,20,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(1109,'开方机构','pd_hospital',1,-1,0,1,1003,'Hospital','h_id','h_name',15,15,150,25,'0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'医院编码','pd_hospital_code',6,32,0,0,0,0,0,15,15,150,30,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'处方号','pd_prescription_no',6,32,0,0,0,0,0,15,15,150,40,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'就诊号','pd_book_no',6,32,0,0,0,0,0,15,15,150,50,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'药品ID','pd_drug_id',1,-1,0,0,0,0,0,0,15,0,60,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'药品类型','pd_drug_type',1,-1,0,0,0,0,0,15,15,100,70,1,0,'1-西药;2-中成药;3-中草药','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'药品名称','pd_drug_name',6,100,0,0,0,0,0,15,15,180,80,1,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'药品别名','pd_drug_alias',6,100,0,0,0,0,0,15,15,160,90,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'药品规格','pd_drug_spec',6,100,0,0,0,0,0,15,15,140,100,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'剂型','pd_dosform',6,100,0,0,0,0,0,15,15,120,110,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'生产厂家','pd_prodentp_name',6,100,0,0,0,0,0,15,15,180,120,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'批准文号','pd_aprvno',6,100,0,0,0,0,0,15,15,160,130,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'医保编码','pd_med_list_codg',6,50,0,0,0,0,0,15,15,150,140,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'医保名称','pd_med_list_name',6,100,0,0,0,0,0,15,15,180,150,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'单次剂量','pd_dose',6,32,0,0,0,0,0,15,15,100,160,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'剂量单位','pd_dose_unit',6,32,0,0,0,0,0,15,15,100,170,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'用法','pd_usage',6,100,0,0,0,0,0,15,15,120,180,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'频次','pd_frequency',6,100,0,0,0,0,0,15,15,120,190,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'用药天数','pd_days',1,-1,0,0,0,0,0,15,15,100,200,0,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'总量','pd_total',6,32,0,0,0,0,0,15,15,100,210,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'总量单位','pd_unit',6,32,0,0,0,0,0,15,15,100,220,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'分组号','pd_group_no',6,32,0,0,0,0,0,15,15,100,230,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'特殊要求','pd_requirements',6,255,0,0,0,0,0,14,15,180,240,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'备注','pd_remark',6,255,0,0,0,0,0,14,15,0,250,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1109,'排序值','pd_sort_no',1,-1,0,0,0,0,0,15,15,80,260,0,0,'','1000');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1109,'创建时间','pd_create_time',5,1,-1,0,9,9,150,270);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1109,'更新时间','pd_update_time',5,1,-1,0,8,8,150,280);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1109,'删除时间','pd_delete_time',5,1,-1,0,0,0,0,290);

-- 互联网医院病历表 1110：d_tablename按cs_medical_record去掉cs_后转MedicalRecord，d_prefix使用字段公共前缀mr_。
delete from `cs_dict` where d_id=1110;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1110,'互联网医院病历','MedicalRecord','','mr_');
delete from `cs_dict_item` where di_dict=1110;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'病历ID','mr_id',1,-1,0,1,1,1,6,9,9,100,10,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(1110,'开方机构','mr_hospital',1,-1,0,1,1003,'Hospital','h_id','h_name',15,15,150,15,'0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'医院编码','mr_hospital_code',6,32,0,0,0,0,0,15,15,150,20,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_default`) values(1110,'诊疗类型','mr_med_type',6,4,0,15,15,100,25,1,'1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1110,'医保信息','mr_med_extend',8,-1,0,14,15,0,27);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'就诊号','mr_book_no',6,32,0,0,0,0,0,15,15,150,30,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`) values(1110,'医保卡识别码','mr_member_med_code',6,32,0,15,15,150,35,1);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'就诊人ID','mr_member_id',1,-1,0,0,0,0,0,15,15,100,40,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'主诉','mr_chief_complaint',6,500,0,0,0,0,0,15,15,0,50,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'现病史','mr_present_illness',6,1000,0,0,0,0,0,15,15,0,60,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'既往史','mr_past_history',6,1000,0,0,0,0,0,15,15,0,70,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'过敏史','mr_allergy_history',6,1000,0,0,0,0,0,15,15,0,80,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'家族史','mr_family_history',6,1000,0,0,0,0,0,15,15,0,90,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'个人史','mr_personal_history',6,1000,0,0,0,0,0,15,15,0,100,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'诊断','mr_diagnosis',8,-1,0,0,0,0,0,15,15,0,110,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1110,'中医诊断','mr_herb_diagnose',8,-1,0,14,15,0,115);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1110,'中医证候','mr_herb_syndrome',8,-1,0,14,15,0,118);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'处理意见','mr_treatment_advice',6,1000,0,0,0,0,0,15,15,0,120,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'医生备注','mr_doctor_remark',6,500,0,0,0,0,0,14,15,0,130,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'结算类型','mr_settlement_type',1,-1,0,0,0,0,0,15,15,100,150,1,0,'1-普通;2-医保','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_select`,`di_default`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`) values(1110,'结算状态','mr_settlement_state',7,-1,0,'0-未处理;1-已结算','0',15,15,100,155,1);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'状态','mr_status',1,-1,0,0,0,0,0,15,15,100,160,1,0,'0-草稿;1-有效;2-已完成;3-作废','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'扩展信息','mr_extend',8,-1,0,0,0,0,0,14,15,0,170,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1110,'初诊扩展信息','mr_first_visit_extend',8,-1,0,14,15,0,175);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'创建人','mr_create_user',6,64,0,0,0,0,0,9,9,120,180,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1110,'更新人','mr_update_user',6,64,0,0,0,0,0,8,8,120,190,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1110,'创建时间','mr_create_time',5,1,-1,0,9,9,150,200);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1110,'更新时间','mr_update_time',5,1,-1,0,8,8,150,210);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1110,'删除时间','mr_delete_time',5,1,-1,0,0,0,0,220);

-- 互联网医院自动分配配置表 1111：d_tablename按cs_online_assign_config去掉cs_后转OnlineAssignConfig，d_prefix使用字段公共前缀oac_。
delete from `cs_dict` where d_id=1111;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1111,'互联网医院自动分配配置','OnlineAssignConfig','','oac_');
delete from `cs_dict_item` where di_dict=1111;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'自动分配配置ID','oac_id',1,-1,0,1,1,1,6,9,9,100,10,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(1111,'开方机构','oac_hospital',1,-1,0,1,1003,'Hospital','h_id','h_name',15,15,150,15,'0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'医院编码','oac_hospital_code',6,32,0,0,0,0,0,15,15,150,20,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'开启自动分配','oac_enabled',7,-1,0,0,0,0,0,15,15,120,30,1,0,'0-否;1-是','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'自动分配开始时间','oac_start_time',6,8,0,0,0,0,0,15,15,120,40,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'自动分配结束时间','oac_end_time',6,8,0,0,0,0,0,15,15,120,50,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1111,'配置失效时间','oac_expire_time',5,1,-1,0,15,15,150,60);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'分配模式','oac_assign_mode',1,-1,0,0,0,0,0,15,15,120,70,1,0,'1-在线优先;2-指定人员;3-最少接诊数','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'适用就诊类型','oac_visit_type',1,-1,0,0,0,0,0,15,15,120,80,1,0,'0-全部;1-图文问诊;2-视频问诊;3-复诊开方;4-购药开方','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'候选医生ID列表','oac_doctor_ids',8,-1,0,0,0,0,0,14,15,0,100,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'候选医助ID列表','oac_assistant_ids',8,-1,0,0,0,0,0,14,15,0,110,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'候选药师ID列表','oac_pharmacist_ids',8,-1,0,0,0,0,0,14,15,0,120,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'最大接诊中数量','oac_max_active_count',1,-1,0,0,0,0,0,15,15,120,130,0,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'开启自动签方','oac_auto_sign_enabled',7,-1,0,0,0,0,0,15,15,120,140,1,0,'0-否;1-是','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'自动签方比例','oac_auto_sign_rate',1,-1,0,0,0,0,0,15,15,120,150,0,0,'','100');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'自动签方有效时长','oac_sign_valid_hours',1,-1,0,0,0,0,0,15,15,140,160,0,0,'','6');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'状态','oac_status',7,-1,0,0,0,0,0,15,15,100,170,1,0,'0-停用;1-启用','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'扩展配置','oac_extend',8,-1,0,0,0,0,0,14,15,0,180,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1111,'创建时间','oac_create_time',5,1,-1,0,9,9,150,190);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'创建人','oac_create_user',6,64,0,0,0,0,0,9,9,120,200,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1111,'更新时间','oac_update_time',5,1,-1,0,8,8,150,210);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1111,'更新人','oac_update_user',6,64,0,0,0,0,0,8,8,120,220,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1111,'删除时间','oac_delete_time',5,1,-1,0,0,0,0,230);

-- 互联网医院在线问诊群组表 1112：d_tablename按cs_online_inquiry_group去掉cs_后转OnlineInquiryGroup，d_prefix使用字段公共前缀oig_。
delete from `cs_dict` where d_id=1112;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1112,'互联网医院在线问诊群组','OnlineInquiryGroup','','oig_');
delete from `cs_dict_item` where di_dict=1112;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'问诊组ID','oig_id',1,-1,0,1,1,1,6,9,9,100,10,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(1112,'开方机构','oig_hospital',1,-1,0,1,1003,'Hospital','h_id','h_name',15,15,150,15,'0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'医院编码','oig_hospital_code',6,32,0,0,0,0,0,15,15,150,20,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'会话驱动','oig_driver',6,32,0,0,0,0,0,15,15,120,30,1,0,'qcloud-腾讯云IM','qcloud');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'会话驱动appid','oig_driver_appid',6,64,0,0,0,0,0,15,15,160,40,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'通讯群组ID','oig_group_code',6,64,0,0,0,0,0,15,15,160,50,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'通讯群组名称','oig_group_name',6,100,0,0,0,0,0,15,15,180,60,1,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'就诊号','oig_book_no',6,32,0,0,0,0,0,15,15,150,70,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'患者用户ID','oig_user_id',1,-1,0,0,0,0,0,15,15,100,80,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'患者扩展信息','oig_user_extend',8,-1,0,0,0,0,0,14,15,0,90,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'就诊人ID','oig_member_id',1,-1,0,0,0,0,0,15,15,100,100,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'医生ID','oig_doctor_id',1,-1,0,0,0,0,0,15,15,100,110,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'医生扩展信息','oig_doctor_extend',8,-1,0,0,0,0,0,14,15,0,120,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'医助ID','oig_assistant_id',1,-1,0,0,0,0,0,15,15,100,130,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'医助扩展信息','oig_assistant_extend',8,-1,0,0,0,0,0,14,15,0,140,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'科室ID','oig_branch_id',1,-1,0,0,0,0,0,15,15,100,150,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'问诊组类型','oig_group_type',1,-1,0,0,0,0,0,15,15,120,160,1,0,'1-快速咨询;2-挂号问诊;3-咨询购药;4-开方购药','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'创建来源','oig_from_type',6,30,0,0,0,0,0,15,15,120,170,1,0,'consult-快速咨询;book-挂号问诊;prescription-开方','consult');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'来源类型','oig_source_type',6,50,0,0,0,0,0,15,15,120,180,1,0,'miniapp-小程序;hospital-开方机构内部;suppliers-渠道商;open_platform-三方诊室','miniapp');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'来源编码','oig_source_code',6,100,0,0,0,0,0,15,15,160,190,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'群组状态','oig_state',1,-1,0,0,0,0,0,15,15,100,200,1,0,'0-关闭;1-开启;2-结束问诊','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'诊室状态','oig_session_status',1,-1,0,0,0,0,0,15,15,120,210,1,0,'1-待接诊;2-接诊中;3-已结束;4-已取消;5-商城开方;9-咨询中','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1112,'会话有效期','oig_valid_until_time',5,1,-1,0,9,9,150,220);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1112,'接诊时间','oig_accept_time',5,1,-1,0,9,9,150,230);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1112,'结束时间','oig_finish_time',5,1,-1,0,9,9,150,240);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1112,'关闭时间','oig_close_time',5,1,-1,0,9,9,150,250);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'场景阶段','oig_scene',8,-1,0,0,0,0,0,14,15,0,260,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'创建初始化数据','oig_create_extend',8,-1,0,0,0,0,0,14,15,0,270,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'音视频扩展信息','oig_vod_extend',8,-1,0,0,0,0,0,14,15,0,290,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'音视频累计时长','oig_vod_seconds',1,-1,0,0,0,0,0,15,15,120,300,0,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'评分','oig_score',1,-1,0,0,0,0,0,15,15,80,310,0,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'满意度','oig_satisfaction',2,-1,0,0,0,0,0,15,15,100,320,0,0,'','0.0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'评价内容','oig_evaluation',6,500,0,0,0,0,0,14,15,0,330,0,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1112,'评价时间','oig_evaluation_time',5,1,-1,0,9,9,150,340);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'评价状态','oig_evaluation_status',7,-1,0,0,0,0,0,15,15,100,350,1,0,'0-关闭;1-开启','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'是否默认评价','oig_is_default_evaluation',7,-1,0,0,0,0,0,15,15,120,360,1,0,'0-否;1-是','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'监管上报状态','oig_report_status',6,50,0,0,0,0,0,15,15,160,370,0,0,'','000000000');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'推送客户信息','oig_report_customer_status',7,-1,0,0,0,0,0,15,15,120,380,1,0,'0-否;1-是','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'患者IP','oig_user_ip',6,64,0,0,0,0,0,15,15,120,400,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'扩展信息','oig_extend',8,-1,0,0,0,0,0,14,15,0,410,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1112,'创建时间','oig_create_time',5,1,-1,0,9,9,150,420);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'创建人','oig_create_user',6,64,0,0,0,0,0,9,9,120,430,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1112,'更新时间','oig_update_time',5,1,-1,0,8,8,150,440);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1112,'更新人','oig_update_user',6,64,0,0,0,0,0,8,8,120,450,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1112,'删除时间','oig_delete_time',5,1,-1,0,0,0,0,460);

-- 互联网医院在线问诊聊天记录表 1113：d_tablename按cs_online_inquiry_record去掉cs_后转OnlineInquiryRecord，d_prefix使用字段公共前缀oir_。
delete from `cs_dict` where d_id=1113;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1113,'互联网医院在线问诊聊天记录','OnlineInquiryRecord','','oir_');
delete from `cs_dict_item` where di_dict=1113;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'聊天记录ID','oir_id',1,-1,0,1,1,1,6,9,9,100,10,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(1113,'开方机构','oir_hospital',1,-1,0,1,1003,'Hospital','h_id','h_name',15,15,150,15,'0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`) values(1113,'医院编码','oir_hospital_code',6,32,0,15,15,150,20,1);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'问诊组ID','oir_online_inquiry_group',1,-1,0,0,0,0,0,15,15,120,30,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'通讯群组ID','oir_communication_id',6,64,0,0,0,0,0,15,15,160,40,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'会话驱动','oir_driver',6,32,0,0,0,0,0,15,15,120,50,1,0,'qcloud-腾讯云IM','qcloud');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'会话驱动appid','oir_driver_appid',6,64,0,0,0,0,0,15,15,160,60,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'腾讯消息ID','oir_msg_id',6,128,0,0,0,0,0,15,15,180,70,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'消息序列号','oir_sequence',1,-1,0,0,0,0,0,15,15,120,80,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'消息随机数','oir_random',1,-1,0,0,0,0,0,15,15,120,90,0,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1113,'发言时间','oir_time',5,1,-1,0,9,9,150,100);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'发言人表名','oir_user_table',6,100,0,0,0,0,0,15,15,120,110,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'发言人ID','oir_user_id',1,-1,0,0,0,0,0,15,15,100,120,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'会话成员ID','oir_communication_user_id',6,100,0,0,0,0,0,15,15,160,130,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'会话成员名片','oir_communication_user_name_card',6,100,0,0,0,0,0,15,15,160,140,1,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'消息类型','oir_type',1,-1,0,0,0,0,0,15,15,120,150,1,0,'1-文字;2-文件信息;3-自定义窗体;4-系统/音视频事件','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'消息子类型','oir_sub_type',1,-1,0,0,0,0,0,15,15,120,160,1,0,'','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'消息描述','oir_mess',6,1000,0,0,0,0,0,15,15,220,170,1,1,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'消息扩展信息','oir_mess_extend',8,-1,0,0,0,0,0,14,15,0,180,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'音视频房间号','oir_vod_room',6,255,0,0,0,0,0,15,15,160,190,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1113,'扩展信息','oir_extend',8,-1,0,0,0,0,0,14,15,0,200,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1113,'创建时间','oir_create_time',5,1,-1,0,9,9,150,210);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1113,'更新时间','oir_update_time',5,1,-1,0,8,8,150,220);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1113,'删除时间','oir_delete_time',5,1,-1,0,0,0,0,230);

-- 互联网医院科室表 1114：本次仅维护开方机构关联字段。
delete from `cs_dict` where d_id=1114;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1114,'互联网医院科室','Branch','','b_');
delete from `cs_dict_item` where di_dict=1114;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(1114,'开方机构','b_hospital',1,-1,0,1,1003,'Hospital','h_id','h_name',15,15,150,20,'0');

-- 支付退款及通知流水表 1115：本次仅维护开方机构关联字段。
delete from `cs_dict` where d_id=1115;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1115,'支付退款及通知流水','PaymentTransaction','','pt_');
delete from `cs_dict_item` where di_dict=1115;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(1115,'开方机构','pt_hospital',1,-1,0,1,1003,'Hospital','h_id','h_name',15,15,150,30,'0');

-- 在线问诊群组成员记录表 1116：d_tablename按cs_online_inquiry_member去掉cs_后转OnlineInquiryMember，d_prefix使用字段公共前缀oim_。
delete from `cs_dict` where d_id=1116;
insert into `cs_dict`(`d_id`,`d_name`,`d_tablename`,`d_sub`,`d_prefix`) values(1116,'互联网医院问诊组成员','OnlineInquiryMember','','oim_');
delete from `cs_dict_item` where di_dict=1116;
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1116,'成员ID','oim_id',1,-1,0,1,1,1,6,9,9,100,10,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1116,'成员角色','oim_user_type',1,-1,0,0,0,0,0,15,15,120,20,1,0,'0-未知;1-医生;2-医助;4-患者','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1116,'成员角色子分类','oim_user_sub_type',1,-1,0,0,0,0,0,15,15,140,30,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1116,'成员关联人ID','oim_user',1,-1,0,0,0,0,0,15,15,140,40,1,0,'','0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(1116,'开方机构','oim_hospital',1,-1,0,1,1003,'Hospital','h_id','h_name',15,15,150,50,'0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_filtered`,`di_key_dict`,`di_key_table`,`di_key_field`,`di_key_show`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_default`) values(1116,'问诊组','oim_online_inquiry_group',1,-1,0,1,1112,'OnlineInquiryGroup','oig_id','oig_group_code',15,15,160,60,'0');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1116,'通讯群组ID','oim_group_code',6,64,0,0,0,0,0,15,15,160,70,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1116,'会话角色ID','oim_group_user_account',6,50,0,0,0,0,0,15,15,160,80,1,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1116,'消息扩展信息','oim_extend',8,-1,0,0,0,0,0,14,14,0,90,0,0,'','');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_max`,`di_min`,`di_pk`,`di_autoed`,`di_required`,`di_readonly`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`,`di_filtered`,`di_fuzzy`,`di_select`,`di_default`) values(1116,'状态','oim_state',7,-1,0,0,0,0,0,15,15,100,100,1,0,'0-退出;1-正常','1');
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1116,'创建时间','oim_create_time',5,1,-1,0,9,9,150,110);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1116,'更新时间','oim_update_time',5,1,-1,0,8,8,150,120);
insert into `cs_dict_item`(`di_dict`,`di_name`,`di_fieldname`,`di_type`,`di_subtype`,`di_max`,`di_min`,`di_inputed`,`di_curd`,`di_show_width`,`di_show_order`) values(1116,'删除时间','oim_delete_time',5,1,-1,0,0,0,0,130);


-- Synced DML from .tmp/update_docs_sql_data.sql.
-- Source order is preserved; transaction controls and diagnostic queries are intentionally omitted.

UPDATE `cs_dict_item`
SET
  `di_name` = '应用类型',
  `di_select` = '0-全部;1-管理后台;7-互联网问诊;3-门店;5-渠道;2-集团',
  `di_filtered` = 1,
  `di_inputed` = 15,
  `di_curd` = 15,
  `di_show_order` = 15
WHERE `di_dict` = 506
  AND `di_fieldname` = 'r_app_type';

UPDATE `cs_dict_item`
SET `di_show_order` = 20
WHERE `di_dict` = 506
  AND `di_fieldname` = 'r_name';

UPDATE `cs_dict_item`
SET `di_show_order` = 30
WHERE `di_dict` = 506
  AND `di_fieldname` = 'r_systemed';

UPDATE `cs_dict_item`
SET `di_show_order` = 40
WHERE `di_dict` = 506
  AND `di_fieldname` = 'r_level';

UPDATE `cs_dict_item`
SET `di_show_order` = 50
WHERE `di_dict` = 506
  AND `di_fieldname` = 'r_mark';

UPDATE `cs_dict_item`
SET `di_show_order` = 60
WHERE `di_dict` = 506
  AND `di_fieldname` = 'r_state';

UPDATE `cs_dict_item`
SET
  `di_name` = '创建人',
  `di_type` = 1,
  `di_subtype` = 0,
  `di_key_dict` = 503,
  `di_key_table` = 'User',
  `di_key_field` = 'usr_id',
  `di_key_show` = 'usr_real_name',
  `di_key_join_name` = '',
  `di_key_join_type` = 'left',
  `di_key_condition` = '',
  `di_key_visible` = 0,
  `di_inputed` = 9,
  `di_curd` = 9,
  `di_show_order` = 70
WHERE `di_dict` = 506
  AND `di_fieldname` = 'r_create_user';

UPDATE `cs_dict_item`
SET
  `di_name` = '创建时间',
  `di_inputed` = 9,
  `di_curd` = 9,
  `di_show_order` = 80
WHERE `di_dict` = 506
  AND `di_fieldname` = 'r_create_time';

UPDATE `cs_dict_item`
SET `di_select` = '0-首页;1-管理员;2-集团;3-药店;4-用户;5-渠道;6-医院;7-互联网医院'
WHERE `di_dict` = 503
  AND `di_fieldname` = 'usr_app_type';

UPDATE `cs_dict_item`
SET `di_app_type` = 1,
    `di_inputed` = 15,
    `di_curd` = 15,
    `di_readonly` = 0,
    `di_show_dict` = 0,
    `di_show_table` = '',
    `di_show_field` = ''
WHERE `di_dict` = 503
  AND `di_fieldname` IN ('usr_corporation', 'usr_pharmacy', 'usr_distributor');

INSERT INTO `cs_dict_item`
(`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`, `di_inputed`, `di_input_width`, `di_show_order`, `di_curd`, `di_group`, `di_select`, `di_filtered`, `di_app_type`, `di_remark`)
SELECT 1001, '门店Logo', 'p_logo_file', 1, 0, -1, 0, 0, 0, 0, '', '', '', 100, 0, 0, 510, '', 'f_id', 'f_url', 'logo_file', 'left', '', 0, 0, 0, 0, '', '', 0, '', '', '', 0, 0, 1, 0, 30, 15, '', '', 0, 0, '门店Logo文件ID'
WHERE NOT EXISTS (SELECT 1 FROM `cs_dict_item` WHERE `di_dict` = 1001 AND `di_fieldname` = 'p_logo_file');

INSERT INTO `cs_dict_item`
(`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`, `di_inputed`, `di_input_width`, `di_show_order`, `di_curd`, `di_group`, `di_select`, `di_filtered`, `di_app_type`, `di_remark`)
SELECT 1001, '医疗许可证', 'p_medical_license_file', 1, 0, -1, 0, 0, 0, 0, '', '', '', 100, 0, 0, 510, '', 'f_id', 'f_url', 'medical_license_file', 'left', '', 0, 0, 0, 0, '', '', 0, '', '', '', 0, 0, 1, 0, 31, 15, '', '', 0, 0, '医疗许可证文件ID'
WHERE NOT EXISTS (SELECT 1 FROM `cs_dict_item` WHERE `di_dict` = 1001 AND `di_fieldname` = 'p_medical_license_file');

INSERT INTO `cs_dict_item`
(`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`, `di_inputed`, `di_input_width`, `di_show_order`, `di_curd`, `di_group`, `di_select`, `di_filtered`, `di_app_type`, `di_remark`)
SELECT 1001, '营业执照图片', 'p_business_license_file', 1, 0, -1, 0, 0, 0, 0, '', '', '', 100, 0, 0, 510, '', 'f_id', 'f_url', 'business_license_file', 'left', '', 0, 0, 0, 0, '', '', 0, '', '', '', 0, 0, 1, 0, 32, 15, '', '', 0, 0, '营业执照文件ID'
WHERE NOT EXISTS (SELECT 1 FROM `cs_dict_item` WHERE `di_dict` = 1001 AND `di_fieldname` = 'p_business_license_file');

INSERT INTO `cs_dict_item`
(`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`, `di_inputed`, `di_input_width`, `di_show_order`, `di_curd`, `di_group`, `di_select`, `di_filtered`, `di_app_type`, `di_remark`)
SELECT 1001, '营业执照有效期', 'p_business_license_period', 6, 0, 50, 0, 0, 0, 0, '', '', '', 100, 0, 0, 0, '', '', '', '', 'left', '', 0, 0, 0, 0, '', '', 0, '', '', '', 0, 0, 1, 0, 33, 15, '', '', 0, 0, '营业执照有效期'
WHERE NOT EXISTS (SELECT 1 FROM `cs_dict_item` WHERE `di_dict` = 1001 AND `di_fieldname` = 'p_business_license_period');

UPDATE `cs_dict_item`
SET `di_name` = '医院',
    `di_curd` = 16,
    `di_inputed` = 16,
    `di_show_order` = 5,
    `di_remark` = '门店端隐藏渠道医院字段，医院展示改由p_source关联医院字典'
WHERE `di_dict` = 1100 AND `di_app_type` = 3 AND `di_fieldname` = 'p_distributor_hospital';

UPDATE `cs_dict_item`
SET `di_name` = '医院',
    `di_type` = 6,
    `di_subtype` = 0,
    `di_key_dict` = 1003,
    `di_key_table` = 'Hospital',
    `di_key_field` = 'h_code',
    `di_key_show` = 'h_name',
    `di_key_join_name` = 'hospital',
    `di_key_join_type` = 'left',
    `di_key_condition` = '',
    `di_key_visible` = 0,
    `di_link_dict` = 0,
    `di_link_table` = '',
    `di_link_field` = '',
    `di_show_dict` = 0,
    `di_show_table` = '',
    `di_show_field` = '',
    `di_select` = '',
    `di_curd` = 15,
    `di_inputed` = 9,
    `di_show_order` = 50,
    `di_remark` = '门店端医院展示，按p_source关联Hospital.h_code展示h_name'
WHERE `di_dict` = 1100 AND `di_app_type` = 3 AND `di_fieldname` = 'p_source';

UPDATE `cs_dict_item`
SET `di_name` = '处方类型',
    `di_type` = 6,
    `di_subtype` = 0,
    `di_key_dict` = 0,
    `di_key_table` = '',
    `di_key_field` = '',
    `di_key_show` = '',
    `di_key_join_name` = '',
    `di_key_join_type` = 'left',
    `di_key_condition` = '',
    `di_key_visible` = 0,
    `di_link_dict` = 0,
    `di_link_table` = '',
    `di_link_field` = '',
    `di_show_dict` = 0,
    `di_show_table` = '',
    `di_show_field` = '',
    `di_select` = '00-普通门诊;10-门诊慢病;11-门诊统筹;20-特种病',
    `di_curd` = 15,
    `di_inputed` = 15,
    `di_show_order` = 30,
    `di_remark` = '门店端处方类型字典选项'
WHERE `di_dict` = 1100 AND `di_app_type` = 3 AND `di_fieldname` = 'p_type';

UPDATE `cs_dict_item`
SET `di_name` = '问诊类型',
    `di_type` = 7,
    `di_subtype` = 0,
    `di_key_dict` = 0,
    `di_key_table` = '',
    `di_key_field` = '',
    `di_key_show` = '',
    `di_key_join_name` = '',
    `di_key_join_type` = 'left',
    `di_key_condition` = '',
    `di_key_visible` = 0,
    `di_link_dict` = 0,
    `di_link_table` = '',
    `di_link_field` = '',
    `di_show_dict` = 0,
    `di_show_table` = '',
    `di_show_field` = '',
    `di_select` = '1-图文;2-视频;9-其他',
    `di_curd` = 15,
    `di_inputed` = 15,
    `di_show_order` = 31,
    `di_remark` = '门店端问诊类型字典选项'
WHERE `di_dict` = 1100 AND `di_app_type` = 3 AND `di_fieldname` = 'p_consultation_type';

UPDATE `cs_dict_item`
SET `di_name` = '药品类型',
    `di_type` = 7,
    `di_subtype` = 0,
    `di_key_dict` = 0,
    `di_key_table` = '',
    `di_key_field` = '',
    `di_key_show` = '',
    `di_key_join_name` = '',
    `di_key_join_type` = 'left',
    `di_key_condition` = '',
    `di_key_visible` = 0,
    `di_link_dict` = 0,
    `di_link_table` = '',
    `di_link_field` = '',
    `di_show_dict` = 0,
    `di_show_table` = '',
    `di_show_field` = '',
    `di_select` = '1-西|中成药;2-中草药',
    `di_curd` = 15,
    `di_inputed` = 15,
    `di_show_order` = 35,
    `di_remark` = '门店端药品类型字典选项'
WHERE `di_dict` = 1100 AND `di_app_type` = 3 AND `di_fieldname` = 'p_category';

UPDATE `cs_dict_item`
SET `di_filtered` = 0
WHERE `di_dict` = 1003
  AND `di_fieldname` IN (
    'h_code',
    'h_alias_name',
    'h_level',
    'h_category',
    'h_org_code',
    'h_pinyin',
    'h_area_code',
    'h_expire_date'
  );

UPDATE `cs_dict_item`
SET `di_curd` = (`di_curd` & 14)
WHERE `di_dict` = 1003
  AND `di_fieldname` IN (
    'h_type',
    'h_level',
    'h_tag',
    'h_category',
    'h_pinyin',
    'h_province_code',
    'h_city_code',
    'h_area_code',
    'h_longitude',
    'h_latitude',
    'h_online_inquiry_appid',
    'h_consultation_room_valid_minutes',
    'h_show_drug_usage',
    'h_expire_date',
    'h_allow_login_after_expired',
    'h_create_user'
  );

UPDATE `cs_dict_item`
SET
    `di_name` = '统一信用代码',
    `di_required` = 6
WHERE `di_dict` = 1003
  AND `di_fieldname` = 'h_org_code';

UPDATE `cs_dict_item`
SET
    `di_name` = '诊室有效时长',
    `di_unit` = '分钟',
    `di_default` = '60',
    `di_curd` = 14,
    `di_inputed` = 15
WHERE `di_dict` = 1003
  AND `di_fieldname` = 'h_consultation_room_valid_minutes';

UPDATE `cs_dict_item`
SET `di_filtered` = 0
WHERE `di_dict` = 1101
  AND `di_fieldname` IN (
    'dd_pinyin',
    'dd_bar_code',
    'dd_med_list_codg',
    'dd_drug_type',
    'dd_aprvno'
  );

UPDATE `cs_dict_item`
SET `di_curd` = (`di_curd` & 14)
WHERE `di_dict` = 1101
  AND `di_fieldname` IN (
    'dd_id',
    'dd_pinyin',
    'dd_dosform_spec',
    'dd_min_pacunt'
  );

UPDATE `cs_dict_item`
SET `di_curd` = (`di_curd` | 1)
WHERE `di_dict` = 1101
  AND `di_fieldname` IN (
    'dd_create_time',
    'dd_update_time'
  );

UPDATE `cs_dict_item`
SET `di_key_dict` = 112,
    `di_key_table` = 'Frequency',
    `di_key_field` = 'fq_code',
    `di_key_show` = 'fq_name',
    `di_key_join_name` = 'default_frequency',
    `di_key_join_type` = 'left'
WHERE `di_dict` = 1101
  AND `di_fieldname` = 'dd_default_frequency';

UPDATE `cs_dict_item`
SET `di_key_dict` = 111,
    `di_key_table` = 'Usage',
    `di_key_field` = 'du_code',
    `di_key_show` = 'du_name',
    `di_key_join_name` = 'default_usage',
    `di_key_join_type` = 'left'
WHERE `di_dict` = 1101
  AND `di_fieldname` = 'dd_default_usage';

UPDATE `cs_dict_item`
SET `di_key_dict` = 110,
    `di_key_table` = 'DosageForm',
    `di_key_field` = 'df_code',
    `di_key_show` = 'df_name',
    `di_key_join_name` = 'drug_dosform',
    `di_key_join_type` = 'left'
WHERE `di_dict` = 1101
  AND `di_fieldname` = 'dd_drug_dosform';

UPDATE `cs_dict_item`
SET `di_curd` = 15,
    `di_name` = '销售单位'
WHERE `di_dict` = 1101
  AND `di_fieldname` = 'dd_sale_unit';

UPDATE `cs_dict_item`
SET `di_curd` = 14
WHERE `di_dict` = 1101
  AND `di_fieldname` = 'dd_default_dose_unit';

UPDATE `cs_dict_item`
SET `di_curd` = 8
WHERE `di_dict` = 1101
  AND `di_fieldname` = 'dd_min_pacunt';

UPDATE `cs_dict_item`
SET `di_curd` = 14
WHERE `di_dict` = 1101
  AND `di_fieldname` = 'dd_suggested_dose_unit';

UPDATE `cs_dict_item`
SET `di_curd` = 14
WHERE `di_dict` IN (1101, 1102)
  AND `di_fieldname` IN (
    'dd_suggested_dose',
    'dd_suggested_dose_unit',
    'dd_special_requirement'
  );

INSERT INTO `cs_dict_item`
(`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`, `di_inputed`, `di_input_width`, `di_show_order`, `di_curd`, `di_group`, `di_select`, `di_filtered`, `di_app_type`, `di_remark`)
SELECT 1003, '拼音码', 'h_pinyin', 6, 0, 100, 0, 0, 0, 0, '', '', '', 120, 0, 0, 0, '', '', '', '', 'left', '', 0, 0, 0, 0, '', '', 0, '', '', '', 0, 0, 15, 0, 10, 15, '', '', 0, 0, '医院拼音码'
WHERE NOT EXISTS (
  SELECT 1 FROM `cs_dict_item`
  WHERE `di_dict` = 1003
    AND `di_fieldname` = 'h_pinyin'
    AND `di_app_type` = 0
);

INSERT INTO `cs_dict_item`
(`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`, `di_inputed`, `di_input_width`, `di_show_order`, `di_curd`, `di_group`, `di_select`, `di_filtered`, `di_app_type`, `di_remark`)
SELECT
  `di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`, 15, `di_input_width`, `di_show_order`, 15, `di_group`, `di_select`, `di_filtered`, 6, `di_remark`
FROM `cs_dict_item` AS `src`
WHERE `src`.`di_dict` = 1003
  AND `src`.`di_app_type` = 0
  AND `src`.`di_fieldname` IN (
    'h_logo_url',
    'h_record_no',
    'h_org_code',
    'h_pinyin',
    'h_house_area',
    'h_province_code',
    'h_city_code',
    'h_area_code',
    'h_address',
    'h_valid_start_time',
    'h_valid_end_time'
  )
  AND NOT EXISTS (
    SELECT 1 FROM `cs_dict_item` AS `target`
    WHERE `target`.`di_dict` = `src`.`di_dict`
      AND `target`.`di_fieldname` = `src`.`di_fieldname`
      AND `target`.`di_app_type` = 6
  );

UPDATE `cs_dict_item`
SET `di_curd` = 15,
    `di_inputed` = 15
WHERE `di_dict` = 1003
  AND `di_app_type` = 6
  AND `di_fieldname` IN (
    'h_logo_url',
    'h_record_no',
    'h_org_code',
    'h_pinyin',
    'h_house_area',
    'h_province_code',
    'h_city_code',
    'h_area_code',
    'h_address',
    'h_valid_start_time',
    'h_valid_end_time'
  );

UPDATE `cs_dict_item`
SET `di_curd` = (`di_curd` | 1)
WHERE `di_dict` = 1003
  AND `di_fieldname` = 'h_logo_url'
  AND `di_app_type` IN (0, 6);

INSERT INTO `cs_dict_item`
(`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`, `di_inputed`, `di_input_width`, `di_show_order`, `di_curd`, `di_group`, `di_select`, `di_filtered`, `di_app_type`, `di_remark`)
SELECT 1003, '有效期开始时间', 'h_valid_start_time', 3, 1, -1, 0, 0, 0, 0, '', '', '', 150, 0, 0, 0, '', '', '', '', 'left', '', 0, 0, 0, 0, '', '', 0, '', '', '0', 0, 0, 14, 0, 55, 15, '', '', 0, 0, '医院有效期开始时间'
WHERE NOT EXISTS (
  SELECT 1 FROM `cs_dict_item`
  WHERE `di_dict` = 1003
    AND `di_fieldname` = 'h_valid_start_time'
    AND `di_app_type` = 0
);

INSERT INTO `cs_dict_item`
(`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`, `di_inputed`, `di_input_width`, `di_show_order`, `di_curd`, `di_group`, `di_select`, `di_filtered`, `di_app_type`, `di_remark`)
SELECT 1003, '有效期结束时间', 'h_valid_end_time', 3, 1, -1, 0, 0, 0, 0, '', '', '', 150, 0, 0, 0, '', '', '', '', 'left', '', 0, 0, 0, 0, '', '', 0, '', '', '0', 0, 0, 14, 0, 56, 15, '', '', 0, 0, '医院有效期结束时间'
WHERE NOT EXISTS (
  SELECT 1 FROM `cs_dict_item`
  WHERE `di_dict` = 1003
    AND `di_fieldname` = 'h_valid_end_time'
    AND `di_app_type` = 0
);

INSERT INTO `cs_dict_item`
(`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`, `di_inputed`, `di_input_width`, `di_show_order`, `di_curd`, `di_group`, `di_select`, `di_filtered`, `di_app_type`, `di_remark`)
SELECT `di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`, `di_inputed`, `di_input_width`, `di_show_order`, `di_curd`, `di_group`, `di_select`, `di_filtered`, 6, `di_remark`
FROM `cs_dict_item`
WHERE `di_dict` = 1003
  AND `di_app_type` = 0
  AND `di_fieldname` IN ('h_valid_start_time', 'h_valid_end_time')
  AND NOT EXISTS (
    SELECT 1 FROM `cs_dict_item` AS `target`
    WHERE `target`.`di_dict` = `cs_dict_item`.`di_dict`
      AND `target`.`di_fieldname` = `cs_dict_item`.`di_fieldname`
      AND `target`.`di_app_type` = 6
  );

UPDATE `cs_dict_item`
SET `di_curd` = (`di_curd` | 1)
WHERE `di_dict` = 1101
  AND `di_fieldname` = 'dd_id';

INSERT INTO `cs_dict_item`
(
    `di_dict`,
    `di_name`,
    `di_fieldname`,
    `di_type`,
    `di_subtype`,
    `di_max`,
    `di_min`,
    `di_pk`,
    `di_autoed`,
    `di_pwded`,
    `di_regex`,
    `di_regex_msg`,
    `di_unit`,
    `di_show_width`,
    `di_sort`,
    `di_fuzzy`,
    `di_key_dict`,
    `di_key_table`,
    `di_key_field`,
    `di_key_show`,
    `di_key_join_name`,
    `di_key_join_type`,
    `di_key_condition`,
    `di_key_visible`,
    `di_key_width`,
    `di_key_height`,
    `di_link_dict`,
    `di_link_table`,
    `di_link_field`,
    `di_show_dict`,
    `di_show_table`,
    `di_show_field`,
    `di_default`,
    `di_required`,
    `di_readonly`,
    `di_inputed`,
    `di_input_width`,
    `di_show_order`,
    `di_curd`,
    `di_group`,
    `di_select`,
    `di_filtered`,
    `di_app_type`,
    `di_remark`
)
SELECT
    1102,
    '单位',
    `di_fieldname`,
    `di_type`,
    `di_subtype`,
    `di_max`,
    `di_min`,
    `di_pk`,
    `di_autoed`,
    `di_pwded`,
    `di_regex`,
    `di_regex_msg`,
    `di_unit`,
    `di_show_width`,
    `di_sort`,
    `di_fuzzy`,
    `di_key_dict`,
    `di_key_table`,
    `di_key_field`,
    `di_key_show`,
    `di_key_join_name`,
    `di_key_join_type`,
    `di_key_condition`,
    `di_key_visible`,
    `di_key_width`,
    `di_key_height`,
    `di_link_dict`,
    `di_link_table`,
    `di_link_field`,
    `di_show_dict`,
    `di_show_table`,
    `di_show_field`,
    `di_default`,
    0,
    0,
    `di_inputed`,
    `di_input_width`,
    `di_show_order`,
    15,
    `di_group`,
    `di_select`,
    `di_filtered`,
    `di_app_type`,
    '中药饮片单位，保存到cs_dict_drug.dd_sale_unit'
FROM `cs_dict_item`
WHERE `di_dict` = 1101
  AND `di_fieldname` = 'dd_sale_unit'
  AND NOT EXISTS (
      SELECT 1
      FROM `cs_dict_item` AS target
      WHERE target.`di_dict` = 1102
        AND target.`di_fieldname` = 'dd_sale_unit'
  )
LIMIT 1;

UPDATE `cs_dict_item`
SET
    `di_name` = '单位',
    `di_required` = 0,
    `di_readonly` = 0,
    `di_curd` = 15,
    `di_remark` = '中药饮片单位，保存到cs_dict_drug.dd_sale_unit'
WHERE `di_dict` = 1102
  AND `di_fieldname` = 'dd_sale_unit';

INSERT INTO `cs_dict_item`
  (
    `di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`,
    `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`,
    `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`,
    `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`,
    `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`,
    `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`,
    `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`,
    `di_inputed`, `di_input_width`, `di_show_order`, `di_curd`, `di_group`,
    `di_select`, `di_filtered`, `di_app_type`, `di_remark`
  )
SELECT
    `di_dict`, '医院信息', 'usr_hospital', `di_type`, `di_subtype`, `di_max`, `di_min`,
    `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`,
    `di_show_width`, `di_sort`, `di_fuzzy`, 1003, 'Hospital',
    'h_id', 'h_name', 'hospital_name', `di_key_join_type`,
    `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`,
    `di_link_dict`, `di_link_table`, `di_link_field`, 0,
    '', '', `di_default`, 0, 0,
    15, `di_input_width`, `di_show_order`, 15, `di_group`,
    '', `di_filtered`, 1, '机构用户医院类型归属字段，前端字段名 hospital，入库字段 usr_hospital'
FROM `cs_dict_item`
WHERE `di_dict` = 503
  AND `di_fieldname` = 'usr_distributor'
  AND `di_app_type` = 1
  AND NOT EXISTS (
    SELECT 1
    FROM `cs_dict_item` AS `target`
    WHERE `target`.`di_dict` = 503
      AND `target`.`di_fieldname` = 'usr_hospital'
      AND `target`.`di_app_type` = 1
  )
LIMIT 1;

UPDATE `cs_dict_item`
SET `di_name` = '医院信息',
    `di_type` = 1,
    `di_subtype` = 1,
    `di_key_dict` = 1003,
    `di_key_table` = 'Hospital',
    `di_key_field` = 'h_id',
    `di_key_show` = 'h_name',
    `di_key_join_name` = 'hospital_name',
    `di_key_join_type` = 'left',
    `di_key_condition` = '',
    `di_show_dict` = 0,
    `di_show_table` = '',
    `di_show_field` = '',
    `di_required` = 0,
    `di_readonly` = 0,
    `di_inputed` = 15,
    `di_curd` = 15,
    `di_select` = '',
    `di_app_type` = 1,
    `di_remark` = '机构用户医院类型归属字段，前端字段名 hospital，入库字段 usr_hospital'
WHERE `di_dict` = 503
  AND `di_fieldname` = 'usr_hospital'
  AND `di_app_type` = 1;

INSERT INTO `cs_dict_item` (
    `di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`,
    `di_show_width`, `di_inputed`, `di_show_order`, `di_curd`, `di_group`
)
SELECT 1101, '最小包装数量', 'dd_min_pac_cnt', 2, 0, -1, 0, 100, 14, 311, 15, ''
WHERE NOT EXISTS (
    SELECT 1 FROM `cs_dict_item` WHERE `di_dict` = 1101 AND `di_fieldname` = 'dd_min_pac_cnt'
);

INSERT INTO `cs_dict_item` (
    `di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`,
    `di_show_width`, `di_inputed`, `di_show_order`, `di_curd`, `di_group`
)
SELECT 1101, '最小制剂单位', 'dd_min_prepunt', 6, 0, 32, 0, 100, 14, 312, 15, ''
WHERE NOT EXISTS (
    SELECT 1 FROM `cs_dict_item` WHERE `di_dict` = 1101 AND `di_fieldname` = 'dd_min_prepunt'
);

INSERT INTO `cs_dict_item` (
    `di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`,
    `di_show_width`, `di_inputed`, `di_show_order`, `di_curd`, `di_group`
)
SELECT 1101, '制剂含量', 'dd_min_spec_num', 2, 0, -1, 0, 100, 14, 313, 15, ''
WHERE NOT EXISTS (
    SELECT 1 FROM `cs_dict_item` WHERE `di_dict` = 1101 AND `di_fieldname` = 'dd_min_spec_num'
);

INSERT INTO `cs_dict_item` (
    `di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`,
    `di_show_width`, `di_inputed`, `di_show_order`, `di_curd`, `di_group`
)
SELECT 1101, '含量单位', 'dd_min_spec_unit', 6, 0, 32, 0, 100, 14, 314, 15, ''
WHERE NOT EXISTS (
    SELECT 1 FROM `cs_dict_item` WHERE `di_dict` = 1101 AND `di_fieldname` = 'dd_min_spec_unit'
);

UPDATE `cs_dict_item`
SET `di_required` = 1
WHERE `di_dict` = 1101
  AND `di_fieldname` = 'dd_sale_unit';

INSERT INTO `cs_dict_item`
    (`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`, `di_inputed`, `di_input_width`, `di_show_order`, `di_curd`, `di_group`, `di_select`, `di_filtered`, `di_app_type`, `di_remark`)
SELECT
    `di_dict`, '流转状态', 'p_circulation_status', `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, 100, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, '0', 0, `di_readonly`, 0, `di_input_width`, 445, 1, `di_group`, '0-未生成;10-未流转;20-流转中;30-已流转;40-撤销中;50-已撤销;60-撤销失败;70-流转失败', 1, 3, '门店端处方列表流转状态'
FROM `cs_dict_item`
WHERE `di_id` = 610
  AND NOT EXISTS (
      SELECT 1
      FROM `cs_dict_item`
      WHERE `di_dict` = 1100
        AND `di_fieldname` = 'p_circulation_status'
        AND `di_app_type` = 3
  );

UPDATE `cs_dict_item`
SET `di_show_width` = 150,
    `di_curd` = (`di_curd` | 1)
WHERE `di_dict` = 1100
  AND `di_fieldname` = 'p_update_time'
  AND `di_app_type` = 3
  AND (`di_show_width` <> 150 OR (`di_curd` & 1) = 0);

UPDATE `cs_dict_item` AS `source_item`
SET `di_fieldname` = 'p_hospital',
    `di_key_field` = 'h_id',
    `di_remark` = '医院展示，按p_hospital关联Hospital.h_id展示h_name'
WHERE `di_dict` = 1100
  AND `di_fieldname` = 'p_source'
  AND NOT EXISTS (
      SELECT 1
      FROM (
          SELECT `di_dict`, `di_app_type`
          FROM `cs_dict_item`
          WHERE `di_fieldname` = 'p_hospital'
      ) AS `hospital_item`
      WHERE `hospital_item`.`di_dict` = `source_item`.`di_dict`
        AND `hospital_item`.`di_app_type` = `source_item`.`di_app_type`
  );

UPDATE `cs_dict_item`
SET `di_name` = '创建用户类型',
    `di_type` = 1,
    `di_subtype` = 0,
    `di_max` = -1,
    `di_min` = 0,
    `di_pk` = 0,
    `di_autoed` = 0,
    `di_pwded` = 0,
    `di_regex` = '',
    `di_regex_msg` = '',
    `di_unit` = '',
    `di_show_width` = 120,
    `di_sort` = 0,
    `di_fuzzy` = 0,
    `di_key_dict` = 0,
    `di_key_table` = '',
    `di_key_field` = '',
    `di_key_show` = '',
    `di_key_join_name` = '',
    `di_key_join_type` = 'left',
    `di_key_condition` = '',
    `di_key_visible` = 0,
    `di_key_width` = 0,
    `di_key_height` = 0,
    `di_link_dict` = 0,
    `di_link_table` = '',
    `di_link_field` = '',
    `di_show_dict` = 0,
    `di_show_table` = '',
    `di_show_field` = '',
    `di_default` = '',
    `di_required` = 1,
    `di_readonly` = 4,
    `di_inputed` = 15,
    `di_input_width` = 0,
    `di_show_order` = 8,
    `di_curd` = 15,
    `di_group` = '',
    `di_select` = '2-集团;3-药店;5-渠道;6-医院;7-互联网医院',
    `di_filtered` = 1,
    `di_app_type` = 1,
    `di_remark` = '机构用户创建时选择用户所属应用类型，前端字段名 app_type，入库字段 usr_app_type'
WHERE `di_dict` = 503
  AND `di_fieldname` = 'usr_app_type'
  AND `di_app_type` IN (0, 1);

INSERT INTO `cs_dict_item`
  (`di_dict`, `di_name`, `di_fieldname`, `di_type`, `di_subtype`, `di_max`, `di_min`, `di_pk`, `di_autoed`, `di_pwded`, `di_regex`, `di_regex_msg`, `di_unit`, `di_show_width`, `di_sort`, `di_fuzzy`, `di_key_dict`, `di_key_table`, `di_key_field`, `di_key_show`, `di_key_join_name`, `di_key_join_type`, `di_key_condition`, `di_key_visible`, `di_key_width`, `di_key_height`, `di_link_dict`, `di_link_table`, `di_link_field`, `di_show_dict`, `di_show_table`, `di_show_field`, `di_default`, `di_required`, `di_readonly`, `di_inputed`, `di_input_width`, `di_show_order`, `di_curd`, `di_group`, `di_select`, `di_filtered`, `di_app_type`, `di_remark`)
SELECT 503, '创建用户类型', 'usr_app_type', 1, 0, -1, 0, 0, 0, 0, '', '', '', 120, 0, 0, 0, '', '', '', '', 'left', '', 0, 0, 0, 0, '', '', 0, '', '', '', 1, 4, 15, 0, 8, 15, '', '2-集团;3-药店;5-渠道;6-医院;7-互联网医院', 1, 1, '机构用户创建时选择用户所属应用类型，前端字段名 app_type，入库字段 usr_app_type'
WHERE NOT EXISTS (
  SELECT 1 FROM `cs_dict_item`
  WHERE `di_dict` = 503
    AND `di_fieldname` = 'usr_app_type'
    AND `di_app_type` IN (0, 1)
);
