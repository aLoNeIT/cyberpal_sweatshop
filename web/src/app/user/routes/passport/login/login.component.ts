import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserAuthService } from '../../../services/user-auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-user-login',
  template: `
    <!-- Tab 切换 -->
    <div class="login-tabs">
      <div class="login-tab" [class.active]="tab === 'login'" (click)="tab = 'login'">登录</div>
      <div class="login-tab" [class.active]="tab === 'register'" (click)="tab = 'register'">注册</div>
    </div>

    <!-- 登录表单 -->
    <form *ngIf="tab === 'login'" [formGroup]="loginForm" (ngSubmit)="login()">
      <div class="form-group">
        <label class="form-label">邮箱地址</label>
        <input class="form-input" formControlName="email" type="email" placeholder="请输入邮箱地址">
        <div class="form-error" *ngIf="loginForm.get('email')?.dirty && loginForm.get('email')?.invalid">
          {{ loginForm.get('email')?.hasError('required') ? '请输入邮箱地址' : '请输入有效的邮箱地址' }}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">密码</label>
        <div style="position:relative">
          <input class="form-input" formControlName="password" [type]="showPwd ? 'text' : 'password'" placeholder="请输入密码">
          <span class="pwd-toggle" (click)="showPwd = !showPwd">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.6">
              <path *ngIf="!showPwd" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <path *ngIf="showPwd" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle *ngIf="showPwd" cx="12" cy="12" r="3"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </span>
        </div>
        <div class="form-error" *ngIf="loginForm.get('password')?.dirty && loginForm.get('password')?.invalid">
          {{ loginForm.get('password')?.hasError('required') ? '请输入密码' : '密码至少 6 位' }}
        </div>
      </div>
      <button class="btn btn-primary btn-block" type="submit" [disabled]="loginForm.invalid || loading">
        {{ loading ? '登录中...' : '登 录' }}
      </button>
    </form>

    <!-- 注册表单 -->
    <form *ngIf="tab === 'register'" [formGroup]="registerForm" (ngSubmit)="register()">
      <div class="form-group">
        <label class="form-label">显示名称</label>
        <input class="form-input" formControlName="display_name" placeholder="输入你的昵称">
      </div>
      <div class="form-group">
        <label class="form-label">邮箱地址 <span class="required">*</span></label>
        <input class="form-input" formControlName="email" type="email" placeholder="请输入邮箱地址">
        <div class="form-error" *ngIf="registerForm.get('email')?.dirty && registerForm.get('email')?.invalid">
          {{ registerForm.get('email')?.hasError('required') ? '请输入邮箱地址' : '请输入有效的邮箱地址' }}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">密码 <span class="required">*</span></label>
        <div style="position:relative">
          <input class="form-input" formControlName="password" [type]="showRegPwd ? 'text' : 'password'" placeholder="至少 6 位密码">
          <span class="pwd-toggle" (click)="showRegPwd = !showRegPwd">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.6">
              <path *ngIf="!showRegPwd" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <path *ngIf="showRegPwd" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle *ngIf="showRegPwd" cx="12" cy="12" r="3"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </span>
        </div>
        <div class="form-error" *ngIf="registerForm.get('password')?.dirty && registerForm.get('password')?.invalid">
          {{ registerForm.get('password')?.hasError('required') ? '请输入密码' : '密码至少 6 位' }}
        </div>
      </div>
      <button class="btn btn-primary btn-block" type="submit" [disabled]="registerForm.invalid || loading">
        {{ loading ? '注册中...' : '注 册' }}
      </button>
    </form>

    <!-- Footer -->
    <div class="login-footer">
      <span *ngIf="tab === 'login'">还没有账号？<a (click)="tab = 'register'">立即注册</a></span>
      <span *ngIf="tab === 'register'">已有账号？<a (click)="tab = 'login'">立即登录</a></span>
    </div>
  `,
  styles: [`
    :host {
      --cp-primary: #1677ff; --cp-primary-hover: #4096ff;
      --cp-danger: #DC2626; --cp-surface: #FFFFFF; --cp-border: #f0f0f0;
      --cp-text: #111827; --cp-text-secondary: #6b7280; --cp-text-tertiary: #9ca3af;
      --cp-radius-md: 8px; --cp-transition-fast: 150ms ease;
    }
    .login-tabs { display:flex; border-bottom:1px solid var(--cp-border); margin-bottom:24px; }
    .login-tab { flex:1; padding:10px 16px; font-size:14px; font-weight:500; color:var(--cp-text-secondary); cursor:pointer; border-bottom:2px solid transparent; transition:all var(--cp-transition-fast); user-select:none; text-align:center; }
    .login-tab:hover { color:var(--cp-primary); }
    .login-tab.active { color:var(--cp-primary); border-bottom-color:var(--cp-primary); }
    .form-group { margin-bottom:20px; }
    .form-label { display:block; font-size:13px; font-weight:500; color:var(--cp-text-secondary); margin-bottom:6px; }
    .form-label .required { color:var(--cp-danger); }
    .form-input { width:100%; height:40px; padding:0 12px; font-size:14px; color:var(--cp-text); background:var(--cp-surface); border:1px solid var(--cp-border); border-radius:var(--cp-radius-md); transition:all var(--cp-transition-fast); outline:none; font-family:inherit; }
    .form-input:focus { border-color:var(--cp-primary); box-shadow:0 0 0 2px rgba(22,119,255,.15); }
    .form-input.ng-invalid.ng-dirty { border-color:var(--cp-danger); }
    .form-error { font-size:12px; color:var(--cp-danger); margin-top:4px; }
    .pwd-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--cp-text-tertiary); }
    .pwd-toggle:hover { color:var(--cp-text-secondary); }
    .btn { display:inline-flex; align-items:center; justify-content:center; height:40px; padding:0 16px; font-size:15px; font-weight:500; border-radius:var(--cp-radius-md); border:1px solid transparent; cursor:pointer; transition:all var(--cp-transition-fast); user-select:none; font-family:inherit; }
    .btn-block { width:100%; }
    .btn-primary { background:var(--cp-primary); color:#fff; border-color:var(--cp-primary); }
    .btn-primary:hover:not(:disabled) { background:var(--cp-primary-hover); }
    .btn:disabled { opacity:0.6; cursor:not-allowed; }
    .login-footer { text-align:center; margin-top:24px; color:var(--cp-text-secondary); font-size:14px; }
    .login-footer a { color:var(--cp-primary); font-weight:500; cursor:pointer; }
    .login-footer a:hover { color:var(--cp-primary-hover); }
  `]
})
export class UserLoginComponent {
  tab: 'login' | 'register' = 'login';
  loginForm: FormGroup;
  registerForm: FormGroup;
  loading = false;
  showPwd = false;
  showRegPwd = false;

  constructor(
    private fb: FormBuilder,
    public authService: UserAuthService,
    private router: Router,
    private route: ActivatedRoute,
    private msg: NzMessageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.registerForm = this.fb.group({
      display_name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login(): void {
    if (this.loginForm.invalid) { Object.values(this.loginForm.controls).forEach(c => c.markAsDirty()); return; }
    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.msg.success('登录成功');
        const redirect = this.route.snapshot.queryParams['redirect'] || '/user/dashboard';
        this.router.navigateByUrl(redirect);
      },
      error: (err: Error) => {
        this.loading = false;
        this.msg.error(err.message || '登录失败');
      }
    });
  }

  register(): void {
    if (this.registerForm.invalid) { Object.values(this.registerForm.controls).forEach(c => c.markAsDirty()); return; }
    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.msg.success('注册成功');
        const redirect = this.route.snapshot.queryParams['redirect'] || '/user/dashboard';
        this.router.navigateByUrl(redirect);
      },
      error: (err: Error) => {
        this.loading = false;
        this.msg.error(err.message || '注册失败');
      }
    });
  }
}
