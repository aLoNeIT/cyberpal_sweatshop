import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserApiService } from '../../services/user-api.service';
import { UserAuthService } from '../../services/user-auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-user-settings',
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1>设置</h1>
        <p>管理你的账户信息、偏好和安全设置</p>
      </div>
    </div>

    <!-- 个人资料 -->
    <div class="card" style="margin-bottom:24px">
      <div class="card-header"><h3>个人资料</h3></div>
      <div class="card-body">
        <form [formGroup]="form" style="max-width:480px">
          <div class="form-group">
            <label class="form-label">显示名称 <span class="required">*</span></label>
            <input class="form-input" formControlName="display_name" placeholder="输入你的显示名称">
          </div>
          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input class="form-input" [value]="email" disabled style="background:var(--cp-surface-2)">
            <div class="form-hint">邮箱暂不支持修改，如需变更请联系管理员</div>
          </div>
          <div class="form-group">
            <label class="form-label">头像</label>
            <div style="display:flex;align-items:center;gap:12px">
              <div class="avatar-preview">{{ userInitial }}</div>
              <button class="btn btn-secondary btn-sm" (click)="msg.info('功能开发中')">更换头像</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- 偏好设置 -->
    <div class="card" style="margin-bottom:24px">
      <div class="card-header"><h3>偏好设置</h3></div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">主题偏好</label>
          <div class="radio-group">
            <label class="radio-label" (click)="setTheme('light')">
              <span class="radio-dot" [class.active]="themePref === 'light'"></span>
              <span>浅色模式</span>
            </label>
            <label class="radio-label" (click)="setTheme('dark')">
              <span class="radio-dot" [class.active]="themePref === 'dark'"></span>
              <span>深色模式</span>
            </label>
            <label class="radio-label" (click)="setTheme('system')">
              <span class="radio-dot" [class.active]="themePref === 'system'"></span>
              <span>跟随系统</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">自动归档</label>
          <div style="display:flex;align-items:center;gap:12px">
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="autoArchive" (change)="onAutoArchiveChange()">
              <span class="toggle-slider"></span>
            </label>
            <span style="font-size:13px;color:var(--cp-text-secondary)">{{ autoArchive ? '已开启' : '已关闭' }}</span>
            <ng-container *ngIf="autoArchive">
              <input class="form-input" type="number" [(ngModel)]="archiveDays" style="width:80px" min="1" max="365">
              <span style="font-size:13px;color:var(--cp-text-secondary)">天后自动归档</span>
            </ng-container>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary" (click)="save()" [disabled]="saving">
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>

    <!-- 安全设置 -->
    <div class="card" style="margin-bottom:24px">
      <div class="card-header"><h3>安全设置</h3></div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">修改密码</label>
          <div style="display:flex;gap:12px;max-width:400px">
            <input class="form-input" type="password" placeholder="当前密码" [(ngModel)]="oldPassword">
            <input class="form-input" type="password" placeholder="新密码" [(ngModel)]="newPassword">
          </div>
          <button class="btn btn-secondary" style="margin-top:12px" (click)="changePassword()">修改密码</button>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">API Key</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input class="form-input" [value]="apiKeyMasked" disabled style="background:var(--cp-surface-2);max-width:360px">
            <button class="btn btn-ghost btn-sm" (click)="msg.info('功能开发中')">复制</button>
            <button class="btn btn-ghost btn-sm" (click)="msg.info('功能开发中')">重新生成</button>
          </div>
          <div class="form-hint">用于 API 调用的密钥，请妥善保管</div>
        </div>
      </div>
    </div>

    <!-- 账号信息 -->
    <div class="card">
      <div class="card-header"><h3>账号信息</h3></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:480px">
          <div>
            <div class="info-label">用户ID</div>
            <div class="info-value">{{ userId }}</div>
          </div>
          <div>
            <div class="info-label">注册时间</div>
            <div class="info-value">{{ createdAt | date:'yyyy-MM-dd HH:mm' }}</div>
          </div>
          <div>
            <div class="info-label">邮箱</div>
            <div class="info-value">{{ email }}</div>
          </div>
          <div>
            <div class="info-label">最后更新</div>
            <div class="info-value">{{ updatedAt | date:'yyyy-MM-dd HH:mm' }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --cp-primary: #1677ff; --cp-primary-subtle: #e6f4ff;
      --cp-danger: #DC2626; --cp-danger-bg: rgba(220,38,38,.12);
      --cp-surface: #FFFFFF; --cp-surface-2: #fafafa; --cp-border: #f0f0f0;
      --cp-text: #111827; --cp-text-secondary: #6b7280; --cp-text-tertiary: #9ca3af;
      --cp-radius-md: 8px; --cp-radius-lg: 12px; --cp-radius-pill: 999px;
      --cp-shadow-sm: 0 1px 2px rgba(0,0,0,.06);
      --cp-font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      --cp-transition-fast: 150ms ease;
    }
    .page-header { margin-bottom:24px; }
    .page-header-left h1 { font-size:20px; font-weight:600; color:var(--cp-text); margin-bottom:4px; }
    .page-header-left p { font-size:14px; color:var(--cp-text-secondary); }

    /* Card */
    .card { background:var(--cp-surface); border-radius:var(--cp-radius-lg); border:1px solid var(--cp-border); box-shadow:var(--cp-shadow-sm); overflow:hidden; }
    .card-header { padding:16px 24px; border-bottom:1px solid var(--cp-border); display:flex; align-items:center; justify-content:space-between; }
    .card-header h3 { font-size:16px; font-weight:600; color:var(--cp-text); }
    .card-body { padding:24px; }
    .card-footer { padding:12px 24px; border-top:1px solid var(--cp-border); display:flex; align-items:center; justify-content:flex-end; gap:8px; }

    /* Form */
    .form-group { margin-bottom:20px; }
    .form-label { display:block; font-size:13px; font-weight:500; color:var(--cp-text-secondary); margin-bottom:6px; }
    .form-label .required { color:var(--cp-danger); }
    .form-input { width:100%; height:36px; padding:0 12px; font-size:14px; color:var(--cp-text); background:var(--cp-surface); border:1px solid var(--cp-border); border-radius:var(--cp-radius-md); transition:all var(--cp-transition-fast); outline:none; font-family:inherit; }
    .form-input:focus { border-color:var(--cp-primary); box-shadow:0 0 0 2px rgba(22,119,255,.15); }
    .form-hint { font-size:12px; color:var(--cp-text-tertiary); margin-top:4px; }

    .avatar-preview { width:48px; height:48px; border-radius:var(--cp-radius-pill); background:var(--cp-primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:20px; }

    /* Radio */
    .radio-group { display:flex; gap:16px; }
    .radio-label { display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; color:var(--cp-text); }
    .radio-dot { width:18px; height:18px; border-radius:50%; border:2px solid var(--cp-border); display:flex; align-items:center; justify-content:center; transition:all var(--cp-transition-fast); }
    .radio-dot.active { border-color:var(--cp-primary); }
    .radio-dot.active::after { content:''; width:8px; height:8px; border-radius:50%; background:var(--cp-primary); }

    /* Toggle */
    .toggle { position:relative; display:inline-block; width:44px; height:24px; }
    .toggle input { opacity:0; width:0; height:0; }
    .toggle-slider { position:absolute; top:0; left:0; right:0; bottom:0; background:var(--cp-border); border-radius:12px; cursor:pointer; transition:all var(--cp-transition-fast); }
    .toggle-slider::before { content:''; position:absolute; width:18px; height:18px; left:3px; bottom:3px; background:#fff; border-radius:50%; transition:all var(--cp-transition-fast); }
    .toggle input:checked + .toggle-slider { background:var(--cp-primary); }
    .toggle input:checked + .toggle-slider::before { transform:translateX(20px); }

    /* Info */
    .info-label { font-size:12px; color:var(--cp-text-tertiary); margin-bottom:4px; }
    .info-value { font-size:14px; color:var(--cp-text); font-family:var(--cp-font-mono); }

    /* Buttons */
    .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; height:36px; padding:0 16px; font-size:14px; font-weight:500; border-radius:var(--cp-radius-md); border:1px solid transparent; cursor:pointer; transition:all var(--cp-transition-fast); user-select:none; white-space:nowrap; font-family:inherit; }
    .btn-sm { height:28px; padding:0 10px; font-size:13px; }
    .btn-primary { background:var(--cp-primary); color:#fff; border-color:var(--cp-primary); }
    .btn-primary:hover { background:#4096ff; }
    .btn-secondary { background:var(--cp-surface); color:var(--cp-text); border-color:var(--cp-border); }
    .btn-secondary:hover { color:var(--cp-primary); border-color:var(--cp-primary); }
    .btn-ghost { background:transparent; color:var(--cp-text-secondary); border-color:transparent; }
    .btn-ghost:hover { background:var(--cp-primary-subtle); color:var(--cp-primary); }
    .btn:disabled { opacity:0.6; cursor:not-allowed; }
  `]
})
export class UserSettingsComponent implements OnInit {
  form: FormGroup;
  loading = true;
  saving = false;
  email = '';
  userId = '';
  createdAt = '';
  updatedAt = '';
  userInitial = 'U';
  themePref = 'light';
  autoArchive = true;
  archiveDays = 30;
  oldPassword = '';
  newPassword = '';
  apiKeyMasked = 'cp_sk-••••••••••••••••••••••••';

  constructor(
    private fb: FormBuilder,
    private api: UserApiService,
    public authService: UserAuthService,
    public msg: NzMessageService
  ) {
    this.form = this.fb.group({
      display_name: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user?.display_name) {
        this.userInitial = user.display_name.charAt(0);
        this.form.patchValue({ display_name: user.display_name });
      }
    });
    this.api.getProfile().subscribe({
      next: user => {
        this.form.patchValue({ display_name: user.display_name });
        this.email = user.email;
        this.userId = user.id.toString();
        this.createdAt = new Date(user.created_at * 1000).toISOString();
        this.updatedAt = new Date(user.updated_at * 1000).toISOString();
        this.themePref = user.theme_pref || 'light';
        this.autoArchive = user.auto_archive_enabled;
        this.archiveDays = user.auto_archive_days || 30;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  setTheme(theme: string): void {
    this.themePref = theme;
  }

  onAutoArchiveChange(): void {
    // Handled via ngModel
  }

  save(): void {
    this.saving = true;
    const payload = {
      display_name: this.form.value.display_name,
      theme_pref: this.themePref as 'light' | 'dark' | 'system',
      auto_archive_enabled: this.autoArchive,
      auto_archive_days: this.archiveDays
    };
    this.api.updateProfile(payload).subscribe({
      next: () => { this.saving = false; this.msg.success('设置已保存'); },
      error: (err) => { this.saving = false; this.msg.error(err.message || '保存失败'); }
    });
  }

  changePassword(): void {
    if (!this.oldPassword || !this.newPassword) {
      this.msg.warning('请填写当前密码和新密码');
      return;
    }
    this.msg.info('密码修改功能开发中');
  }
}
