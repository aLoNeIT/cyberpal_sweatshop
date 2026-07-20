# ng-alain 前端开发规范

本文档用于统一 Angular + ng-alain 前端项目的目录结构、组件开发、服务调用、路由配置和样式约定。

## 1. 技术栈

- **框架**: Angular (与 ng-alain 版本匹配)
- **UI 组件库**: ng-alain（基于 NG-ZORRO / Ant Design of Angular）
- **语言**: TypeScript
- **样式**: Less
- **状态管理**: ng-alain 内置 `@delon/theme` 或 `@ngrx`
- **HTTP 客户端**: `@delon/auth` + Angular `HttpClient`

## 2. 目录结构

```text
web/
├─ src/
│  ├─ app/
│  │  ├─ core/                  # 核心模块
│  │  │  ├─ i18n/              # 国际化
│  │  │  ├─ net/               # 默认拦截器
│  │  │  ├─ startup/           # 启动服务
│  │  │  └─ core.module.ts
│  │  ├─ layout/                # 布局组件
│  │  │  ├─ basic/             # 基础布局
│  │  │  ├─ blank/             # 空白布局
│  │  │  └─ passport/          # 登录注册布局
│  │  ├─ routes/                # 路由配置
│  │  │  ├─ routes.ts          # 主路由
│  │  │  ├─ admin/             # 管理后台路由
│  │  │  └─ user/              # 用户端路由
│  │  ├─ shared/                # 共享模块
│  │  │  ├─ components/        # 共享组件
│  │  │  ├─ directives/        # 共享指令
│  │  │  ├─ pipes/             # 共享管道
│  │  │  └─ shared.module.ts
│  │  └─ pages/                 # 业务页面
│  │     ├─ admin/              # 管理后台页面
│  │     │  └─ system/
│  │     │     └─ user/         # 用户管理模块
│  │     └─ user/               # 用户端页面
│  │        └─ dashboard/
│  ├─ assets/                   # 静态资源
│  ├─ environments/             # 环境配置
│  └─ styles/                   # 全局样式
│     ├─ theme.less             # 主题变量
│     └─ index.less             # 全局入口
├─ angular.json
├─ package.json
└─ tsconfig.json
```

## 3. 组件开发约定

### 3.1 组件命名

- 组件文件使用 kebab-case 命名：`user-list.component.ts`
- 组件类名使用 PascalCase：`UserListComponent`
- 组件选择器使用 kebab-case 并带项目前缀：`app-user-list`

### 3.2 组件结构

每个组件应包含以下文件：

```text
user-list/
├─ user-list.component.ts       # 组件逻辑
├─ user-list.component.html     # 组件模板
├─ user-list.component.less     # 组件样式
└─ user-list.component.spec.ts  # 单元测试
```

### 3.3 组件职责

- 页面组件（`pages/`）负责页面级别的数据流和交互。
- 共享组件（`shared/components/`）只负责 UI 呈现，通过 `@Input()` 接收数据，通过 `@Output()` 发射事件。
- 禁止在组件中直接调用 HTTP API；数据获取统一通过 Service 层。

## 4. 服务层约定

### 4.1 Service 命名与位置

- 与后端 API 交互的 Service 放在对应模块目录下：`pages/admin/system/user/user.service.ts`
- Service 类名使用 PascalCase + `Service` 后缀：`UserService`
- Service 使用 `@Injectable({ providedIn: 'root' })` 声明

### 4.2 API 调用规范

- 所有 HTTP 请求通过 Angular `HttpClient` 发起。
- 接口地址统一使用环境变量中的 API 前缀，不硬编码。
- 请求参数和响应体使用 TypeScript interface 定义类型。

```typescript
// user.interface.ts
export interface UserListRequest {
  page: number;
  page_size: number;
  keyword?: string;
}

export interface UserListResponse {
  state: number;
  msg: string;
  data: {
    list: User[];
    count: number;
    curr: number;
  };
}

// user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getList(params: UserListRequest): Observable<UserListResponse> {
    return this.http.post<UserListResponse>('/admin/v1/user/index', params);
  }
}
```

### 4.3 与后端交互约定

- 后端统一返回结构 `{ state, msg, data }`。
- `state === 0` 表示成功，`state !== 0` 表示失败。
- 列表接口的 `data` 包含 `{ list, count, curr }` 分页字段。
- 新增/更新接口返回 `{ id: number }` 在 `data` 中。
- 拦截器统一处理 `state !== 0` 的错误提示和未登录跳转。

## 5. 路由约定

- 路由配置集中在 `app/routes/` 目录。
- 按应用端拆分子路由文件：`routes/admin/admin-routing.module.ts`。
- 路由路径使用 kebab-case，不使用下划线。
- 需要登录态的路由使用 `@delon/auth` 的 AuthGuard 守卫。

```typescript
// routes/admin/admin-routing.module.ts
const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'system/user', component: UserListComponent },
    ],
  },
];
```

## 6. 样式约定

### 6.1 技术选型

- 默认使用 Less 预处理器。
- 全局主题变量定义在 `styles/theme.less` 中。
- 组件样式放在对应的 `.component.less` 文件中，使用 `encapsulation: ViewEncapsulation.None` 时需谨慎评估全局影响。

### 6.2 样式规则

- 优先使用 ng-alain 内置的原子样式类和布局组件。
- 自定义样式使用 BEM 命名或组件级 scoped 样式。
- 避免在全局样式中误伤其他组件。
- 颜色、字号、间距等设计 Token 必须从 ng-alain 主题变量派生，不硬编码具体值。

```less
// 推荐
.my-component {
  color: @text-color;
  background: @component-background;
  border-radius: @border-radius-base;
}

// 不推荐
.my-component {
  color: #333; /* 硬编码颜色 */
}
```

### 6.3 响应式

- 管理后台优先适配 1366px+ 桌面端，不强制移动端适配。
- 用户端按业务需求决定是否做响应式。

## 7. TypeScript 规范

- 所有 API 参数和返回体必须定义 interface 或 type。
- 组件方法参数和返回值必须有类型标注。
- 禁止使用 `any`，特殊情况下需添加注释说明原因。
- 禁止在模板中使用复杂逻辑，复杂表达式抽取为组件方法或管道。

```typescript
// 推荐
onSearch(keyword: string): void {
  this.userService.getList({ page: 1, page_size: 20, keyword })
    .subscribe(res => this.handleResult(res));
}

// 不推荐
onSearch(keyword): void {
  // 缺少类型标注
}
```

## 8. 代理与跨域

- 开发环境通过 `proxy.conf.json` 或 Vite/Angular CLI 代理转发 API 请求。
- 代理规则统一指向后端 `localhost:9502`。
- 生产环境下通过 Nginx 反向代理统一处理。
