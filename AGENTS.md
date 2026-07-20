# 项目规范说明

本文档为项目规范入口页，用于统一索引当前项目的目录结构、分支管理、开发规范、数据库规范、安全要求和工作文档标准。

## 使用说明

- `AGENTS.md` 仅保留规范大纲、适用范围和专题索引。
- 具体规范内容已按主题拆分到 `.agents/` 目录下维护。
- 后续新增或调整规范时，应优先修改对应专题文件，并保持本索引同步更新。

## 任务启动规范

AI 在启动任何开发、修复、审计、文档或工作项相关任务前，必须先分析当前任务的功能类型、影响范围和可能涉及的规范索引文件，并按需将相关 `.agents/*.md` 文件读取进入当前会话。

- 任务开始前应先根据任务内容判断需要参考的专题规范，例如目录结构、分支管理、编码开发、数据库、分层架构、性能事务、安全、运行时、权限、异常日志、测试或工作文档等。
- 若当前会话历史中已经读取过某个相关规范文件，且文件未发生变更，则无需重复读取；若无法确认是否已读取或规范可能已变更，应重新读取。
- 执行任务时应尽可能遵循已读取的相关规范文件要求；若多个规范同时适用，应同时执行，不得只选择其中一部分。
- 若任务涉及新增或修改代码、接口、配置、数据库或测试，应优先读取对应专题规范后再执行。
- 若因上下文、工具或权限限制无法读取某个必要规范，应在执行前说明限制，并基于已知规范谨慎推进。

## 受保护文件

以下文件为受保护文件，未经用户明确要求，禁止自行修改：

- `app/common/logic/DictLogic.php`
- `app/http/common/controller/BaseController.php`
- `app/http/common/controller/DictCrudController.php`

## 任务执行口令

- 每次任务执行启动时，必须输出：`献祭吧，帕鲁！`
- 每次任务执行完成时，必须输出：`风紧，扯呼！`

## 个人工作区索引

- 仓库根目录下的 `WORKSPACE.md` 用于记录个人开发环境配置，包括本机 PHP 路径、容器信息、关联的外部项目或资料目录，供 AI 在任务需要时按需访问当前工作区之外的文件。
- `WORKSPACE.md` 属于 Git 忽略的本机文件，不保证在其他开发环境中存在；文件不存在时不得视为项目配置缺失或任务异常。
- 访问 `WORKSPACE.md` 中记录的关联目录前，应先读取目标目录的 `README.md`、`AGENTS.md` 及下级适用规范，并遵循目标目录自身的约束；`WORKSPACE.md` 仅提供路径和用途索引，不覆盖目标目录规范。

## 规范目录索引

### 1. 目录与结构

- [目录结构规范](.agents/01-directory-structure.md)
  - 约定**仓库顶层 Monorepo 分区**（`service/` 后端、`web/` 前端、`document/` 文档、`deploy/` 部署，及忽略目录 `docs/`、`.tmp/`、`.workbuddy/`）；以及 `app` 顶层拆分方式、应用分层结构、前端项目结构与目录整理原则。

### 2. 协作与分支

- [分支管理规范](.agents/02-branch-management.md)
  - 约定固定分支职责、工作模式、特性分支与发布分支命名方式，以及中文提交说明与提交后推送要求。

### 3. 编码与开发

- [编码规范](.agents/03-coding-standards.md)
  - 包含通用编码要求、命名后缀、PHP 规范、注释规范、返回结构（`JsonTable|Psr\Http\Message\ResponseInterface`）、`Helper::throwifJError` 安全获取规范、`empty()` 空数组判定、校验、Redis、路由与容器规范。

### 4. 数据与模型

- [数据库规范](.agents/04-database-standards.md)
  - 约定表名、字段名、必备字段、索引命名与字段设计规则。
- [项目分层规范](.agents/05-layered-architecture.md)
  - 约定 `Controller / Logic / Model / View` 分层职责、DictCrudController 标准 CRUD 开发模式。

### 5. 性能与安全

- [性能与事务规范](.agents/06-performance-and-transaction.md)
  - 约定事务使用边界、慢 SQL、慢执行与异步处理要求。
- [安全规范](.agents/07-security-standards.md)
  - 约定参数过滤、数据脱敏与统一脱敏处理要求。
- [Hyperf 运行时规范](.agents/13-hyperf-runtime-standards.md)
  - 约定 Hyperf 长驻进程、协程、容器注入、配置、队列、后台进程与运行时缓存要求。
- [权限与安全规范](.agents/14-permission-and-security-standards.md)
  - 约定登录态、接口权限、白名单、输入输出安全、文件安全和敏感信息保护要求。
- [异常与日志规范](.agents/15-exception-logging-standards.md)
  - 约定业务异常、错误码、日志级别、敏感日志过滤、审计追踪和对外错误响应要求。

### 6. 文档与执行

- [工作文档规范](.agents/08-work-documentation.md)
  - 约定需求文档、任务文档的必填内容与模板。
- [执行要求](.agents/09-execution-requirements.md)
  - 约定新代码、历史代码、多类规范和提交同步的统一执行要求。

### 7. 测试

- [测试规范](.agents/10-testing-standards.md)
  - 约定测试目录结构、测试组织方式、执行入口、断言要求与风险控制。

### 8. 开发注意事项

- [本地执行环境注意事项](.agents/16-local-execution-environment.md)
  - 记录 Windows PowerShell 编码、保留变量、数组构造和脚本文件管理注意事项。

### 9. Hyperf 开发规则

- [Hyperf 开发执行规则](.agents/13-hyperf-development-rules.md)
  - 约定后续 Hyperf 3.1 后端开发的优先级、禁止事项、实现要求、封装边界和回答结构。

### 10. 代码审查

- [代码审查标准](.agents/17-code-review-standards.md)
  - 约定代码审查触发时机、问题优先级、检查维度、审查流程、项目特定检查项和 PR / 审查结论模板。

### 11. 前端开发

- [ng-alain 前端开发规范](.agents/18-ng-alain-frontend-standards.md)
  - 约定 Angular + ng-alain 项目结构、组件/服务/路由规范、API 交互约定和样式约定。
