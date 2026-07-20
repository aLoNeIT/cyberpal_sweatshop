-- ============================================
-- 03-code.sql — 通用码表定义与小规模初始化数据
-- ============================================

-- ----------------------------
-- Table structure for cs_country   国家101
-- ----------------------------
DROP TABLE IF EXISTS `cs_country`;
CREATE TABLE `cs_country`  (
  `c_code` char(3) NOT NULL DEFAULT '' COMMENT '编号',
  `c_title` varchar(50) NOT NULL DEFAULT '' COMMENT '名字',
  `c_py` varchar(50) NOT NULL DEFAULT '' COMMENT '拼音',
  PRIMARY KEY (`c_code`) USING BTREE
)  COMMENT = '国籍表';


-- ----------------------------
-- Table structure for cs_nation  民族102
-- ----------------------------
DROP TABLE IF EXISTS `cs_nation`;
CREATE TABLE `cs_nation`  (
  `na_code` char(2)  NOT NULL DEFAULT '',
  `na_name` varchar(20) NOT NULL DEFAULT '' COMMENT '民族',
  PRIMARY KEY (`na_code`) USING BTREE,
  INDEX `Idx_name`(`na_name`) USING BTREE
)  COMMENT = '民族';

-- ----------------------------
-- Table structure for cs_house_area  籍贯（行政区划表）103
-- ----------------------------
DROP TABLE IF EXISTS `cs_house_area`;
CREATE TABLE `cs_house_area`  (
  `ha_code` char(10)  NOT NULL DEFAULT '',
  `ha_name` varchar(50)  NOT NULL DEFAULT '' COMMENT '名称',
  `ha_shortname` varchar(50)  NOT NULL DEFAULT '' COMMENT '简称',
  `ha_pinyin` varchar(50)  NOT NULL DEFAULT '' COMMENT '拼音',
  `ha_pinyin_short` varchar(50)  NOT NULL DEFAULT '' COMMENT '简拼',
  `ha_citycode` varchar(50)  NOT NULL DEFAULT '' COMMENT '城市编码',
  `ha_zipcode` varchar(50)  NOT NULL DEFAULT '' COMMENT '邮政编码',
  `ha_parent` char(10)  NOT NULL DEFAULT '' COMMENT '上级地区',
  `ha_child` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否拥有下级',
  `ha_level` tinyint(4) NOT NULL DEFAULT 1 COMMENT '级别',
  `ha_path` varchar(255)  NOT NULL DEFAULT '' COMMENT '全路径',
  PRIMARY KEY (`ha_code`) USING BTREE,
  INDEX `idx_ha_name`(`ha_name`) USING BTREE,
  INDEX `idx_ha_pinyin`(`ha_pinyin`) USING BTREE,
  INDEX `idx_ha_pinyin_short`(`ha_pinyin_short`) USING BTREE
)  COMMENT = '行政区划表';


-- ----------------------------
-- Table structure for `cs_sex`
-- 性别类型    104
-- ----------------------------
DROP TABLE IF EXISTS `cs_sex`;
CREATE TABLE `cs_sex` (
  `sex_code` char(10) NOT NULL DEFAULT '' comment '性别编码',
  `sex_name` varchar(50) NOT NULL DEFAULT '' comment '性别名称',
  PRIMARY KEY (`sex_code`),
  KEY `idx_sex_name` (`sex_name`) USING BTREE
) comment='性别类型';
INSERT INTO `cs_sex`(`sex_code`,`sex_name`) VALUES ('0', '未知');
INSERT INTO `cs_sex`(`sex_code`,`sex_name`) VALUES ('1', '男');
INSERT INTO `cs_sex`(`sex_code`,`sex_name`) VALUES ('2', '女');
