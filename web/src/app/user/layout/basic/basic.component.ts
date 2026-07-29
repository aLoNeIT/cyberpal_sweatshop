import { Component, OnInit, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { UserAuthService } from '../../services/user-auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

/**
 * 用户端主布局——左侧固定侧边栏 + 顶栏 + 内容区
 * 设计稿：document/ui/user/*.html
 */
@Component({
  standalone: false,
  selector: 'app-user-layout-basic',
  template: `
    <div class="app-layout" [attr.data-theme]="currentTheme">
      <!-- ===== 侧边栏 ===== -->
      <aside class="app-sidebar" [class.open]="sidebarOpen">
        <div class="sidebar-logo" routerLink="/user/dashboard">
          <div class="sidebar-logo-icon">C</div>
          <span class="sidebar-logo-text">CyberPal</span>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-group">
            <div class="nav-group-title">导航</div>
            <a *ngFor="let item of navItems" class="nav-item"
               [class.active]="isActive(item.path)"
               [routerLink]="item.path">
              <svg viewBox="0 0 24 24" [innerHTML]="item.icon"></svg>
              <span>{{ item.label }}</span>
              <span *ngIf="item.badge" class="badge">{{ item.badge }}</span>
            </a>
          </div>
          <div class="nav-group">
            <div class="nav-group-title">系统</div>
            <a *ngFor="let item of sysItems" class="nav-item"
               [class.active]="isActive(item.path)"
               [routerLink]="item.path">
              <svg viewBox="0 0 24 24" [innerHTML]="item.icon"></svg>
              <span>{{ item.label }}</span>
            </a>
          </div>
        </nav>
      </aside>

      <!-- ===== 主内容区 ===== -->
      <div class="app-main">
        <!-- 移动端侧边栏遮罩 -->
        <div class="sidebar-overlay" [class.show]="sidebarOpen" (click)="sidebarOpen = false"></div>

        <!-- ===== 顶栏 ===== -->
        <header class="app-topbar">
          <div class="topbar-left">
            <button class="menu-trigger" (click)="sidebarOpen = !sidebarOpen">
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div class="topbar-breadcrumb">
              <ng-container *ngFor="let b of breadcrumbs; let last = last">
                <span *ngIf="!last" style="margin:0 4px">/</span>
                <span [class.current]="last">{{ b }}</span>
              </ng-container>
            </div>
          </div>
          <div class="topbar-right">
            <div class="topbar-usage" *ngIf="usageInfo">
              <span>{{ usageInfo.label }}</span>
              <strong>{{ usageInfo.tokens }}</strong>
              <ng-container *ngIf="usageInfo.cost">
                <span style="margin:0 4px;color:var(--color-border)">|</span>
                <span>费用</span>
                <strong>{{ usageInfo.cost }}</strong>
              </ng-container>
            </div>
            <button class="theme-toggle" title="切换主题" (click)="toggleTheme()">
              <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.6" stroke-linecap="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </button>
            <div class="user-avatar" nz-dropdown [nzDropdownMenu]="userMenu" nzTrigger="click"
                 [title]="(authService.currentUser$ | async)?.display_name || '用户'">
              {{ userInitial }}
            </div>
            <nz-dropdown-menu #userMenu="nzDropdownMenu">
              <ul nz-menu>
                <li nz-menu-item routerLink="/user/settings">
                  <span nz-icon nzType="setting"></span> 设置
                </li>
                <li nz-menu-divider></li>
                <li nz-menu-item (click)="logout()">
                  <span nz-icon nzType="logout"></span> 退出登录
                </li>
              </ul>
            </nz-dropdown-menu>
          </div>
        </header>

        <!-- ===== 内容区 ===== -->
        <main class="app-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Design Tokens ===== */
    :host {
      --cp-primary: #1677ff;
      --cp-primary-hover: #4096ff;
      --cp-primary-active: #0958d9;
      --cp-primary-subtle: #e6f4ff;
      --cp-secondary: #8B5CF6;
      --cp-success: #16A34A;
      --cp-success-bg: rgba(22,163,74,.12);
      --cp-warning: #D97706;
      --cp-warning-bg: rgba(217,119,6,.12);
      --cp-danger: #DC2626;
      --cp-danger-bg: rgba(220,38,38,.12);
      --cp-info: #1677ff;
      --cp-info-bg: rgba(22,119,255,.12);
      --cp-bg: #f5f5f5;
      --cp-surface: #FFFFFF;
      --cp-surface-2: #fafafa;
      --cp-border: #f0f0f0;
      --cp-text: #111827;
      --cp-text-secondary: #6b7280;
      --cp-text-tertiary: #9ca3af;
      --cp-radius-sm: 4px;
      --cp-radius-md: 8px;
      --cp-radius-lg: 12px;
      --cp-radius-pill: 999px;
      --cp-shadow-sm: 0 1px 2px rgba(0,0,0,.06);
      --cp-shadow-md: 0 4px 6px rgba(0,0,0,.08);
      --cp-shadow-lg: 0 12px 28px rgba(0,0,0,.12);
      --cp-font-ui: 'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
      --cp-font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      --cp-sidebar-width: 220px;
      --cp-topbar-height: 56px;
      --cp-transition-fast: 150ms ease;
      --cp-transition-normal: 300ms ease;
      font-family: var(--cp-font-ui);
    }

    /* Dark theme */
    :host-context([data-theme="dark"]), [data-theme="dark"] {
      --cp-primary-subtle: #111d2c;
      --cp-bg: #000000;
      --cp-surface: #141414;
      --cp-surface-2: #1f1f1f;
      --cp-border: #303030;
      --cp-text: #e5e7eb;
      --cp-text-secondary: #9ca3af;
      --cp-text-tertiary: #6b7280;
      --cp-shadow-sm: 0 1px 2px rgba(0,0,0,.3);
      --cp-shadow-md: 0 4px 6px rgba(0,0,0,.4);
      --cp-shadow-lg: 0 12px 28px rgba(0,0,0,.5);
    }

    /* ===== Reset ===== */
    :host *, :host *::before, :host *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ===== Layout ===== */
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: var(--cp-bg);
      color: var(--cp-text);
      font-size: 14px;
      line-height: 1.6;
    }

    /* ===== Sidebar ===== */
    .app-sidebar {
      width: var(--cp-sidebar-width);
      background: var(--cp-surface);
      border-right: 1px solid var(--cp-border);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      z-index: 100;
      transition: transform var(--cp-transition-normal);
    }

    .sidebar-logo {
      height: 64px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 24px;
      border-bottom: 1px solid var(--cp-border);
      flex-shrink: 0;
      cursor: pointer;
    }

    .sidebar-logo-icon {
      width: 32px; height: 32px;
      background: var(--cp-primary);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
    }

    .sidebar-logo-text {
      font-size: 18px;
      font-weight: 700;
      color: var(--cp-text);
      white-space: nowrap;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 12px 0;
    }

    .nav-group {
      padding: 0 12px;
    }

    .nav-group + .nav-group {
      margin-top: 4px;
      padding-top: 12px;
      border-top: 1px solid var(--cp-border);
    }

    .nav-group-title {
      font-size: 12px;
      color: var(--cp-text-tertiary);
      font-weight: 500;
      padding: 8px 12px;
      height: 40px;
      display: flex;
      align-items: flex-end;
      cursor: default;
      user-select: none;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 40px;
      padding: 0 12px;
      border-radius: var(--cp-radius-md);
      color: var(--cp-text);
      font-size: 14px;
      cursor: pointer;
      transition: all var(--cp-transition-fast);
      user-select: none;
      margin-bottom: 2px;
      text-decoration: none;
    }

    .nav-item:hover {
      color: var(--cp-primary);
      background: transparent;
    }

    .nav-item.active {
      color: var(--cp-primary);
      background: var(--cp-primary-subtle);
      font-weight: 500;
    }

    .nav-item svg {
      width: 16px; height: 16px;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.6;
      flex-shrink: 0;
    }

    .nav-item.active svg { stroke-width: 2; }

    .nav-item .badge {
      margin-left: auto;
      font-size: 11px;
      background: var(--cp-danger);
      color: #fff;
      padding: 1px 6px;
      border-radius: var(--cp-radius-pill);
      font-weight: 500;
    }

    /* ===== Main Content ===== */
    .app-main {
      flex: 1;
      margin-left: var(--cp-sidebar-width);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      min-width: 0;
    }

    /* ===== Topbar ===== */
    .app-topbar {
      height: var(--cp-topbar-height);
      background: var(--cp-surface);
      border-bottom: 1px solid var(--cp-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .topbar-breadcrumb {
      font-size: 14px;
      color: var(--cp-text-secondary);
    }

    .topbar-breadcrumb .current {
      color: var(--cp-text);
      font-weight: 500;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .topbar-usage {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--cp-text-secondary);
      background: var(--cp-surface-2);
      padding: 6px 12px;
      border-radius: var(--cp-radius-md);
    }

    .topbar-usage strong {
      color: var(--cp-text);
      font-family: var(--cp-font-mono);
    }

    .theme-toggle {
      width: 36px; height: 36px;
      border: 1px solid var(--cp-border);
      border-radius: var(--cp-radius-md);
      background: var(--cp-surface);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--cp-text-secondary);
      transition: all var(--cp-transition-fast);
    }

    .theme-toggle:hover {
      border-color: var(--cp-primary);
      color: var(--cp-primary);
    }

    .user-avatar {
      width: 36px; height: 36px;
      border-radius: var(--cp-radius-pill);
      background: var(--cp-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
    }

    /* Menu trigger (mobile) */
    .menu-trigger {
      display: none;
      width: 36px; height: 36px;
      border: 1px solid var(--cp-border);
      border-radius: var(--cp-radius-md);
      background: var(--cp-surface);
      cursor: pointer;
      align-items: center;
      justify-content: center;
      color: var(--cp-text-secondary);
      transition: all var(--cp-transition-fast);
    }

    .menu-trigger:hover {
      border-color: var(--cp-primary);
      color: var(--cp-primary);
    }

    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.45);
      z-index: 99;
    }

    /* ===== Content Area ===== */
    .app-content {
      flex: 1;
      padding: 24px;
    }

    /* ===== Scrollbar ===== */
    .sidebar-nav::-webkit-scrollbar { width: 6px; }
    .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: var(--cp-border); border-radius: 3px; }
    .sidebar-nav::-webkit-scrollbar-thumb:hover { background: var(--cp-text-tertiary); }

    /* ===== Responsive ===== */
    @media (max-width: 1279px) {
      .app-sidebar {
        transform: translateX(-100%);
      }
      .app-sidebar.open {
        transform: translateX(0);
      }
      .app-main {
        margin-left: 0;
      }
      .menu-trigger {
        display: flex;
      }
      .sidebar-overlay.show {
        display: block;
      }
    }
  `]
})
export class UserLayoutBasicComponent implements OnInit {
  sidebarOpen = false;
  currentTheme = 'light';
  userInitial = 'U';
  breadcrumbs: string[] = [];

