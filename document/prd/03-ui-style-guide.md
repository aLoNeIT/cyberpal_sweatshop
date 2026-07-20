# Pi-Agent SaaS 平台 · UI 风格设计规范

> 版本：v3.1 | 日期：2026-07-20
> **选定设计系统：Ant Design**
> 来源：`awesome-design-skills-main/skills/ant/`（DESIGN.md + SKILL.md）
> 设计基调：结构化、企业级、数据密集型 B 端 SaaS
> 参考 demo：`.tmp/ui-demo-ant.html`

---

## 0. 设计系统声明

### 品牌定位

Ant Design 是一个结构化、企业级的设计系统，强调**清晰性、一致性、高效性**，专为数据密集型 Web 应用打造。

### 设计意图

> *"Structured, enterprise-focused design system emphasizing clarity, consistency, and efficiency for data-dense web applications."*

### 写作语调

- 简洁（concise）
- 自信（confident）
- 有帮助（helpful）
- 清晰（clear）
- 友好（friendly）
- 专业（professional）
- 行动导向（action-oriented）
- 少行话（low-jargon）

---

## 1. 基础 Token（Source of Truth）

以下令牌来自 `ant/DESIGN.md` 的 YAML frontmatter，为设计系统的唯一数据源。

### 1.1 色彩调色板

```yaml
colors:
  primary:    "#1677ff"    # 主色——品牌、主操作、选中态
  secondary:  "#8B5CF6"    # 辅色——次要强调
  success:    "#16A34A"    # 成功、在线、已完成
  warning:    "#D97706"    # 警告、待处理、接近阈值
  danger:     "#DC2626"    # 错误、失败、删除、不可逆操作
  surface:    "#FFFFFF"    # 表面色——卡片、弹窗、侧边栏
  text:       "#111827"    # 主文本色
  neutral:    "#FFFFFF"    # 中性表面（与 surface 一致）
```

### 1.2 扩展色板（派生 Token）

| Token | Light | Dark | 用途 |
| --- | --- | --- | --- |
| `--color-primary-hover` | `#4096ff` | `#4096ff` | 主色 hover |
| `--color-primary-active` | `#0958d9` | `#0958d9` | 主色按下 |
| `--color-primary-subtle` | `#e6f4ff` | `#111d2c` | 主色浅底（选中背景/标签） |
| `--color-bg` | `#f5f5f5` | `#000000` | 页面底色 |
| `--color-surface-2` | `#fafafa` | `#1f1f1f` | 次级表面（输入框底/表头/分区） |
| `--color-border` | `#f0f0f0` | `#303030` | 分隔线/边框 |
| `--color-text-secondary` | `#6b7280` | `#9ca3af` | 次文本、标签文字 |
| `--color-text-tertiary` | `#9ca3af` | `#6b7280` | 占位、分组标题、极弱信息 |
| `--color-success-bg` | `rgba(22,163,74,.12)` | — | 成功状态底 |
| `--color-warn-bg` | `rgba(217,119,6,.12)` | — | 警告状态底 |
| `--color-danger-bg` | `rgba(220,38,38,.12)` | — | 危险状态底 |
| `--color-info-bg` | `rgba(22,119,255,.12)` | — | 信息状态底 |

### 1.3 排版

```yaml
typography:
  h1:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 2rem
  body-md:
    fontFamily: "Plus Jakarta Sans"
    fontSize: 1rem
  label-caps:
    fontFamily: "JetBrains Mono"
    fontSize: 0.75rem
  sourceScale: "12/14/16/20/24/32"
  weights: "100, 200, 300, 400, 500, 600, 700, 800, 900"
```

**字体映射：**

| 角色 | 字体族 | 用途 |
|------|--------|------|
| 主字体 | `Plus Jakarta Sans`（标题 + 正文） | 全局 UI |
| 等宽字体 | `JetBrains Mono` | 标签/代码/ID/数字列 |
| 回退栈 | `Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif` | 跨平台 |

**字号阶梯：** `12 / 13 / 14 / 16 / 20 / 24 / 32`
**字重：** `100–900` 全范围可用，正文 400，标签按钮 500，标题 600-700

