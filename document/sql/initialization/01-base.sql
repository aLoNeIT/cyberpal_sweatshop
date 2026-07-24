-- app_type  0-首页;1-管理后台;4-用户端;7-开放平台
-- ----------------------------
-- Table structure for `cs_dict`
-- 字典表
-- ----------------------------
drop table if exists `cs_dict`;
create table `cs_dict` (
    `d_id` INT not null default 0,
    `d_name` VARCHAR (50) not null default '' comment '表中文名',
    `d_tablename` VARCHAR (50) not null default '' comment '表名,不带前缀，使用驼峰命名',
    `d_sub` VARCHAR (50) not null default '' comment '子表名',
    `d_prefix` VARCHAR (10) not null default '' comment '字段前缀',
    primary key (`d_id`),
    key `idx_d_tablename` (`d_tablename`) using BTREE
) comment = '字典表';
-- ----------------------------
-- Table structure for `cs_dict_item`
-- 字典项表
-- ----------------------------
drop table if exists `cs_dict_item`;
create table `cs_dict_item` (
    --  基本信息
    `di_id` INT not null auto_increment,
    `di_dict` INT not null default 0 comment '表序号',
    `di_name` VARCHAR (50) not null default '' comment '字段中文名',
    `di_fieldname` VARCHAR (50) not null default '' comment '字段英文名',
    `di_type` TINYINT not null default 6 comment '字段类型,1:整数 2:小数 3:日期 4:时间 5：日期时间 6：字符串 7布尔 8长字符串 9图像数据 10二进制',
    `di_subtype` TINYINT not null default 0 comment '字段子类型',
    --
--   1：整数       subType 0：(无) 1：颜色 2：货币
    --   2：小数    subType 0：(无) 2：货币
    --   3,4,5 日期时间 subType 0:数据库原生时间日期类型 1:Unix时间戳   2:字符串形式 ,具体字符串格式写入di_select中
    --   6：字符串 subtype 0:(无) 1:电话号码   2：手机号码  3：邮政编码  4：电子邮件 5:拼音简码 6：身份证号码
    --   8: 字符 subtype 0：无（长字符串），1：json
    --   9：图像数据  subtype 0:无(视为二进制流) 1：路径  2：base64
    --   10：二进制数据  subtype 0:无 1：路径   2:base64
    --
    `di_max` FLOAT NOT NULL DEFAULT - 1 COMMENT '字段最大值',
    `di_min` FLOAT not null default 0 comment '字段最小值，当最小值大于最大值时，代表不限制',
    `di_pk` TINYINT not null default 0 comment '是否主键',
    `di_autoed` TINYINT not null default 0 comment '是否自增，数值型自增依赖于数据库自身自增机制，字符串自增以来通过代码生成',
    `di_pwded` TINYINT not null default 0 comment '是否密码字段',
    `di_regex` VARCHAR (255) not null default '' comment '字段校验规则',
    `di_regex_msg` VARCHAR (255) not null default '' comment '校验规则错误信息',
    -- 显示信息
    `di_unit` VARCHAR (50) not null default '' comment '显示单位',
    `di_show_width` INT not null default 100 comment '显示宽度，-1代表自动宽度，0代表不显示，非0代表指定px',
    -- sql查询信息
    `di_sort` TINYINT not null default 0 comment '排序，奇数asc，偶数desc，数字越小越优先排序',
    -- fuzzy为非0时候，表示进行查询，1为全匹配，2为模糊匹配右匹配，3为模糊匹配左匹配，4为模糊匹配全匹配
    `di_fuzzy` TINYINT not null default 0 comment '模糊查询',
    `di_key_dict` INT not null default 0 comment '外键字典号',
    `di_key_table` VARCHAR (50) not null default '' comment '外键表名',
    `di_key_field` VARCHAR (50) not null default '' comment '外键表字段名',
    `di_key_show` VARCHAR (50) not null default '' comment '外键显示字段',
    `di_key_join_name` VARCHAR (50) not null default '' comment '外键表别名',
    `di_key_join_type` VARCHAR (10) not null default 'left' comment '外键表方式，inner,left,right',
    `di_key_condition` VARCHAR (50) not null default '' comment '外键表达式',
    `di_key_visible` TINYINT not null default 0 comment '外键是否显示',
    `di_key_width` INT not null default 0 comment '外键弹出界面宽度',
    `di_key_height` INT not null default 0 comment '外键弹出界面高度',
    `di_link_dict` INT not null default 0 comment '连接表字典号',
    `di_link_table` VARCHAR (50) not null default '' comment '链接表，优先与key_join_name一致，其次是key_table',
    `di_link_field` VARCHAR (50) not null default '' comment '链接字段，必须要有关联外键才可使用，主要为了从外键表取冗余数据，填写到界面对应字段中',
    `di_show_dict` INT not null default 0 comment '外显表字典号',
    `di_show_table` VARCHAR (50) not null default '' comment '外显表，优先与key_join_name一致，其次是key_table',
    `di_show_field` VARCHAR (50) not null default '' comment '外显字段，必须要有关联外键才可使用，主要是为了显示更多的字段，设置了外显则代表当前字段是虚拟字段不存在',
    -- 输入界面信息
    `di_default` VARCHAR (255) not null default '' comment '默认值',
    `di_required` TINYINT not null default 0 comment '是否必填项',
    `di_readonly` TINYINT not null default 0 comment '是否只读2新增；4修改',
    `di_inputed` TINYINT not null default 1 comment '增删改查页面是否显示字段，1刷新；2新增；4修改；8读取；16删除，可组合',
    `di_input_width` INT not null default 0 comment '字段输入框长度，0为不限制',
    `di_show_order` INT not null default 1000 comment '字段显示顺序，从小到大',
    `di_curd` INT not null default 15 comment '增改查配置项，1刷新；2新增；4修改；8读取；16删除，可组合',
    `di_group` VARCHAR (50) not null default '' comment '分组',
    `di_select` VARCHAR (500) not null default '' comment '下拉选择或其他附加信息，用;分割',
    `di_filtered` TINYINT not null default 0 comment '是否是筛选条件，用于前端是否显示搜索框，1：是；0：否',
    `di_app_type` TINYINT not null default 0 comment '字典适用的应用类型，0-首页;1-管理后台;4-用户端;7-开放平台',
    `di_remark` VARCHAR (255) not null default '' comment '备注',
    primary key (`di_id`),
    key `idx_di_dict` (`di_dict`) using BTREE,
    key `idx_di_fieldname` (`di_fieldname`) using BTREE
) comment = '字典项表';

