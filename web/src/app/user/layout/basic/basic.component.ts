import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserAuthService } from '../../services/user-auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * 用户端主布局（含顶部导航栏）
 */
@Component({
  standalone: false,
  selector: 'app-user-layout-basic',
  template: `
    <nz-layout class="user-layout">
      <nz-header class="user-header">
        <div class="user-header-left">
          <a routerLink="/user/dashboard" class="user-logo">
            <img src="assets/img/kd-brand-logo.png" alt="CyberPal" height="36" />
            <span class="user-logo-text">CyberPal</span>
          </a>
          <ul nz-menu nzMode="horizontal" nzTheme="dark" class="user-nav">
            <li nz-menu-item routerLink="/user/dashboard" nzMatchRouter>
              <span nz-icon nzType="dashboard"></span> 仪表盘
            </li>
            <li nz-menu-item routerLink="/user/agents" nzMatchRouter>
              <span nz-icon nzType="robot"></span> Agent
            </li>
            <li nz-menu-item routerLink="/user/sessions" nzMatchRouter>
              <span nz-icon nzType="history"></span> 会话
            </li>
            <li nz-menu-item routerLink="/user/billing" nzMatchRouter>
              <span nz-icon nzType="dollar-circle"></span> 计费
            </li>
          </ul>
        </div>
        <div class="user-header-right">
          <a nz-dropdown [nzDropdownMenu]="userMenu" nzTrigger="click" class="user-avatar-link">
            <nz-avatar [nzText]="(authService.currentUser$ | async)?.display_name?.charAt(0) || 'U'" nzSize="small"></nz-avatar>
            <span class="user-name">{{ (authService.currentUser$ | async)?.display_name || '用户' }}</span>
            <span nz-icon nzType="down"></span>
          </a>
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
      </nz-header>
      <nz-content class="user-content">
        <div class="user-content-inner">
          <router-outlet></router-outlet>
        </div>
      </nz-content>
    </nz-layout>
  `,
  styles: [`
    .user-layout {
      min-height: 100vh;
      background: #f0f2f5;
    }
    .user-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0 24px;
      height: 56px;
      line-height: 56px;
    }
    .user-header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }
    .user-logo-text {
      color: #fff;
      font-size: 18px;
      font-weight: 700;
    }
    .user-nav {
      background: transparent;
      border-bottom: none;
      line-height: 56px;
    }
    .user-nav .ant-menu-item {
      color: rgba(255,255,255,0.75);
      border-bottom: 2px solid transparent;
    }
    .user-nav .ant-menu-item:hover,
    .user-nav .ant-menu-item-selected {
      color: #fff;
      border-bottom-color: #fff;
    }
    .user-header-right {
      display: flex;
      align-items: center;
    }
    .user-avatar-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255,255,255,0.85);
      cursor: pointer;
      text-decoration: none;
    }
    .user-avatar-link:hover {
      color: #fff;
    }
    .user-name {
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .user-content {
      padding: 24px;
    }
    .user-content-inner {
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class UserLayoutBasicComponent {
  constructor(
    public authService: UserAuthService,
    private router: Router,
    private msg: NzMessageService
  ) {}

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
