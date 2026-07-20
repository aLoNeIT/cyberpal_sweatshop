# 目录结构规范

本文档用于统一当前项目的目录层级、公共代码归类方式和目录整理原则。

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
