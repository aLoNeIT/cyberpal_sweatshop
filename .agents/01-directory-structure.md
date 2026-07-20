# 目录结构规范

本文档用于统一当前项目的目录层级、公共代码归类方式和目录整理原则。

## 0. 仓库顶层结构（Monorepo 分区）

本仓库采用「按职责分区」的 Monorepo 布局。根目录仅保留跨端共享的配置与说明，业务代码按后端 / 前端 / 文档 / 部署四类归置到一级子目录：

| 目录 | 职责 | 关键内容 |
|------|------|----------|
| `service/` | 后端（Hyperf 3.1） | 原根目录后端代码整体迁入；含 `app/`、`config/`、`migrations/`、`composer.json` 等。运行时 `BASE_PATH` 由 `service/bin/hyperf.php` 的 `dirname(__DIR__)` 推导，故 PSR-4（`"App\\": "app/"`）相对 `service/` 自动生效，无需修改 autoload。 |
| `web/` | 前端工程 | 自包含前端目录（构建配置见其根 `vite.config.ts`）；开发时通过 `/api`、`/chat` 代理到后端 `localhost:9502`，与顶层拆分无关。 |
| `document/` | 文档 | 正式项目文档目录（当前为空占位，含 `.gitkeep`，待补充）。 |
| `deploy/` | 构建 / 部署 | 构建与部署配置统一收口：`Dockerfile`、`docker-compose.yml`、`deploy.test.yml`、`.gitlab-ci.yml`、`.github/`、`.devcontainer/`；其内部构建上下文均指向 `service/`。 |

### 0.1 不纳入版本控制的目录（Git 忽略）

以下目录已在根 `.gitignore` 忽略，不进入版本控制，仅本地保留：

- `docs/`：旧文档目录，已废弃。
- `.tmp/`：本地临时草稿（PRD / 设计 / 调研）。
- `.workbuddy/`：助理内部工作记忆（本机文件）。
- `WORKSPACE.md`：个人开发环境配置（PHP 路径、容器信息等）。

### 0.2 与下级规范的关系

- `service/` 内部的应用分层与目录约定，见本文档第 1–4 节及 [项目分层规范](.agents/05-layered-architecture.md)。
- `web/` 的前端结构约定，见本文档第 5 节（及 [ng-alain 前端开发规范](.agents/18-ng-alain-frontend-standards.md)）。
- 顶层迁移历史与命令变化见仓库根 `README.md`。

## 1. `app` 顶层划分

`app` 目录首先按服务器类型进行划分，包含以下两类目录：

- `http`：用于存放 HTTP 服务相关代码。
- `common`：用于存放跨模块公用的代码。

补充约定：

- 只要功能不局限于 HTTP 服务器、具备跨模块复用可能，就必须优先放入 `app/common` 对应子目录。
- 仅在 HTTP 服务内部生效的能力，才允许放在 `app/http` 下。

## 2. HTTP 服务下的应用类型划分

在 `app/http` 下，按照应用类型继续拆分目录。当前项目约定包含以下应用目录：

- `admin` — 管理后台
- `user` — 用户端（C 端用户）
- `open_platform` — 开放平台（第三方 API 接入）
- `common` — HTTP 服务内部公共代码

说明：

- `app/http/common` 指 HTTP 服务内部的公共代码目录。
- `app/common` 指跨模块的公共代码目录。
- 两者职责不同，不能混用。

## 3. 应用目录下的业务分层

每个应用目录下，按职责继续拆分业务层。基础约定包含以下子目录：

- `controller` — 控制器层
- `model` — 模型层
- `logic` — 逻辑层
- `service` — 服务层

根据实际业务需要，后续可继续补充如 `request`、`dto`、`vo`、`repository`、`listener`、`queue`、`event`、`middleware` 等目录，但基础分层以上述四类为主。

## 4. 目标结构示例

```text
app/
├─ common/
│  ├─ annotation/
│  ├─ constants/
│  ├─ contract/
│  ├─ exception/
│  │  └─ handler/
│  ├─ listener/
│  ├─ logic/
│  ├─ model/
│  ├─ process/
│  ├─ queue/
│  ├─ service/
│  ├─ traits/
│  ├─ transaction/
│  └─ util/
├─ http/
│  ├─ admin/
│  │  ├─ controller/
│  │  │  └─ v1/
│  │  ├─ logic/
│  │  ├─ model/
│  │  └─ service/
│  ├─ user/
│  │  ├─ controller/
│  │  │  └─ v1/
│  │  ├─ logic/
│  │  ├─ model/
│  │  └─ service/
│  ├─ open_platform/
│  │  ├─ controller/
│  │  │  └─ v1/
│  │  ├─ logic/
│  │  ├─ model/
│  │  └─ service/
│  └─ common/
│     ├─ controller/
│     ├─ middleware/
│     ├─ logic/
│     ├─ model/
│     └─ service/
```

## 5. 前端目录结构（ng-alain）

### 5.1 web/ 顶层结构

```text
web/
├─ src/
│  ├─ app/
│  │  ├─ core/              # 核心模块（守卫、拦截器、启动服务）
│  │  ├─ layout/            # 布局组件
│  │  ├─ routes/            # 路由配置
│  │  ├─ shared/            # 共享模块（组件、指令、管道）
│  │  └─ pages/             # 业务页面（按应用端拆分）
│  │     ├─ admin/          # 管理后台页面
│  │     └─ user/           # 用户端页面
│  ├─ assets/               # 静态资源
│  ├─ environments/         # 环境配置
│  └─ styles/               # 全局样式
├─ angular.json
├─ package.json
└─ tsconfig.json
```

### 5.2 页面模块内部分层

每个页面模块内部按 Angular 约定组织：

```text
pages/admin/
├─ dashboard/
│  ├─ dashboard.component.ts
│  ├─ dashboard.component.html
│  ├─ dashboard.component.less
│  └─ dashboard.component.spec.ts
└─ user-management/
   ├─ list/
   ├─ edit/
   └─ service/
```

## 6. 目录整理原则

- 后端顶层先区分 `http` 和 `common`，再区分应用类型，最后区分业务职责。
- 公共代码优先按作用范围归类：
  - 跨模块复用，放入 `app/common`
  - 仅在 HTTP 服务内部复用，放入 `app/http/common`
- 业务代码禁止堆积在 `app` 根目录下。
- 新增模块时，优先遵循本目录规范，避免出现新的扁平化目录结构。
- 控制器目录下统一使用 `v1` 版本子目录，便于后续 API 版本迭代。
- 前端页面按应用端（admin/user）拆分子目录，共享组件放入 `shared/`。