### 1.4 圆角

```yaml
rounded:
  sm: 4px    # 标签、小控件
  md: 8px    # 按钮、输入框、菜单项
```

扩展：`lg: 12px`（卡片/弹窗）、`pill: 999px`（胶囊/头像/徽章）

### 1.5 间距

```yaml
spacing:
  sm: 4px
  md: 8px
  sourceScale: "4/8/12/16/24/32"
```

4px 基准栅格，8px 对齐为主。

### 1.6 阴影

| Token | Light | Dark |
| --- | --- | --- |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,.06)` | `0 1px 2px rgba(0,0,0,.3)` |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,.08)` | `0 4px 6px rgba(0,0,0,.4)` |
| `--shadow-lg` | `0 12px 28px rgba(0,0,0,.12)` | `0 12px 28px rgba(0,0,0,.5)` |

---

## 2. 完整 CSS 变量表

```css
/* ===== Light（默认） ===== */
:root {
  --color-primary: #1677ff;
  --color-primary-hover: #4096ff;
  --color-primary-active: #0958d9;
  --color-primary-subtle: #e6f4ff;
  --color-secondary: #8B5CF6;
  --color-success: #16A34A;
  --color-success-bg: rgba(22,163,74,.12);
  --color-warning: #D97706;
  --color-warning-bg: rgba(217,119,6,.12);
  --color-danger: #DC2626;
  --color-danger-bg: rgba(220,38,38,.12);
  --color-info: #1677ff;
  --color-bg: #f5f5f5;
  --color-surface: #FFFFFF;
  --color-surface-2: #fafafa;
  --color-border: #f0f0f0;
  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 999px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.06);
  --shadow-md: 0 4px 6px rgba(0,0,0,.08);
  --shadow-lg: 0 12px 28px rgba(0,0,0,.12);
  --font-ui: 'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
}

/* ===== Dark ===== */
[data-theme="dark"] {
  --color-primary-subtle: #111d2c;
  --color-bg: #000000;
  --color-surface: #141414;
  --color-surface-2: #1f1f1f;
  --color-border: #303030;
  --color-text: #e5e7eb;
  --color-text-secondary: #9ca3af;
  --color-text-tertiary: #6b7280;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,.4);
  --shadow-lg: 0 12px 28px rgba(0,0,0,.5);
}
```

> 切换机制：`<html data-theme="dark">`，localStorage 持久化，默认跟随 `prefers-color-scheme`。

---

## 3. 设计规则（Rules）

### 3.1 DO（必须遵守）

| 规则 | 说明 |
|------|------|
| 优先使用语义 Token | 禁止硬编码色值，所有颜色通过 CSS 变量引用 |
| 保持视觉层次 | 标题/正文/辅助文字字号比例清晰 |
| 交互状态必须显式 | hover / focus-visible / active / disabled / loading / error 六态齐全 |
| 设计空态/加载态/错误态 | 每个页面/组件必须覆盖四态 |
| 默认响应式 | 所有组件从 mobile 向 desktop 设计 |
| 记录无障碍原因 | 关键无障碍决策需在代码审查中附理由 |

### 3.2 DON'T（禁止）

| 规则 | 说明 |
|------|------|
| 低对比度文字 | 正文 ≥ 4.5:1（WCAG AA） |
| 不一致的间距节奏 | 统一使用 4px 倍数的 spacing scale |
| 无目的的动效 | 过渡 150-200ms，尊重 `prefers-reduced-motion` |
| 模糊的标签 | 按钮/表单标签必须动作化、无歧义 |
| 混合多种视觉隐喻 | 同一界面不使用两种以上装饰风格 |
| 不可及的点击区域 | 触控目标 ≥ 40px |

---

## 4. 侧边栏导航规范

### 4.1 结构

