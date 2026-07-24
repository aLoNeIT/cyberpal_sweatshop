-- ============================================================================
-- File: 02-cyberpal_sweatshop.sql
-- Purpose: cyberpal 业务表（本项目核心业务数据）。按 sql/AGENTS.md 约定，
--          `02-cyberpal_sweatshop.sql` 即"本项目业务表"的归属文件。
-- Provenance: 本文件由 `service/app/Model/*` 实际模型反向生成（2026-07-21），
--             用于补齐 document/sql 缺失的业务表定义，解除 PRD/SQL 漂移。
-- Engine/Charset: InnoDB / utf8mb4
--
-- 修订历史：
-- - 2026-07-21 晚（用户裁定）：
--     * 单一 `cs_user` 表（见 01-base.sql），删除 `users` 表；所有业务表 `user_id`
--       外键统一指向 `cs_user.usr_id`。
--     * 所有业务表加 `cs_` 前缀（sql/AGENTS.md 硬性规定）。
--     * 用户端偏好列（theme_pref / auto_archive_enabled / auto_archive_days）并入
--       01-base.sql 的 `cs_user`，本文件不再含 ALTER。
-- - 2026-07-22（用户决策 1.1 + 数据库规范 §2 对齐）：
--     * 时间戳全面改为 **秒级 Unix 时间戳（BIGINT UNSIGNED）**，列名统一为
--       `create_time` / `update_time` / `delete_time`，与 `BaseModel.$dateFormat='U'`
--       及 04-database-standards.md 一致；**禁止 DATETIME / TIMESTAMP / 字符串日期**。
--     * 所有业务表补齐 `delete_time`（软删，与 `cs_user.usr_delete_time` 同范式）。
--     * 所有字段 `NOT NULL` 且带默认值（04 规范 §5：禁止 null、必须有默认值）。
--     * `archived_at`(DATETIME) → `archived_time`(BIGINT 秒级)。
-- - 2026-07-22（用户决策 1.2 / 1.6）：
--     * `cs_mcp_template` 由【规划中】转正为正式表（平台级 MCP 模板）。
--     * 新增通知体系：`cs_notify_channel` / `cs_notify_template` / `cs_notify_inbox`
--       / `cs_notify_log`（闭环 01 R-015 用量预警，详见 10 §4）。
--     * 新增指标体系：`cs_metrics_definition` / `cs_metrics_daily`（详见 10 §5）。
-- ============================================================================

