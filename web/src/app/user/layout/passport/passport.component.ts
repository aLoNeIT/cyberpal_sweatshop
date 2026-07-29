import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-user-layout-passport',
  template: `
    <div class="passport-layout">
      <div class="passport-container">
        <div class="passport-header">
          <div class="passport-logo-icon">C</div>
          <span class="passport-logo-text">CyberPal</span>
        </div>
        <div class="passport-body">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .passport-layout {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
      padding: 24px;
    }
    .passport-container {
      width: 100%;
      max-width: 420px;
    }
    .passport-header {
      text-align: center;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .passport-logo-icon {
      width: 40px; height: 40px;
      background: #1677ff;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 20px;
    }
    .passport-logo-text {
      font-size: 24px; font-weight: 700;
      color: #111827;
    }
    .passport-body {
      background: #fff;
      border-radius: 12px;
      padding: 40px 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
  `]
})
export class UserLayoutPassportComponent {}