```
┌──────────────┐
│  [C] CyberPal│  ← Logo 区（64px 高，32×32 圆角方块 + 项目名）
├──────────────┤
│ 导航          │  ← 分组标题（12px --color-text-tertiary，不可点击）
│  📊 控制台    │  ← 菜单项（40px 高，16×16 图标 + 14px 文字）
│  🤖 Agent    │
│  💬 会话      │
│  💰 消费      │
├──────────────┤  ← 分组间 1px solid 分隔线
│ 系统          │
│  👥 用户管理  │  ← 选中态：primary 文字 + primary-subtle 背景
│  ⚙️ 系统设置  │
└──────────────┘
```

### 4.2 菜单项状态

| 状态 | 背景 | 文字色 | 图标 |
|------|------|--------|------|
| 默认 | `transparent` | `--color-text` | 描边 1.6px，`currentColor` |
| hover | `transparent` | `--color-primary` | `currentColor` |
| 选中 | `--color-primary-subtle` | `--color-primary` | 描边 2px，`currentColor` |
| 禁用 | `transparent` | `--color-text-tertiary` | `pointer-events: none` |

- 菜单项高度：40px
- 图标：16×16 SVG，Ant Design outline 风格，通过 `stroke: currentColor` 继承
- 字体：14px / 400 default，选中 500

### 4.3 分组标题

- 12px，`--color-text-tertiary`
- 高度 40px，文字底部对齐
- 不可点击、不可选中（`cursor: default; user-select: none`）
- 第二个及之后的分组顶部加 `1px solid --color-border`

### 4.4 Logo

| 属性 | 值 |
|------|-----|
| 容器 | 64px 高，`padding: 0 24px`，底部边框 |
| 图标 | 32×32，`border-radius: 6px`，`--color-primary` 底，白色字母 |
| 文字 | 18px / 700，紧随图标右侧 |

---

## 5. 组件规范

每个组件必须覆盖六态：default、hover、focus-visible、active、disabled、loading（如适用）。

### 5.1 按钮

| 变体 | 默认 | hover | 场景 |
| --- | --- | --- | --- |
| primary | `bg: #1677ff` `color: #fff` | `bg: #4096ff` | 主操作（保存、发送、创建） |
| secondary | `bg: #fff` `border: #f0f0f0` | `border/color: #1677ff` | 次操作（取消、返回） |
| ghost | `bg: transparent` `color: #6b7280` | `bg: #e6f4ff` `color: #1677ff` | 轻操作（重置、更多） |
| danger | `color: #DC2626` `border: #f0f0f0` | `bg: rgba(220,38,38,.12)` | 不可逆操作（删除、注销） |

**尺寸：** h=36px，`padding: 0 16px`，`border-radius: 8px`，`font-weight: 500`

**Loading 态：** 左侧 spinner（`#1677ff`），文字保留，禁用点击
**Disabled 态：** 降低透明度，`cursor: not-allowed`

### 5.2 表单输入（Input / Select / Textarea）

| 属性 | 值 |
|------|-----|
| 高度 | 36px |
| 圆角 | 8px |
| 默认边框 | `1px solid #f0f0f0` |
| focus | 边框 `#1677ff` + `0 0 0 2px rgba(22,119,255,.15)` |
| 标签 | 13px / 500 / `#6b7280`，居输入框上方 6px |
| 占位 | `#9ca3af` |
| 错误态 | 边框 `#DC2626` + 下方 12px danger 文字说明 |
| 必填标记 | 红色 `*` |
| Textarea | `min-height: 120px`，等宽可选 |

### 5.3 数据表格

| 元素 | 样式 |
|------|------|
| 表头 | 13px / 500 / `#6b7280`，底 `#fafafa`，`padding: 12px 16px` |
| 单元格 | 14px / 400，`padding: 14px 16px`，底边框 `1px solid #f0f0f0` |
| 行 hover | `rgba(22,119,255,.04)` |
| ID 列 | `--font-mono`，`#9ca3af` |
| 时间列 | `--font-mono`，次文本色 |
| 操作列 | 右对齐，ghost 链接按钮（13px） |
| 复选框 | `accent-color: #1677ff` |

### 5.4 标签/状态徽章

