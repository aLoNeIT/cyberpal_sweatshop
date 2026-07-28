import { Component } from '@angular/core';

/**
 * 用户端登录/注册布局（极简，无侧边栏）
 */
@Component({
  standalone: false,
  selector: 'app-user-layout-passport',
  template: `
    <div class="user-passport-layout">
      <div class="user-passport-container">
        <div class="user-passport-header">
          <a routerLink="/user/login">
            <img src="assets/img/kd-brand-logo.png" alt="CyberPal" height="48" />
          </a>
        </div>
        <div class="user-passport-body">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-passport-layout {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 24px;
    }
    .user-passport-container {
      width: 100%;
      max-width: 420px;
    }
    .user-passport-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .user-passport-header a {
      display: inline-block;
      text-decoration: none;
    }
    .user-passport-body {
      background: #fff;
      border-radius: 12px;
      padding: 40px 32px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }
  `]
})
export class UserLayoutPassportComponent {}
