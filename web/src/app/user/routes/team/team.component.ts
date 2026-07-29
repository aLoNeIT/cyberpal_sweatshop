import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-user-team',
  template: `
    <div class="page-header">
      <div class="page-header-left">
        <h1>团队协作</h1>
        <p>与团队成员共享 Agent、会话和资源</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body" style="text-align:center;padding:80px 24px">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <h3 style="font-size:18px;font-weight:600;margin-bottom:8px">团队协作</h3>
        <p style="font-size:14px;color:var(--cp-text-secondary);margin-bottom:24px">功能开发中，敬请期待</p>
        <div class="skeleton-list">
          <div class="skeleton-card" *ngFor="let i of [1,2,3]"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --cp-primary: #1677ff; --cp-surface: #FFFFFF; --cp-surface-2: #fafafa; --cp-border: #f0f0f0;
      --cp-text: #111827; --cp-text-secondary: #6b7280; --cp-text-tertiary: #9ca3af;
      --cp-radius-lg: 12px; --cp-shadow-sm: 0 1px 2px rgba(0,0,0,.06);
    }
    .page-header { margin-bottom:24px; }
    .page-header-left h1 { font-size:20px; font-weight:600; color:var(--cp-text); margin-bottom:4px; }
    .page-header-left p { font-size:14px; color:var(--cp-text-secondary); }
    .card { background:var(--cp-surface); border-radius:var(--cp-radius-lg); border:1px solid var(--cp-border); box-shadow:var(--cp-shadow-sm); overflow:hidden; }
    .empty-icon { width:64px; height:64px; margin:0 auto 16px; background:var(--cp-surface-2); border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--cp-text-tertiary); }
    .empty-icon svg { width:32px; height:32px; }
    .skeleton-list { display:flex; gap:16px; justify-content:center; max-width:600px; margin:0 auto; }
    .skeleton-card { flex:1; height:120px; background:linear-gradient(90deg, var(--cp-border) 25%, var(--cp-surface-2) 50%, var(--cp-border) 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:var(--cp-radius-lg); }
    @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
  `]
})
export class UserTeamComponent {}