| 属性 | 值 |
|------|-----|
| 圆角 | `999px` |
| 内边距 | `2px 10px` |
| 字号 | 12px / 500 |
| 管理员 | `rgba(22,163,74,.12)` 底 + `#16A34A` 文字 |
| 普通用户 | `#fafafa` 底 + `#6b7280` 文字 |
| 状态点 | 7px 圆点，`#16A34A`（在线）/ `#9ca3af`（离线） |

### 5.5 分页器

| 属性 | 值 |
|------|-----|
| 容器 | `padding: 16px 0 0`，左右分布 |
| 页码按钮 | 32×32，圆角 8px，边框 `#f0f0f0` |
| 当前页 | `bg: #1677ff` `color: #fff` |
| 禁用 | `color: #9ca3af`，`pointer-events: none` |

### 5.6 弹窗（Modal）

| 属性 | 值 |
|------|-----|
| 遮罩 | `rgba(0,0,0,.45)` |
| 浮层 | `bg: #fff`，圆角 12px，`box-shadow: 0 12px 28px rgba(0,0,0,.12)`，max-w 520px |
| 头部 | 16px / 600 标题 + 关闭 ×，底部分隔线 |
| 底部 | 右对齐按钮组，`gap: 8px`，顶部分隔线 |

### 5.7 抽屉（Drawer）

- 右侧滑入，宽 360-480px
- 遮罩 + `shadow-lg` + 圆角 12px
- 头部标题 + 关闭，底部按钮右对齐

### 5.8 聊天气泡

| 角色 | 对齐 | 背景 | 文字 | 圆角 | max-w |
|------|------|------|------|------|-------|
| user | 右 | `#1677ff` | `#fff` | 12px（右下 4px） | 72% |
| assistant | 左 | `#fff` + 边框 | `#111827` | 12px（左下 4px） | 72% |

- 代码块：`--font-mono`，`#fafafa` 底，可选复制按钮
- 头像：user 首字母圆，assistant 品牌图标

### 5.9 Thinking / Tool 折叠块

| 组件 | 标题 | 展开内容 |
|------|------|----------|
| Thinking | 💡 思考过程 + 展开箭头（默认折叠） | `#fafafa` 底，13px，`--font-mono`，次文本色 |
| Tool | 🔧 `<tool_name>` + 状态徽章 + 展开箭头 | 参数（JSON）+ 结果，可截断 + "展开全部" |

**Tool 状态徽章：**
- 执行中：info 旋转
- 成功：success
- 失败：danger

### 5.10 流式光标动画

- 文本末尾 `▍`，`#1677ff`，blink（1s steps, opacity 0↔1）
- 思考中：`•••` 脉冲动画
- 进行中：顶栏/会话项 info 旋转指示

### 5.11 二次确认弹窗

- 触发：手动归档 → Modal 确认
- 标题"确认归档"
- 内容提示不可恢复，仅可只读查看
- 确认按钮使用 danger 风格

### 5.12 存储上限 UI

| 场景 | 行为 |
|------|------|
| 活跃满 100 | 新建/分叉按钮置灰，hover 提示"已达上限，请归档或删除旧会话" |
| 归档满 50 | 归档按钮置灰，hover 提示"归档区已满，请先清理" |

---

## 6. 页面布局

### 6.1 全局布局

```
+--------+----------------------------------+
| 侧边栏  | 顶栏（面包屑 / 计费概览常驻 / 头像） |
| 220px  +----------------------------------+
|        |                                    |
|        |         内容区（24px padding）      |
|        |                                    |
+--------+----------------------------------+
```

### 6.2 关键页面

| 页面 | 布局 |
|------|------|
| 登录/注册 | 居中卡片，仅邮箱+密码，无第三方登录 |
| 控制台首页 | 指标卡网格 + 最近会话列表 |
| Agent 列表 | 表格 CRUD + 状态点 |
| Agent 配置 | 左表单（基础/模型/工具） + 右面板（skill 库/mcp 注入预览） |
| 聊天页 | 左侧会话列表 + 主区消息流 + 底部输入框（多行，Enter 发送） |
| 会话历史 | 筛选工具栏 + 表格（时间/Agent/消息数/token/归档状态）+ 操作列 |
| 消费明细 | 汇总卡片 + 明细表格 + 周期选择 + 余额/充值占位区（置灰） |
| 设置页 | 资料/主题/归档偏好/密码修改占位/邮箱修改占位/注销占位/用量预警占位 |
| 团队页 | 成员列表骨架（功能不实现） |

