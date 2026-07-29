import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserAuthService } from '../../../services/user-auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-user-register',
  template: `
    <h2 class="register-title">创建账号</h2>
    <p class="register-subtitle">开始你的 AI Agent 之旅</p>
    <form nz-form [formGroup]="form" (ngSubmit)="submit()" class="register-form">
      <nz-form-item>
        <nz-form-control [nzErrorTip]="nameError">
          <nz-input-group [nzPrefix]="namePrefix" nzSize="large">
            <ng-template #namePrefix>
              <span nz-icon nzType="user"></span>
            </ng-template>
            <input nz-input formControlName="display_name" placeholder="显示名称" />
          </nz-input-group>
          <ng-template #nameError let-control>
            <ng-container *ngIf="control.hasError('required')">请输入显示名称</ng-container>
          </ng-template>
        </nz-form-control>
      </nz-form-item>
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
            <input nz-input formControlName="password" placeholder="密码（至少6位）" type="password" />
          </nz-input-group>
          <ng-template #passwordError let-control>
            <ng-container *ngIf="control.hasError('required')">请输入密码</ng-container>
            <ng-container *ngIf="control.hasError('minlength')">密码至少 6 位</ng-container>
          </ng-template>
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <button nz-button nzType="primary" nzSize="large" nzBlock [nzLoading]="loading" [disabled]="form.invalid">
          注 册
        </button>
      </nz-form-item>
    </form>
    <div class="register-footer">
      已有账号？<a routerLink="/user/login">立即登录</a>
    </div>
  `,
  styles: [`
    .register-title {
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    .register-subtitle {
      text-align: center;
      color: #888;
      font-size: 14px;
      margin-bottom: 32px;
    }
    .register-form {
      max-width: 320px;
      margin: 0 auto;
    }
    .register-footer {
      text-align: center;
      margin-top: 24px;
      color: #888;
      font-size: 14px;
    }
    .register-footer a {
      color: #667eea;
      font-weight: 500;
    }
  `]
})
export class UserRegisterComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: UserAuthService,
    private router: Router,
    private msg: NzMessageService
  ) {
    this.form = this.fb.group({
      display_name: ['', [Validators.required]],
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
    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.msg.success('注册成功');
        this.router.navigate(['/user/dashboard']);
      },
      error: (err: Error) => {
        this.loading = false;
        this.msg.error(err.message || '注册失败');
      }
    });
  }
}