  usageInfo: { label: string; tokens: string; cost: string } | null = {
    label: '本月用量', tokens: '128.5K', cost: '$12.85'
  };

  navItems = [
    { path: '/user/dashboard', label: '控制台', icon: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>' },
    { path: '/user/agents', label: 'Agent', icon: '<circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>' },
    { path: '/user/chat', label: '对话', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
    { path: '/user/sessions', label: '会话', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', badge: '5' }
  ];

  sysItems = [
    { path: '/user/billing', label: '消费', icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
    { path: '/user/team', label: '团队', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
    { path: '/user/settings', label: '设置', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' }
  ];

  // 路由到面包屑映射
  private breadcrumbMap: Record<string, string> = {
    '/user/dashboard': '控制台',
    '/user/agents': 'Agent 管理',
    '/user/chat': '对话',
    '/user/sessions': '会话历史',
    '/user/billing': '消费明细',
    '/user/team': '团队协作',
    '/user/settings': '设置'
  };

  constructor(
    public authService: UserAuthService,
    private router: Router,
    private msg: NzMessageService,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // 主题初始化
      const saved = localStorage.getItem('cp_theme') || 'light';
      this.currentTheme = saved;
      document.documentElement.setAttribute('data-theme', this.currentTheme);

      // 用户初始
      this.authService.currentUser$.subscribe(user => {
        if (user?.display_name) {
          this.userInitial = user.display_name.charAt(0);
        }
      });
    }

    // 面包屑更新
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateBreadcrumb();
    });

    this.updateBreadcrumb();
  }

  isActive(path: string): boolean {
    if (path === '/user/chat') {
      return this.router.url.startsWith('/user/chat');
    }
    return this.router.url === path;
  }

  private updateBreadcrumb(): void {
    const label = this.breadcrumbMap[this.router.url] || '';
    this.breadcrumbs = label ? [label] : [];
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cp_theme', this.currentTheme);
      document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.msg.success('已退出登录');
        this.router.navigate(['/user/login']);
      },
      error: () => {
        this.authService.forceLogout();
        this.router.navigate(['/user/login']);
      }
    });
  }
}