-- ----------------------------
-- Table structure for cs_menu
-- 菜单表  500
-- ----------------------------
drop table if exists `cs_menu`;
create table `cs_menu` (
    `mn_id` INT not null auto_increment comment '主键',
    `mn_app_type` TINYINT not null default 3 comment '应用类型， 0-首页;1-管理后台;4-用户端;7-开放平台',
    `mn_code` VARCHAR (20) not null comment '菜单编码，两位一级，以MN开头，例如MN01',
    `mn_parent_code` VARCHAR (20) not null default '' comment '菜单父编码',
    `mn_title` VARCHAR (50) not null comment '菜单名称',
    `mn_path` VARCHAR (255) not null default '' comment '菜单完整路径，子级菜单用-分隔，例如：MN01-MN0101',
    `mn_sort` INT not null default '1000' comment '排序，由大到小',
    `mn_level` TINYINT not null default 0 comment '菜单级别',
    `mn_parented` TINYINT not null default 0 comment '是否为父级菜单 0=否 1=是',
    `mn_state` TINYINT not null default '1' comment '状态 0=关闭 1=开启',
    `mn_css` VARCHAR (255) not null default '' comment '菜单样式',
    `mn_style` TINYINT not null default 1 comment '菜单类型 0-不显示；1-侧边栏菜单；2-tabBar菜单',
    `mn_icon` VARCHAR (255) not null default '' comment '菜单图标',
    `mn_uri` VARCHAR (255) not null default '' comment '菜单地址',
    primary key (`mn_id`),
    key `idx_mn_code` (`mn_code`) using BTREE,
    key `idx_mn_parent_code` (`mn_parent_code`) using BTREE,
    key `idx_mn_path` (`mn_path`) using BTREE,
    key `un_idx_menu_info` (`mn_app_type`, `mn_state`, `mn_code`) using BTREE,
    key `idx_mn_state` (`mn_state`) using BTREE
) comment '菜单表';
-- ----------------------------
-- Table structure for cs_function
-- 功能  501
-- ----------------------------
drop table if exists `cs_function`;
create table `cs_function` (
    `fn_id` INT not null auto_increment comment '主键',
    `fn_code` VARCHAR (20) not null comment '功能编码，以FN开头，两位一组，FN00固定表示是否显示当前菜单',
    `fn_menu_code` VARCHAR (20) not null comment '功能所属菜单编码',
    `fn_name` VARCHAR (50) not null comment '功能名称',
    `fn_app_type` TINYINT not null default 3 comment '应用类型， 0-首页;1-管理后台;4-用户端;7-开放平台',
    `fn_css` VARCHAR (255) not null default '' comment '样式',
    `fn_style` TINYINT not null default 1 comment '类型 0=不显示 1=上方按钮 2=行内按钮 4=列表按钮',
    `fn_state` TINYINT not null default 1 comment '状态 0=关闭 1=开启',
    `fn_type` VARCHAR (100) not null default 'default' comment '描述按钮类型，前端会展示不同样式',
    `fn_sort` INT not null default '1000' comment '排序，由大到小',
    primary key (`fn_id`),
    key `un_idx_function_menu_info` (`fn_app_type`, `fn_menu_code`) using BTREE,
    key `idx_function_info` (`fn_app_type`, `fn_state`, `fn_code`) using BTREE
) comment '功能表';
-- ----------------------------
-- Table structure for cs_function_detail
-- 功能明细  502
-- ----------------------------
drop table if exists `cs_function_detail`;
create table `cs_function_detail` (
    `fd_id` INT not null auto_increment,
    `fd_function_code` VARCHAR (20) not null default '' comment '功能编码，关联function表fn_code字段',
    `fd_module` VARCHAR (50) not null default '' comment '权限模块',
    `fd_controller` VARCHAR (50) not null default '' comment '权限控制器',
    `fd_action` VARCHAR (50) not null default '' comment '权限动作',
    `fd_app_type` TINYINT not null default 3 comment '应用类型， 0-首页;1-管理后台;4-用户端;7-开放平台',
    primary key (`fd_id`),
    key `un_idx_fd_function_code` (`fd_app_type`, `fd_function_code`) using BTREE,
    key `un_idx_fd_uri` (
        `fd_app_type`,
        `fd_module`,
        `fd_controller`,
        `fd_action`
    ) using BTREE
) comment '功能明细表';
-- ----------------------------
-- Table structure for `cs_user`
-- 用户表  503
-- ----------------------------
drop table if exists `cs_user`;
create table `cs_user` (
    `usr_id` INT not null auto_increment comment '主键',
    `usr_app_type` TINYINT not null default 1 comment '应用类型， 0-首页;1-管理后台;4-用户端;7-开放平台',
    `usr_join_table` VARCHAR (50) not null default '' comment '关联组织表名（多租户隔离）',
    `usr_join_data` INT not null default 0 comment '关联组织数据ID',
    `usr_mp` VARCHAR (255) not null default '' comment '手机号码',
    `usr_account` VARCHAR (50) not null default '' comment '用户账号',
    `usr_pwd` VARCHAR (80) not null default '68b6b4ab792a4476db8f6937bb4c4d12' comment '密码123456',
    `usr_salt` VARCHAR (4) not null default 'RzyL' comment '用户盐值',
    `usr_real_name` VARCHAR (50) not null default '' comment '真实姓名',
    `theme_pref`            VARCHAR(16)  NOT NULL DEFAULT 'system' COMMENT '主题偏好 light|dark|system',
    `auto_archive_enabled`  TINYINT      NOT NULL DEFAULT 1        COMMENT '自动归档开关 0/1',
    `auto_archive_days`     INT UNSIGNED NOT NULL DEFAULT 30       COMMENT '自动归档天数阈值',
    `usr_sex` VARCHAR (4) not null default '' comment '性别',
    `usr_remark` VARCHAR (255) not null default '' comment '用户备注',
    `usr_login_time` BIGINT not null default 0 comment '登录时间',
    `usr_login_num` INT not null default 0 comment '登录次数',
    `usr_pwd_update_time` BIGINT not null default 0 comment '最后一次密码修改时间',
    `usr_login_ip` VARCHAR (50) not null default '' comment '登录ip',
    `usr_img_head_file` INT not null default 0 comment '关联cs_file的最新头像的存储ID',
    `usr_img_head_url` VARCHAR (255) not null default '' comment '头像',
    `usr_state` TINYINT not null default 1 comment '状态 0=关闭 1=开启',
    `usr_create_user` INT not null default 0 comment '创建人',
    `usr_create_time` BIGINT not null default 0 comment '创建时间',
    `usr_update_time` BIGINT not null default 0 comment '修改时间',
    `usr_delete_time` BIGINT not null default 0 comment '删除时间',
    primary key (`usr_id`),
    key `idx_usr_create_time` (`usr_create_time`) using BTREE,
    key `idx_usr_delete_time` (`usr_delete_time`) using BTREE,
    key `idx_usr_mp` (`usr_mp`) using BTREE,
    key `idx_usr_join` (`usr_join_table`, `usr_join_data`) using BTREE,
    unique key `un_uniq_usr_info` (
        `usr_app_type`,
        `usr_account`,
        `usr_delete_time`
    ) using BTREE
) comment = '用户表';
-- ----------------------------
-- Table structure for `cs_user_enterprise`
-- 用户企业表
-- ----------------------------
drop table if exists `cs_user_enterprise`;
create table `cs_user_enterprise` (
    `ue_id` int not null auto_increment comment '主键',
    `ue_app_type` tinyint(4) not null default 1 comment '应用类型， 0-首页;1-管理后台;4-用户端;7-开放平台',
    `ue_join_table` varchar(50) NOT NULL DEFAULT '' COMMENT '关联组织表名',
    `ue_join_data` int NOT NULL DEFAULT 0 COMMENT '关联组织数据ID',
    `ue_user` int not null default 0 comment '用户id  关联user表',
    `ue_create_time` BIGINT not null default 0 comment '创建时间',
    `ue_update_time` BIGINT not null default 0 comment '修改时间',
    `ue_delete_time` BIGINT not null default 0 comment '删除时间',
    primary key (`ue_id`) using BTREE,
    key `idx_ue_join` (`ue_join_table`, `ue_join_data`) using BTREE,
    key `idx_ue_user` (`ue_user`) using BTREE,
    key `idx_ue_create_time` (`ue_create_time`) using BTREE,
    key `idx_ue_delete_time` (`ue_delete_time`) using BTREE
) comment = '用户企业表';
-- ----------------------------
-- Table structure for cs_user_session
-- 用户会话记录
-- ----------------------------
drop table if exists `cs_user_session`;
create table `cs_user_session` (
    `us_id` INT not null auto_increment,
    `us_app_type` TINYINT not null default 3 comment '应用类型  0-首页;1-管理后台;4-用户端;7-开放平台',
    `us_user` INT not null default 0 comment '用户，关联user表主键',
    `us_session` VARCHAR (32) not null default 0 comment '会话id',
    `us_ip` VARCHAR (50) not null default '' comment '登录ip',
    `us_expire_in` INT not null default 7200 comment '会话有效期',
    `us_create_time` BIGINT not null default 0 comment '创建时间',
    `us_delete_time` BIGINT not null default 0 comment '删除时间',
    primary key (`us_id`),
    key `idx_us_app_type` (`us_app_type`) using BTREE,
    key `idx_us_user` (`us_user`) using BTREE,
    key `idx_us_delete_time` (`us_delete_time`) using BTREE,
    key `idx_us_create_time` (`us_create_time`) using BTREE
) comment '用户会话记';
-- ----------------------------
-- Table structure for cs_user_log
-- 用户日志
-- ----------------------------
drop table if exists `cs_user_log`;
create table `cs_user_log` (
    `ul_id` INT not null auto_increment,
    `ul_app_type` TINYINT not null default 3 comment '应用类型， 0-首页;1-管理后台;4-用户端;7-开放平台',
    `ul_user` INT not null default 0 comment '用户，关联user表主键',
    `ul_ip` VARCHAR (50) not null default '' comment '登录ip',
    `ul_module` VARCHAR (100) not null default '' comment '操作模块',
    `ul_controller` VARCHAR (100) not null default '' comment '操作控制器',
    `ul_action` VARCHAR (255) not null default '' comment '操作函数',
    `ul_remark` VARCHAR (255) not null default '' comment '备注',
    `ul_extend` JSON default null comment '扩展信息存储的是本次修改的所有数据',
    `ul_response_elapsed_time` BIGINT not null default 0 comment '响应时间',
    `ul_create_time` BIGINT not null default 0 comment '创建时间',
    `ul_update_time` BIGINT not null default 0 comment '修改时间',
    `ul_delete_time` BIGINT not null default 0 comment '删除时间',
    primary key (`ul_id`),
    key `idx_ul_create_time` (`ul_create_time`) using BTREE,
    key `idx_ul_delete_time` (`ul_delete_time`) using BTREE
) comment '用户日志';
-- ----------------------------
-- Table structure for cs_role
-- 角色
-- ----------------------------
drop table if exists `cs_role`;
-- ----------------------------
-- 角色层级说明：
-- 是否为系统层级。标识系统新建的角色，只能在admin端新建修改
-- level 标识新建层级高低。系统角色为 0，组织级角色数越大层级越低
-- 对于一般用户，查看角色为：本组织角色 + 系统角色
-- ----------------------------
create table `cs_role` (
    `r_id` INT not null auto_increment comment '主键',
    `r_app_type` TINYINT not null default 0 comment '应用类型， 0-首页;1-管理后台;4-用户端;7-开放平台',
    -- 该配置用于配置是哪个用户创建的，begin
    `r_join_table` VARCHAR (50) not null default '' comment '关联表表名称',
    `r_join_field` VARCHAR (50) not null default '' comment '关联表表字段',
    `r_join_data` INT not null default 0 comment '关联表表数据',
    -- 该配置用于配置是哪个用户创建的，end
    `r_level` TINYINT not null default 1 comment '角色层级，最高级管理员请手动插入0',
    `r_systemed` TINYINT not null default 0 comment '是否系统配置  0=否,1=是',
    `r_name` VARCHAR (50) not null comment '角色名称',
    `r_mark` VARCHAR (255) not null default '' comment '备注',
    `r_parent` TINYINT not null default 0 comment '父级来源 复制父级的id',
    `r_initialized` TINYINT not null default 0 comment '是否初始化  0=否,1=是',
    `r_state` TINYINT not null default 1 comment '状态 0=关闭 1=开启',
    `r_create_user` INT not null default 0 comment '新建人,关联user用户表id',
    `r_create_time` BIGINT not null default 0 comment '创建时间',
    `r_update_time` BIGINT not null default 0 comment '修改时间',
    `r_delete_time` BIGINT not null default 0 comment '删除时间',
    primary key (`r_id`),
    key `idx_r_create_time` (`r_create_time`) using BTREE
) comment '角色表';
-- ----------------------------
-- Table structure for cs_role_permission
-- 角色权限表
-- ----------------------------
drop table if exists `cs_role_permission`;
create table `cs_role_permission` (
    `rp_id` INT not null auto_increment comment '主键',
    `rp_role` INT not null comment '角色id',
    `rp_function_code` VARCHAR (20) not null comment '功能编码',
    `rp_app_type` TINYINT not null default 3 comment '应用类型， 0-首页;1-管理后台;4-用户端;7-开放平台',
    primary key (`rp_id`),
    key `un_idx_role_permission_info` (`rp_app_type`, `rp_role`, `rp_function_code`) using BTREE
) comment '角色权限关联表';
-- ----------------------------
-- Table structure for cs_user_permission
-- 用户权限
-- ----------------------------
drop table if exists `cs_user_permission`;
create table `cs_user_permission` (
    `up_id` INT not null auto_increment,
    `up_user` INT not null default 0 comment '用户id，关联user表usr_id字段',
    `up_app_type` TINYINT not null default 3 comment '应用类型， 0-首页;1-管理后台;4-用户端;7-开放平台',
    `up_function_code` VARCHAR (20) not null default '' comment '功能编码，关联function表fn_code字段',
    primary key (`up_id`),
    key `un_idx_user_permission_info` (`up_app_type`, `up_user`, `up_function_code`) using BTREE
) comment '用户权限表';
-- ----------------------------
-- Table structure for cs_relation
-- 用户角色关联
-- ----------------------------
drop table if exists `cs_relation`;
create table `cs_relation` (
    `rel_id` INT not null auto_increment,
    `rel_user` INT not null default 0 comment '用户id，关联user表usr_id字段',
    `rel_role` INT not null default 0 comment '角色id，关联role表r_id字段',
    `rel_app_type` TINYINT not null default 3 comment '应用类型， 0-首页;1-管理后台;4-用户端;7-开放平台',
    `rel_role_level` TINYINT not null default 1 comment '角色层级，最高级管理员手动插入0',
    primary key (`rel_id`),
    key `un_idx_relation_info` (`rel_app_type`, `rel_role`, `rel_user`) using BTREE,
    key `idx_user_info` (`rel_user`) using BTREE
) comment '用户角色关联表';
-- ----------------------------
-- Table structure for cs_file
-- 文件数据表  510
-- ----------------------------
drop table if exists `cs_file`;
create table `cs_file` (
    `f_id` int not null auto_increment comment 'ID',
    `f_join_table` VARCHAR (50) not null default '' comment '关联组织表名',
    `f_join_data` INT not null default 0 comment '关联组织数据ID',
    `f_app_type` tinyint(4) not null default '1' comment '应用类型，0-首页;1-管理后台;4-用户端;7-开放平台',
    `f_name` varchar(100) not null default '' comment '文件名称',
    `f_path` varchar(500) not null default '' comment '文件存储路径',
    `f_url` varchar(500) not null default '' comment '对外地址',
    `f_type` varchar(50) not null default '' comment '文件类型',
    `f_group` varchar(50) not null default '' comment '分组  public private',
    `f_dataid` int not null default 0 comment '主表数据',
    `f_table` varchar(50) not null default '' comment '主表名称',
    `f_field` varchar(50) not null default '' comment '主表字段',
    `f_driver` varchar(50) not null default '' comment '上传文件的驱动',
    `f_access` int not null default 0 comment '权限值，按位运算',
    `f_size` bigint not null default 0 comment '文件大小，byte',
    `f_state` tinyint(4) not null default '0' comment '使用状态 0未使用 1正常',
    `f_create_user` int not null default 0 comment '创建人',
    `f_create_time` bigint not null default 0 comment '创建时间',
    `f_update_time` bigint not null default 0 comment '修改时间',
    `f_delete_time` bigint not null default 0 comment '删除时间',
    primary key (`f_id`) using BTREE,
    key `idx_f_app_type` (`f_app_type`) using BTREE,
    key `idx_f_state` (`f_state`) using BTREE,
    key `idx_f_create_time` (`f_create_time`) using BTREE,
    key `idx_f_delete_time` (`f_delete_time`) using BTREE,
    key `idx_f_group` (`f_group`) using BTREE,
    key `idx_f_table` (`f_table`) using BTREE,
    key `idx_f_field` (`f_field`) using BTREE
) comment = '文件数据表';