### 6.3 四态通用规则

| 状态 | 表现 |
|------|------|
| 空态 | 引导卡/插画 + 操作按钮 |
| 加载态 | 骨架屏 shimmer |
| 错误态 | danger 文案 + 重试按钮 |
| 流式进行中态 | ▍ 光标 + info 旋转指示 |

---

## 7. 响应式断点

| 断点 | 宽度 | 策略 |
| --- | --- | --- |
| Desktop | ≥1280px | 侧边栏 220px + 顶栏 + 内容区；聊天三栏 |
| Tablet | 768-1279px | 侧边栏折叠为图标栏；聊天页列表收为抽屉 |
| Mobile | <768px | 侧边栏和列表均收为抽屉；触控目标 ≥40px |

---

## 8. 无障碍（Accessibility）

### 8.1 标准
- **WCAG 2.2 AA** 合规
- 键盘优先交互
- 焦点状态必须可见

### 8.2 具体验收标准

| 检查项 | 标准 | 验证方式 |
|--------|------|----------|
| 正文对比度 | ≥ 4.5:1 | 自动检查工具 |
| 焦点可见 | focus 时 2px `#1677ff` 轮廓 | 键盘 Tab 遍历 |
| 触控目标 | ≥ 40px（mobile 44px） | 手动测量 |
| 动效 | 过渡 150-200ms ease；`prefers-reduced-motion` 时关闭非必要动画 | CSS 媒体查询 |
| 标签 | 所有表单/按钮标签可被屏幕阅读器读取 | `aria-label` / `aria-labelledby` |

### 8.3 质量门禁

1. 禁止仅用模糊形容词定义规则——每条规则必须绑定到 Token、阈值或具体示例
2. 每条无障碍声明必须在实现中可测试
3. 系统一致性优先于局部优化
4. 美学与无障碍冲突时，**无障碍优先**

---

## 9. 反模式（Anti-patterns）

| 反模式 | 替代方案 |
|--------|----------|
| 低对比度灰色文字 | 使用 `--color-text-secondary`（#6b7280），不低于此灰度 |
| 不一致的间距 | 统一走 4/8/12/16/24/32 spacing scale |
| 无目的动效（弹跳、旋转装饰） | 过渡 150-200ms ease；生产环境禁用 `prefers-reduced-motion` |
| 模糊按钮标签（"确定"、"提交"） | 使用动作化标签（"保存配置"、"发送消息"） |
| 混用多种视觉隐喻 | 蓝色主色 + 灰色中性 + 语义四色，不再引入装饰色 |
| 触控目标 < 40px | 按钮最小 32px，优选 36-40px |

---

## 10. QA 检查清单

代码审查时逐项核对：

- [ ] 所有色值通过 CSS 变量引用，无硬编码
- [ ] 六态覆盖（default/hover/focus-visible/active/disabled/loading）
- [ ] 四态覆盖（空态/加载态/错误态/正常态）
- [ ] 响应式：Desktop / Tablet / Mobile 三段布局均可用
- [ ] 键盘 Tab 顺序正确，焦点可见
- [ ] 对比度 ≥ 4.5:1（正文） / 3:1（大标题）
- [ ] 触控目标 ≥ 40px
- [ ] 间距遵循 4px 基准栅格
- [ ] 字体未混用（UI 字体 `Plus Jakarta Sans`，等宽 `JetBrains Mono`）
- [ ] 动效尊重 `prefers-reduced-motion`

---

> **Source of Truth：** `awesome-design-skills-main/skills/ant/DESIGN.md` + `SKILL.md`（typeui.sh / MIT License）
> **参考 demo：** `.tmp/ui-demo-ant.html`
> **ng-alain 映射：** 以上令牌通过 Angular `@delon/theme` + NG-ZORRO `theme.token` 直接映射，一字不改。