-- ----------------------------
-- Table structure for `cs_agents`
-- Agent 定义。user_id → cs_user.usr_id（单一用户表，usr_app_type=4 为用户端账户）。
-- ----------------------------
DROP TABLE IF EXISTS `cs_agents`;
CREATE TABLE `cs_agents` (
    `id`                   VARCHAR(36)   NOT NULL DEFAULT '' COMMENT 'UUID 主键',
    `user_id`              INT           NOT NULL DEFAULT 0 COMMENT '所属用户（cs_user.usr_id）',
    `name`                 VARCHAR(255)  NOT NULL DEFAULT '' COMMENT 'Agent 名称',
    `description`          TEXT          NOT NULL COMMENT '描述',
    `system_prompt`        TEXT          NOT NULL COMMENT '系统提示词',
    `append_system_prompt` TEXT          NOT NULL COMMENT '追加系统提示词',
    `provider`             VARCHAR(64)   NOT NULL DEFAULT 'openai' COMMENT 'LLM 提供商',
    `model`                VARCHAR(128)  NOT NULL DEFAULT '' COMMENT '模型名',
    `thinking`             VARCHAR(32)   NOT NULL DEFAULT 'medium' COMMENT '思考深度',
    `tools_whitelist`      TEXT          NOT NULL COMMENT '工具白名单（逗号分隔）',
    `tools_blacklist`      TEXT          NOT NULL COMMENT '工具黑名单（逗号分隔）',
    `profile_name`         VARCHAR(255)  NOT NULL DEFAULT '' COMMENT 'OMP --profile 值',
    `status`               VARCHAR(32)   NOT NULL DEFAULT 'offline' COMMENT 'offline|online|error',
    `create_time`          BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time`          BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time`          BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_delete_time` (`delete_time`),
    CONSTRAINT `fk_cs_agents_user` FOREIGN KEY (`user_id`) REFERENCES `cs_user` (`usr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Agent 定义表';

-- ----------------------------
-- Table structure for `cs_sessions`
-- 会话。user_id → cs_user.usr_id；agent_id → cs_agents.id。状态机用 status，不硬删。
-- ----------------------------
DROP TABLE IF EXISTS `cs_sessions`;
CREATE TABLE `cs_sessions` (
    `id`                 VARCHAR(36)   NOT NULL DEFAULT '' COMMENT 'UUID 主键',
    `user_id`            INT           NOT NULL DEFAULT 0 COMMENT '所属用户（cs_user.usr_id）',
    `agent_id`           VARCHAR(36)   NOT NULL DEFAULT '' COMMENT '绑定 Agent（cs_agents.id）',
    `title`              VARCHAR(512)  NOT NULL DEFAULT '' COMMENT '会话标题',
    `omp_session_id`     VARCHAR(255)  NOT NULL DEFAULT '' COMMENT 'OMP 原生 session 文件 id',
    `status`             VARCHAR(32)   NOT NULL DEFAULT 'active' COMMENT 'active|archived|deleted',
    `mode`               VARCHAR(32)   NOT NULL DEFAULT 'normal' COMMENT 'normal|resumed|forked',
    `parent_session_id`  VARCHAR(36)   NULL     DEFAULT NULL COMMENT 'fork 来源会话（可选外键，NULL=无）',
    `message_count`      INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '消息计数',
    `last_usage`         JSON          NOT NULL DEFAULT '{}' COMMENT '最近一次 usage 快照',
    `archived_time`      BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '归档时间（秒级时间戳，0=未归档）',
    `create_time`        BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time`        BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time`        BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_agent_id` (`agent_id`),
    KEY `idx_status` (`status`),
    KEY `idx_delete_time` (`delete_time`),
    CONSTRAINT `fk_cs_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `cs_user` (`usr_id`),
    CONSTRAINT `fk_cs_sessions_agent` FOREIGN KEY (`agent_id`) REFERENCES `cs_agents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会话表';

-- ----------------------------
-- Table structure for `cs_messages`
-- 消息。session_id → cs_sessions.id。消息不可变，无 update_time 语义（update_time 保留为 0）。
-- ----------------------------
DROP TABLE IF EXISTS `cs_messages`;
CREATE TABLE `cs_messages` (
    `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `session_id` VARCHAR(36)   NOT NULL DEFAULT '' COMMENT '所属会话（cs_sessions.id）',
    `role`       VARCHAR(32)   NOT NULL DEFAULT '' COMMENT 'user|assistant|system',
    `content`    MEDIUMTEXT    NOT NULL COMMENT '正文',
    `thinking`   MEDIUMTEXT    NOT NULL COMMENT '思考过程',
    `seq`        INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '会话内顺序',
    `create_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳，消息不可变=0）',
    `delete_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_seq` (`seq`),
    KEY `idx_delete_time` (`delete_time`),
    CONSTRAINT `fk_cs_messages_session` FOREIGN KEY (`session_id`) REFERENCES `cs_sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- ----------------------------
-- Table structure for `cs_events`
-- 结构化事件落库。session_id → cs_sessions.id；message_id → cs_messages.id（可选）。
-- ----------------------------
DROP TABLE IF EXISTS `cs_events`;
CREATE TABLE `cs_events` (
    `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `session_id` VARCHAR(36)   NOT NULL DEFAULT '' COMMENT '所属会话（cs_sessions.id）',
    `message_id` INT UNSIGNED  NULL     DEFAULT NULL COMMENT '关联消息（cs_messages.id，可选外键）',
    `event_type` VARCHAR(32)   NOT NULL DEFAULT '' COMMENT 'tool_call|usage|error|meta',
    `seq`        INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '会话内顺序',
    `payload`    JSON          NOT NULL DEFAULT '{}' COMMENT '结构化数据',
    `create_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_message_id` (`message_id`),
    KEY `idx_event_type` (`event_type`),
    KEY `idx_delete_time` (`delete_time`),
    CONSTRAINT `fk_cs_events_session` FOREIGN KEY (`session_id`) REFERENCES `cs_sessions` (`id`),
    CONSTRAINT `fk_cs_events_message` FOREIGN KEY (`message_id`) REFERENCES `cs_messages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='事件表（结构化事件落库）';

-- ----------------------------
-- Table structure for `cs_skill_library`
-- 平台托管 Skill 库。Admin FR-1 治理对象。
-- ----------------------------
DROP TABLE IF EXISTS `cs_skill_library`;
CREATE TABLE `cs_skill_library` (
    `id`          VARCHAR(36)   NOT NULL DEFAULT '' COMMENT 'UUID 主键',
    `name`        VARCHAR(255)  NOT NULL DEFAULT '' COMMENT 'Skill 名称',
    `description` TEXT          NOT NULL COMMENT '描述',
    `path`        VARCHAR(512)  NOT NULL DEFAULT '' COMMENT '磁盘目录路径',
    `enabled`     TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否启用 0/1',
    `create_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_name` (`name`),
    KEY `idx_delete_time` (`delete_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='平台托管 Skill 库';

-- ----------------------------
-- Table structure for `cs_mcp_config`
-- 单 Agent 的 MCP 配置（per-agent 实例，最终生成 .omp/mcp.json）。
-- 区别于 `cs_mcp_template`（平台级模板）。agent_id → cs_agents.id。
-- ----------------------------
DROP TABLE IF EXISTS `cs_mcp_config`;
CREATE TABLE `cs_mcp_config` (
    `id`           VARCHAR(36)   NOT NULL DEFAULT '' COMMENT 'UUID 主键',
    `agent_id`     VARCHAR(36)   NOT NULL DEFAULT '' COMMENT '所属 Agent（cs_agents.id）',
    `name`         VARCHAR(255)  NOT NULL DEFAULT '' COMMENT 'MCP Server 名称',
    `transport`    VARCHAR(32)   NOT NULL DEFAULT '' COMMENT 'stdio|http|sse',
    `command`      VARCHAR(512)  NOT NULL DEFAULT '' COMMENT 'stdio: 可执行文件',
    `args_json`    JSON          NOT NULL DEFAULT '{}' COMMENT 'stdio: 参数数组',
    `url`          VARCHAR(512)  NOT NULL DEFAULT '' COMMENT 'http/sse: 地址',
    `env_json`     JSON          NOT NULL DEFAULT '{}' COMMENT '环境变量',
    `headers_json` JSON          NOT NULL DEFAULT '{}' COMMENT 'http/sse 鉴权头',
    `enabled`      TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否启用 0/1',
    `create_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    KEY `idx_agent_id` (`agent_id`),
    KEY `idx_delete_time` (`delete_time`),
    CONSTRAINT `fk_cs_mcp_config_agent` FOREIGN KEY (`agent_id`) REFERENCES `cs_agents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='MCP 配置表（单 Agent 实例）';

-- ----------------------------
-- Table structure for `cs_agent_skill`
-- Agent-Skill 多对多关联。
-- ----------------------------
DROP TABLE IF EXISTS `cs_agent_skill`;
CREATE TABLE `cs_agent_skill` (
    `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `agent_id`    VARCHAR(36)   NOT NULL DEFAULT '' COMMENT 'Agent（cs_agents.id）',
    `skill_id`    VARCHAR(36)   NOT NULL DEFAULT '' COMMENT 'Skill（cs_skill_library.id）',
    `create_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `un_idx_agent_skill` (`agent_id`, `skill_id`),
    KEY `idx_skill_id` (`skill_id`),
    KEY `idx_delete_time` (`delete_time`),
    CONSTRAINT `fk_cs_agent_skill_agent` FOREIGN KEY (`agent_id`) REFERENCES `cs_agents` (`id`),
    CONSTRAINT `fk_cs_agent_skill_skill` FOREIGN KEY (`skill_id`) REFERENCES `cs_skill_library` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Agent-Skill 多对多关联';

-- ----------------------------
-- Table structure for `cs_billing_records`
-- 计费记录。user_id → cs_user.usr_id。
-- cost_estimate 为 USD 估算费用，使用 DECIMAL(12,6) 以保留 sub-cent token 成本精度，
-- 偏离《数据库规范》§5 的 decimal(10,2) 金额约定（由 token 成本特性决定）。
-- ----------------------------
DROP TABLE IF EXISTS `cs_billing_records`;
CREATE TABLE `cs_billing_records` (
    `id`                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `user_id`            INT           NOT NULL DEFAULT 0 COMMENT '所属用户（cs_user.usr_id）',
    `session_id`         VARCHAR(36)   NOT NULL DEFAULT '' COMMENT '所属会话（cs_sessions.id）',
    `agent_id`           VARCHAR(36)   NOT NULL DEFAULT '' COMMENT '所属 Agent（cs_agents.id）',
    `model`              VARCHAR(128)  NOT NULL DEFAULT '' COMMENT '模型',
    `provider`           VARCHAR(64)   NOT NULL DEFAULT '' COMMENT '提供商',
    `input_tokens`       INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '输入 token',
    `output_tokens`      INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '输出 token',
    `cache_read_tokens`  INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '缓存读取 token',
    `cache_write_tokens` INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '缓存写入 token',
    `cost_estimate`      DECIMAL(12,6) NOT NULL DEFAULT 0.000000 COMMENT '估算费用（USD）',
    `source`             VARCHAR(32)   NOT NULL DEFAULT '' COMMENT 'usage|estimate|provider_api',
    `create_time`        BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time`        BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time`        BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_agent_id` (`agent_id`),
    KEY `idx_create_time` (`create_time`),
    KEY `idx_delete_time` (`delete_time`),
    CONSTRAINT `fk_cs_billing_user` FOREIGN KEY (`user_id`) REFERENCES `cs_user` (`usr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='计费记录表';

-- ----------------------------
-- Table structure for `cs_mcp_template`
-- 平台级 MCP 模板库（PRD 09 FR-2）。与 cs_mcp_config（单 Agent 实例）区分：
-- 模板可被 User 端一键添加为某 Agent 的 cs_mcp_config。
-- 字段与 cs_mcp_config 对齐，去掉 agent_id，增加 description、唯一约束 name。
-- 2026-07-22：由【规划中】转正为正式表（用户决策 1.2）。
-- ----------------------------
DROP TABLE IF EXISTS `cs_mcp_template`;
CREATE TABLE `cs_mcp_template` (
    `id`           VARCHAR(36)   NOT NULL DEFAULT '' COMMENT 'UUID 主键',
    `name`         VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '模板名称',
    `description`  TEXT          NOT NULL COMMENT '描述',
    `transport`    VARCHAR(32)   NOT NULL DEFAULT '' COMMENT 'stdio|http|sse',
    `command`      VARCHAR(512)  NOT NULL DEFAULT '' COMMENT 'stdio: 可执行文件',
    `args_json`    JSON          NOT NULL DEFAULT '{}' COMMENT 'stdio: 参数数组',
    `url`          VARCHAR(512)  NOT NULL DEFAULT '' COMMENT 'http/sse: 地址',
    `env_json`     JSON          NOT NULL DEFAULT '{}' COMMENT '环境变量模板',
    `headers_json` JSON          NOT NULL DEFAULT '{}' COMMENT 'http/sse 鉴权头模板',
    `enabled`      TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否上架 0/1',
    `create_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_name` (`name`),
    KEY `idx_delete_time` (`delete_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='MCP 模板表（平台级）';

-- ============================================================================
-- 通知体系（用户决策 1.6；闭环 01 R-015 用量预警，详见 10 §4）
-- ============================================================================

-- ----------------------------
-- Table structure for `cs_notify_channel`
-- 通知渠道配置：站内信（MVP 必需）、邮件（MVP 必需）、Webhook（Later 预留）。
-- config_json 存放渠道配置（SMTP / Webhook URL / 密钥引用）；密钥建议走环境变量注入，
-- 不落库（见 10 §4.6 风险项）。
-- ----------------------------
DROP TABLE IF EXISTS `cs_notify_channel`;
CREATE TABLE `cs_notify_channel` (
    `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `code`       VARCHAR(32)   NOT NULL DEFAULT '' COMMENT '渠道编码 inapp|email|webhook',
    `name`       VARCHAR(64)   NOT NULL DEFAULT '' COMMENT '渠道名称',
    `type`       VARCHAR(32)   NOT NULL DEFAULT '' COMMENT 'inapp|email|webhook',
    `config_json` JSON         NOT NULL DEFAULT '{}' COMMENT '渠道配置（SMTP/Webhook URL/密钥引用）',
    `enabled`    TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否启用 0/1',
    `create_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_code` (`code`),
    KEY `idx_delete_time` (`delete_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知渠道配置表';

-- ----------------------------
-- Table structure for `cs_notify_template`
-- 通知模板：code 全局唯一（如 usage_warning），body/title 支持 {var} 占位变量。
-- ----------------------------
DROP TABLE IF EXISTS `cs_notify_template`;
CREATE TABLE `cs_notify_template` (
    `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `code`        VARCHAR(64)   NOT NULL DEFAULT '' COMMENT '模板编码（如 usage_warning），全局唯一',
    `channel`     VARCHAR(32)   NOT NULL DEFAULT '' COMMENT '默认渠道 inapp|email|webhook',
    `title`       VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '标题模板（支持 {var} 占位）',
    `body`        TEXT          NOT NULL COMMENT '正文模板（支持 {var} 占位）',
    `variables_json` JSON       NOT NULL DEFAULT '{}' COMMENT '变量定义/示例',
    `enabled`     TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否启用 0/1',
    `create_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_code` (`code`),
    KEY `idx_delete_time` (`delete_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知模板表';

-- ----------------------------
-- Table structure for `cs_notify_inbox`
-- 站内信收件箱。前端「消息中心」读取。read_time=0 表示未读。
-- ----------------------------
DROP TABLE IF EXISTS `cs_notify_inbox`;
CREATE TABLE `cs_notify_inbox` (
    `id`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `user_id`      INT           NOT NULL DEFAULT 0 COMMENT '收件人（cs_user.usr_id）',
    `template_id`  INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '关联模板（cs_notify_template.id，0=无模板直发）',
    `channel`      VARCHAR(32)   NOT NULL DEFAULT 'inapp' COMMENT '投递渠道',
    `title`        VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '实际标题',
    `content`      TEXT          NOT NULL COMMENT '实际正文',
    `payload_json` JSON          NOT NULL DEFAULT '{}' COMMENT '业务负载（关联实体/变量值）',
    `read_time`    BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '已读时间（秒级时间戳，0=未读）',
    `create_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_read_time` (`read_time`),
    KEY `idx_template_id` (`template_id`),
    KEY `idx_delete_time` (`delete_time`),
    CONSTRAINT `fk_cs_notify_inbox_user` FOREIGN KEY (`user_id`) REFERENCES `cs_user` (`usr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站内信收件箱';

-- ----------------------------
-- Table structure for `cs_notify_log`
-- 发送日志：投递状态、重试次数、失败原因。用于送达率统计（10 §5 健康指标）。
-- ----------------------------
DROP TABLE IF EXISTS `cs_notify_log`;
CREATE TABLE `cs_notify_log` (
    `id`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `user_id`      INT           NOT NULL DEFAULT 0 COMMENT '收件人（cs_user.usr_id）',
    `channel`      VARCHAR(32)   NOT NULL DEFAULT '' COMMENT '渠道',
    `template_code` VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '模板编码',
    `status`       VARCHAR(32)   NOT NULL DEFAULT 'pending' COMMENT 'pending|sent|failed',
    `retry_count`  TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '重试次数',
    `error_msg`    VARCHAR(512)  NOT NULL DEFAULT '' COMMENT '失败原因',
    `sent_time`    BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '实际发送时间（秒级时间戳）',
    `create_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_template_code` (`template_code`),
    KEY `idx_delete_time` (`delete_time`),
    CONSTRAINT `fk_cs_notify_log_user` FOREIGN KEY (`user_id`) REFERENCES `cs_user` (`usr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知发送日志表';

-- ============================================================================
-- 指标体系（用户决策 1.6；详见 10 §5 北极星/驱动/健康）
-- ============================================================================

-- ----------------------------
-- Table structure for `cs_metrics_definition`
-- 指标目录：注册所有可度量指标的键、单位、聚合方式。
-- ----------------------------
DROP TABLE IF EXISTS `cs_metrics_definition`;
CREATE TABLE `cs_metrics_definition` (
    `id`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `metric_key`   VARCHAR(64)   NOT NULL DEFAULT '' COMMENT '指标键（如 waas, d7_retention）',
    `name`         VARCHAR(128)  NOT NULL DEFAULT '' COMMENT '指标名',
    `unit`         VARCHAR(32)   NOT NULL DEFAULT '' COMMENT '单位',
    `aggregation`  VARCHAR(32)   NOT NULL DEFAULT 'sum' COMMENT 'sum|avg|count|max',
    `description`  VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '说明',
    `create_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time`  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_metric_key` (`metric_key`),
    KEY `idx_delete_time` (`delete_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='指标目录表';

-- ----------------------------
-- Table structure for `cs_metrics_daily`
-- 日聚合指标事实表：单表承载全部指标（避免 per-metric 表爆炸），按 metric_key + 维度聚合。
-- date 用 YYYYMMDD 整数（秒级时间戳语义下的日期键）；user_id/agent_id 为可选维度（0/空=平台级）。
-- ----------------------------
DROP TABLE IF EXISTS `cs_metrics_daily`;
CREATE TABLE `cs_metrics_daily` (
    `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `metric_key`  VARCHAR(64)   NOT NULL DEFAULT '' COMMENT '指标键（cs_metrics_definition.metric_key）',
    `date`        INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '统计日期（YYYYMMDD 整数）',
    `user_id`     INT           NOT NULL DEFAULT 0 COMMENT '用户维度（0=平台级/不区分）',
    `agent_id`    VARCHAR(36)   NOT NULL DEFAULT '' COMMENT 'Agent 维度（空=不区分）',
    `value`       DECIMAL(20,4) NOT NULL DEFAULT 0.0000 COMMENT '指标值',
    `dim_json`    JSON          NOT NULL DEFAULT '{}' COMMENT '多维标签（provider/skill 等）',
    `create_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`id`),
    UNIQUE KEY `un_idx_metric_date_dim` (`metric_key`, `date`, `user_id`, `agent_id`),
    KEY `idx_date` (`date`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_delete_time` (`delete_time`),
    CONSTRAINT `fk_cs_metrics_daily_def` FOREIGN KEY (`metric_key`) REFERENCES `cs_metrics_definition` (`metric_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='日聚合指标事实表';

-- ----------------------------
-- Table structure for `cs_system_config`
-- 全局配置 KV 表（行级 KV，09 FR-4）：每项配置一行，加配置=插行、零 ALTER。
-- cfg_value 用 JSON 承载任意结构（标量也包成 JSON）；cfg_type 标识语义类型用于应用层校验/转换：
--   1=string 2=int 3=bool 4=json 5=secret（密文，不透明，应用层解密后使用，禁止明文落库/日志）
-- cfg_group 用于分组查询（email/switch/provider...）；cfg_remark 备注。
-- ----------------------------
DROP TABLE IF EXISTS `cs_system_config`;
CREATE TABLE `cs_system_config` (
    `cfg_id`      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `cfg_key`     VARCHAR(64)   NOT NULL DEFAULT '' COMMENT '配置键（全局唯一，如 smtp_host / feature_x_switch）',
    `cfg_value`   JSON          NOT NULL DEFAULT '{}' COMMENT '配置值（JSON；secret 类型存密文）',
    `cfg_type`    TINYINT       NOT NULL DEFAULT 1 COMMENT '语义类型 1=string 2=int 3=bool 4=json 5=secret',
    `cfg_group`   VARCHAR(32)   NOT NULL DEFAULT '' COMMENT '分组（email/switch/provider...）',
    `cfg_remark`  VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '配置说明',
    `create_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间（秒级时间戳）',
    `update_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间（秒级时间戳）',
    `delete_time` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间（软删，秒级时间戳）',
    PRIMARY KEY (`cfg_id`),
    UNIQUE KEY `uniq_cfg_key` (`cfg_key`),
    KEY `idx_cfg_group` (`cfg_group`),
    KEY `idx_delete_time` (`delete_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='全局配置 KV 表';
