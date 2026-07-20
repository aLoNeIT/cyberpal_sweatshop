# cyberpal_sweatshop

> Pi-Agent SaaS 平台 —— 后端（Hyperf）+ 前端 + 文档 + 部署配置的 Monorepo 工程。

## 仓库顶层结构

本仓库采用「按职责分区」的 Monorepo 布局：根目录只放跨端共享的配置与说明，业务代码按**后端 / 前端 / 文档 / 部署**四类分别归置到一级子目录。

| 目录 | 职责 | 说明 |
|------|------|------|
| `service/` | **后端** | Hyperf 3.1 工程（原根目录后端代码整体迁入）。含 `app/`、`config/`、`migrations/`、`composer.json` 等；`bin/hyperf.php` 用 `dirname(__DIR__)` 推导 `BASE_PATH`，故 PSR-4（`"App\\": "app/"`）相对 `service/` 自动生效，无需改 autoload。 |
| `web/` | **前端** | 前端工程（当前为 React + TypeScript + Vite）。自包含，含 `src/`、`vite.config.ts`；开发时通过 `/api`、`/chat` 代理到后端 `localhost:9502`。 |
| `document/` | **文档** | 正式项目文档目录（当前为占位，含 `.gitkeep`，待补充）。 |
| `deploy/` | **构建 / 部署** | 构建与部署配置统一收口：`Dockerfile`、`docker-compose.yml`、`deploy.test.yml`、`.gitlab-ci.yml`、`.github/ `、`.devcontainer/`；其内部构建上下文均指向 `service/`。 |

### 不纳入版本控制的目录（Git 忽略）

以下目录为本地工作区或已废弃内容，已在根 `.gitignore` 中忽略，不会进入版本控制：

- `docs/` —— 旧文档目录，已废弃（内容已迁移或不再跟踪）。
- `.tmp/` —— 本地临时草稿（PRD / 设计 / 调研），仅本地保留。
- `.workbuddy/` —— 助理内部工作记忆，本机文件。
- `WORKSPACE.md` —— 个人开发环境配置（PHP 路径、容器信息等）。

## 快速开始

### 后端（service/）

```bash
cd service
composer install
cp .env.example .env        # 按需修改
php bin/hyperf.php start    # 默认监听 9502
```

测试 / 静态分析：

```bash
cd service
composer test
composer analyse
```

### 前端（web/）

```bash
cd web
npm install
npm run dev
```

### 容器 / 部署

```bash
cd deploy
docker compose up -d        # 基于 service/ 构建后端镜像
```

或单独构建后端镜像：

```bash
docker build ./service -f deploy/Dockerfile -t cyberpal-backend
```

## 目录结构规范

完整的目录与结构约定（含 `service/app` 内部分层、`web/` 前端结构、目录整理原则、分支 / 编码 / 数据库等规范）见：

- [项目规范说明（AGENTS.md）](AGENTS.md)
- [目录结构规范（.agents/01-directory-structure.md）](.agents/01-directory-structure.md)

## 历史说明

本仓库历史上曾将后端文件直接置于根目录，并存在 `docs/`、`prd` 等临时文档混杂的情况。后经重构拆分为上述四区，并从 git 历史中移除了 `docs/` 与 `.tmp/` 的跟踪（保留本地文件），构建 / 部署配置统一收口至 `deploy/`。