-- ----------------------------
-- Table structure for `cs_api_communicant`
-- 平台用户管理表 511
-- ----------------------------
drop table if exists `cs_api_communicant`;
CREATE TABLE `cs_api_communicant` (
  `ac_id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  
  -- 基础身份与归属信息
  `ac_type` tinyint(3) unsigned NOT NULL DEFAULT 3 COMMENT '接入类型：0-其他, 2-服务商, 3-开方机构',
  `ac_name` varchar(100) NOT NULL DEFAULT '' COMMENT '对接方/凭证名称',
  `ac_appid` varchar(100) NOT NULL DEFAULT '' COMMENT '应用标识(AppID/ClientID)',
  `ac_appsecret` varchar(255) NOT NULL DEFAULT '' COMMENT '应用密钥(AppSecret，需加密存储)',
  
  -- 业务关联信息
  `ac_join_table` varchar(100) NOT NULL DEFAULT '' COMMENT '关联业务表名',
  `ac_join_field` varchar(100) NOT NULL DEFAULT '' COMMENT '关联业务表字段',
  `ac_join_data` int unsigned NOT NULL DEFAULT '0' COMMENT '关联业务表数据ID',
  
  -- 核心：算法与用途配置
  `ac_algo_type` tinyint(3) unsigned NOT NULL DEFAULT 2 COMMENT '算法大类：0-无, 1-对称加密, 2-非对称加密, 3-摘要/哈希, 4-X509证书',
  `ac_algo_name` varchar(32) NOT NULL DEFAULT 'RSA' COMMENT '具体算法：RSA, SM2, AES, SM4, SHA256, SM3',
  `ac_key_len` int unsigned NOT NULL DEFAULT 2048 COMMENT '密钥长度(如: 1024, 2048, 128, 256)',
  `ac_key_usage` varchar(64) NOT NULL DEFAULT '' COMMENT '密钥用途：DATA_ENC, SIGN_VERIFY, AUTH, DIGEST',
  
  -- 对接方（第三方）凭证信息
  `ac_peer_key_id` varchar(500) NOT NULL DEFAULT '' COMMENT '对接方唯一标识/KeyID',
  `ac_peer_public_key` text COMMENT '对接方公钥(密文)',
  `ac_peer_private_key` text COMMENT '对接方私钥(密文，极少见，通常仅存公钥)',
  `ac_peer_cert` text COMMENT '对接方X.509证书内容(PEM/CER格式密文)',
  `ac_peer_cert_thumbprint` varchar(500) DEFAULT '' COMMENT '对接方证书指纹(SHA-256哈希，用于快速校验)',
  `ac_peer_key_pwd` varchar(500) DEFAULT '' COMMENT '对接方私钥/证书保护密码(密文)',
  
  -- 我方（己方）凭证信息
  `ac_self_public_key` text COMMENT '我方公钥(密文)',
  `ac_self_private_key` text COMMENT '我方私钥(密文)',
  `ac_self_cert` text COMMENT '我方X.509证书内容(PEM/CER格式密文)',
  `ac_self_cert_thumbprint` varchar(500) DEFAULT '' COMMENT '我方证书指纹(SHA-256哈希，用于快速校验)',
  `ac_self_key_pwd` varchar(500) DEFAULT '' COMMENT '我方私钥/证书保护密码(密文)',
  
  -- 证书生命周期管理
  `ac_cert_expire_time` BIGINT not null default 0 COMMENT '证书/密钥过期时间(便于系统自动告警)',
  
  -- 通信与驱动配置
  `ac_driver` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '通讯密钥驱动：0-sichuan_wuhou(武侯V0.33);1-rsa;2-rsa_x509;3-sm2;4-aes(AES-256-CBC);5-aes_128_cbc;6-aes_192_cbc;7-aes_256_gcm;8-sm4(SM4-ECB);9-sm4_cbc;10-sha256;11-sm3',
  `ac_server` varchar(500) DEFAULT NULL COMMENT '三方回调/通知服务器地址',
  
  -- 状态与审计
  `ac_state` tinyint unsigned NOT NULL DEFAULT 1 COMMENT '状态：0-停用, 1-启用',
  `ac_remark` varchar(500) DEFAULT '' COMMENT '备注说明',
  `ac_create_time` BIGINT not null default 0 comment '创建时间',
  `ac_update_time` BIGINT not null default 0 comment '更新时间',
  `ac_delete_time` BIGINT not null default 0 comment '软删除时间',
  
  PRIMARY KEY (`ac_id`) USING BTREE,
  UNIQUE KEY `uk_ac_appid` (`ac_appid`) USING BTREE COMMENT 'AppID全局唯一',
  
  -- 核心业务联合索引：根据接入类型+业务数据ID精准查询
  KEY `idx_type_join_data` (`ac_type`, `ac_join_data`) USING BTREE COMMENT '按接入类型和业务ID联合检索',
  
  KEY `idx_ac_algo_type` (`ac_algo_type`) USING BTREE COMMENT '按算法大类检索',
  KEY `idx_ac_peer_key_id` (`ac_peer_key_id`) USING BTREE COMMENT '按对接方标识快速匹配',
  KEY `idx_ac_peer_thumbprint` (`ac_peer_cert_thumbprint`) USING BTREE COMMENT '按对接方证书指纹校验',
  KEY `idx_ac_self_thumbprint` (`ac_self_cert_thumbprint`) USING BTREE COMMENT '按我方证书指纹校验',
  KEY `idx_ac_cert_expire` (`ac_cert_expire_time`) USING BTREE COMMENT '证书过期预警定时任务检索',
  KEY `idx_ac_delete_time` (`ac_delete_time`) USING BTREE COMMENT '软删除记录清理检索'
  
) COMMENT='API对接凭证与密钥管理表';

-- ----------------------------
-- Table structure for cs_system_config
-- 系统设置
-- ----------------------------
drop table if exists `cs_system_config`;
create table `cs_system_config` (
    `sc_id` INT not null auto_increment comment 'id',
    `sc_join_table` VARCHAR (50) not null default '' comment '关联组织表名',
    `sc_join_data` INT not null default 0 comment '关联组织数据ID',
    `sc_clean_rule` json default null comment '文件资源清理规则',
    primary key (`sc_id`) using BTREE,
    key `idx_sc_join` (`sc_join_table`, `sc_join_data`) using BTREE
) comment = '系统配置';
-- ----------------------------
-- Table structure for cs_system_record
-- 配置记录
-- ----------------------------
drop table if exists `cs_system_record`;
create table `cs_system_record` (
    `sr_id` INT unsigned not null auto_increment comment '主键',
    `sr_join_table` VARCHAR (11) not null default '' comment '关联表表名称',
    `sr_join_field` VARCHAR (50) not null default '' comment '关联表表字段',
    `sr_join_data` INT not null default 0 comment '关联表表数据',
    -- `sr_hospital` INT NOT NULL DEFAULT 0 COMMENT '医院，关联cs_hospital',
    `sr_title` VARCHAR (100) not null default '' comment '标题',
    `sr_field` VARCHAR (100) not null default '' comment '字段',
    `sr_value` VARCHAR (20) not null default '' comment '修改的值',
    `sr_remark` VARCHAR (20) not null default '' comment '备注',
    `sr_extend` json default null comment '扩展信息存储的是本次修改的所有数据',
    `sr_create_user` INT not null default 0 comment '修改人',
    `sr_create_time` INT unsigned not null default 0 comment '创建时间',
    `sr_update_time` INT unsigned not null default 0 comment '修改时间',
    `sr_delete_time` INT unsigned not null default 0 comment '删除时间',
    primary key (`sr_id`),
    key `idx_sr_create_user` (`sr_create_user`) using BTREE,
    key `idx_sr_create_time` (`sr_create_time`) using BTREE
) comment = '配置修改记录';
drop table if exists `cs_task_record`;
create table `cs_task_record` (
    `tr_id` int unsigned not null auto_increment comment '主键',
    `tr_date` int not null default 0 comment '执行日期',
    `tr_name` varchar(100) not null default '' comment '进程类名',
    `tr_begin_time` int not null default 0 comment '开始执行时间',
    `tr_end_time` int not null default 0 comment '结束执行时间',
    `tr_execute_num` int not null default 1 comment '执行次数',
    `tr_extend` json default null comment '执行后扩展信息',
    `tr_state` tinyint not null default 1 comment '执行状态，1执行中，2执行完成',
    `tr_create_time` int not null default 0 comment '创建时间',
    `tr_update_time` int not null default 0 comment '修改时间',
    `tr_delete_time` int not null default 0 comment '删除时间',
    primary key (`tr_id`),
    key `idx_tr_date` (`tr_date`) using BTREE,
    key `idx_tr_name` (`tr_name`) using BTREE,
    key `idx_tr_state` (`tr_state`) using BTREE
) comment '任务执行记录';
-- ----------------------------
-- Table structure for `cs_provider`
-- 服务商
-- ----------------------------
drop table if exists `cs_provider`;
create table `cs_provider` (
    `p_id` INT not null auto_increment,
    `p_code` VARCHAR(32) not null default '' comment '服务商标识码 自定义标识码',
    `p_name` VARCHAR (100) not null default '' comment '服务商名称',
    `p_state` TINYINT not null default 1 comment '服务商状态 1正常 0禁用',
    `p_remark` VARCHAR (1000) not null default '' comment '备注',
    `p_create_time` BIGINT not null default 0 comment '创建时间',
    `p_update_time` BIGINT not null default 0 comment '更新时间',
    `p_delete_time` BIGINT not null default 0 comment '删除时间',
    primary key (`p_id`) using BTREE,
    key `idx_name` (`p_name`) using BTREE
) comment = '服务商';
-- ----------------------------
-- Table structure for `cs_provider_application`
-- 服务商应用
-- ----------------------------
drop table if exists `cs_provider_application`;
create table `cs_provider_application` (
    `pa_id` INT not null auto_increment comment '主键',
    `pa_provider` INT not null default 0 comment '服务商id，关联服务商表',
    `pa_provider_code` VARCHAR(32) not null default '' comment '服务商code',
    `pa_code` VARCHAR(50) not null default '' comment '应用编码',
    `pa_name` VARCHAR(50) not null default '' comment '应用别名',
    `pa_state` TINYINT not null default 1 comment '应用状态，0关闭；1开启',
    `pa_api_communicant` INT not null default 0 comment '关联的秘钥表数据',
    `pa_remark` VARCHAR(255) default '' comment '备注 ',
    `pa_param` JSON comment '应用配置所需参数',
    `pa_extend` JSON comment '扩展',
    `pa_create_time` BIGINT not null default 0 comment '创建时间',
    `pa_update_time` BIGINT not null default 0 comment '修改时间',
    `pa_delete_time` BIGINT not null default 0 comment '删除时间',
    primary key (`pa_id`) using BTREE,
    unique key `un_uniq_code_info` (
        `pa_provider_code`,
        `pa_code`,
        `pa_delete_time`
    ) using BTREE,
    key `idx_pa_code` (`pa_code`) using BTREE,
    key `idx_pa_delete_time` (`pa_delete_time`) using BTREE
) comment = '服务商应用表';
-- ----------------------------
-- Table structure for `cs_provider_application_subscriber`
-- 服务商应用被订阅的关联表
-- ----------------------------
drop table if exists `cs_provider_application_subscriber`;
create table `cs_provider_application_subscriber` (
    `pas_id` INT not null auto_increment,
    `pas_app_type` TINYINT not null default 3 comment '应用类型， 0-首页;1-管理后台;4-用户端;7-开放平台',
    `pas_join_table` VARCHAR (50) not null default '' comment '关联表表名称',
    `pas_join_data` INT not null default 0 comment '关联表表数据',
    `pas_provider` INT not null default 0 comment '关联服务商',
    `pas_provider_code` VARCHAR(32) not null default '' comment '服务商code',
    `pas_provider_application` INT not null default 0 comment '关联服务商应用',
    `pas_provider_application_code` VARCHAR(50) not null default '1' comment '应用类型',
    `pas_code` VARCHAR(32) not null default '' comment '应用内标识码',
    `pas_extend` JSON default null comment '自定义扩展信息',
    `pas_state` TINYINT not null default 1 comment '订阅状态 1正常 0禁用',
    `pas_remark` VARCHAR(255) default '' comment '备注',
    `pas_api_communicant` INT not null default 0 comment '关联的秘钥表数据（可无）',
    `pas_create_time` BIGINT not null default 0 comment '创建时间',
    `pas_update_time` BIGINT not null default 0 comment '更新时间',
    `pas_delete_time` BIGINT not null default 0 comment '删除时间',
    primary key (`pas_id`) using BTREE,
    key `idx_pas_provider_application` (`pas_provider_application`) using BTREE,
    key `idx_pas_provider` (`pas_provider`) using BTREE,
    key `idx_pas_subscriber` (`pas_join_table`, `pas_join_data`) using BTREE
) comment = '服务商应用被订阅的关联表';

-- ============================================================================
-- 初始化种子数据（用户决策 1.3：角色、用户均在初始化建表语句中插入数据）
-- 依据 07-admin-account-rbac.md FR-1 / FR-3：Admin 为系统 seed 生成；三档角色本期全种子。
-- 注意：
--   * 超管账号口令为框架默认占位（123456，salt=RzyL）；首次登录强制改密（07 FR-1.5）。
--     生产部署应通过部署脚本随机化口令并打印到部署日志/环境变量。
--   * cs_role.r_level=0 为超级管理员快路径（PermissionMiddleware 直接全放行）；
--     运营/客服走显式 cs_role_permission 授权（待 admin 功能码目录补全后补，见 07 §9）。
--   * 角色/用户 id 显式指定，便于 cs_relation 直接引用，且不影响后续 AUTO_INCREMENT。
-- ============================================================================

-- ----------------------------
-- 种子：超级管理员账号（app_type=1）
-- ----------------------------
INSERT INTO `cs_user` (`usr_id`, `usr_app_type`, `usr_account`, `usr_pwd`, `usr_salt`, `usr_real_name`, `usr_state`, `usr_create_time`, `usr_update_time`)
VALUES (1, 1, 'admin', '68b6b4ab792a4476db8f6937bb4c4d12', 'RzyL', '超级管理员', 1, 0, 0);

-- ----------------------------
-- 种子：Admin 三档角色（超管 / 运营 / 客服）
-- ----------------------------
INSERT INTO `cs_role` (`r_id`, `r_app_type`, `r_level`, `r_systemed`, `r_name`, `r_state`)
VALUES
    (1, 1, 0, 1, '超级管理员', 1),
    (2, 1, 1, 1, '运营', 1),
    (3, 1, 2, 1, '客服', 1);

-- ----------------------------
-- 种子：超管账号 ↔ 超级管理员角色 绑定
-- ----------------------------
INSERT INTO `cs_relation` (`rel_user`, `rel_role`, `rel_app_type`, `rel_role_level`)
VALUES (1, 1, 1, 0);
