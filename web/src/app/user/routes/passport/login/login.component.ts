import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserAuthService } from '../../../services/user-auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-user-login',
  template: `
    <h2 class="login-title">登录 CyberPal</h2>
    <p class="login-subtitle">使用您的 AI Agent 工作空间</p>
    <form nz-form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
      <nz-form-item>
        <nz-form-control [nzErrorTip]="emailError">
          <nz-input-group [nzPrefix]="emailPrefix" nzSize="large">
            <ng-template #emailPrefix>
              <span nz-icon nzType="mail"></span>
            </ng-template>
            <input nz-input formControlName="email" placeholder="邮箱地址" type="email" />
          </nz-input-group>
          <ng-template #emailError let-control>
            <ng-container *ngIf="control.hasError('required')">请输入邮箱地址</ng-container>
            <ng-container *ngIf="control.hasError('email')">请输入有效的邮箱地址</ng-container>
          </ng-template>
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-control [nzErrorTip]="passwordError">
          <nz-input-group [nzPrefix]="passwordPrefix" nzSize="large">
            <ng-template #passwordPrefix>
              <span nz-icon nzType="lock"></span>
            </ng-template>
            <input nz-input formControlName="password" placeholder="密码" type="password" />
          </nz-input-group>
          <ng-template #passwordError let-control>
            <ng-container *ngIf="control.hasError('required')">请输入密码</ng-container>
            <ng-container *ngIf="control.hasError('minlength')">密码至少 6 位</ng-container>
          </ng-template>
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <button nz-button nzType="primary" nzSize="large" nzBlock [nzLoading]="loading" [disabled]="form.invalid">
          登 录
        </button>
      </nz-form-item>
    </form>
    <div class="login-footer">
      还没有账号？<a routerLink="/user/register">立即注册</a>
    </div>
  `,
  styles: [`
    .login-title {
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    .login-subtitle {
      text-align: center;
      color: #888;
      font-size: 14px;
      margin-bottom: 32px;
    }
    .login-form {
      max-width: 320px;
      margin: 0 auto;
    }
    .login-footer {
      text-align: center;
      margin-top: 24px;
      color: #888;
      font-size: 14px;
    }
    .login-footer a {
      color: #667eea;
      font-weight: 500;
    }
  `]
})
export class UserLoginComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: UserAuthService,
    private router: Router,
    private route: ActivatedRoute,
    private msg: NzMessageService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => c.markAsDirty());
      return;
    }
    this.loading = true;
    this.authService.login(this.form.value).subscribe({
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
}
