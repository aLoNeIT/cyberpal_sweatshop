import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserApiService } from '../../services/user-api.service';
import { UserAuthService } from '../../services/user-auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-user-settings',
  template: `
    <div class="settings-page">
      <h2 class="page-title">个人设置</h2>
      <nz-card nzTitle="基本资料" [nzLoading]="loading">
        <form nz-form [formGroup]="form" nzLayout="vertical" style="max-width: 480px;">
          <nz-form-item>
            <nz-form-label>邮箱</nz-form-label>
            <nz-form-control>
              <input nz-input [value]="email" disabled />
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label nzRequired>显示名称</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="display_name" placeholder="输入显示名称" />
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label>主题偏好</nz-form-label>
            <nz-form-control>
              <nz-radio-group formControlName="theme_pref">
                <label nz-radio nzValue="system">跟随系统</label>
                <label nz-radio nzValue="light">浅色</label>
                <label nz-radio nzValue="dark">深色</label>
              </nz-radio-group>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label>自动归档</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="auto_archive_enabled"></nz-switch>
              <span style="margin-left: 8px; color: #888;">{{ form.value.auto_archive_enabled ? '已开启' : '已关闭' }}</span>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item *ngIf="form.value.auto_archive_enabled">
            <nz-form-label>归档天数</nz-form-label>
            <nz-form-control>
              <nz-input-number formControlName="auto_archive_days" [nzMin]="1" [nzMax]="365"></nz-input-number>
              <span style="margin-left: 8px; color: #888;">天后自动归档</span>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <button nz-button nzType="primary" [nzLoading]="saving" (click)="save()">保存设置</button>
          </nz-form-item>
        </form>
      </nz-card>

      <nz-card nzTitle="账号信息" style="margin-top: 16px;">
        <nz-descriptions nzBordered [nzColumn]="1">
          <nz-descriptions-item nzTitle="用户ID">{{ userId }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="注册时间">{{ createdAt | date:'yyyy-MM-dd HH:mm:ss' }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="最后更新">{{ updatedAt | date:'yyyy-MM-dd HH:mm:ss' }}</nz-descriptions-item>
        </nz-descriptions>
      </nz-card>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 24px;
      color: #1a1a2e;
    }
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

  constructor(
    private fb: FormBuilder,
    private api: UserApiService,
    private authService: UserAuthService,
    private msg: NzMessageService
  ) {
    this.form = this.fb.group({
      display_name: [''],
      theme_pref: ['system'],
      auto_archive_enabled: [true],
      auto_archive_days: [30]
    });
  }

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.email = user.email;
      this.userId = user.id.toString();
      this.createdAt = new Date(user.created_at * 1000).toISOString();
      this.updatedAt = new Date(user.updated_at * 1000).toISOString();
    }
    this.api.getProfile().subscribe({
      next: user => {
        this.form.patchValue({
          display_name: user.display_name,
          theme_pref: user.theme_pref,
          auto_archive_enabled: user.auto_archive_enabled,
          auto_archive_days: user.auto_archive_days
        });
        this.email = user.email;
        this.userId = user.id.toString();
        this.createdAt = new Date(user.created_at * 1000).toISOString();
        this.updatedAt = new Date(user.updated_at * 1000).toISOString();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  save(): void {
    this.saving = true;
    this.api.updateProfile(this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.msg.success('设置已保存');
      },
      error: (err) => {
        this.saving = false;
        this.msg.error(err.message || '保存失败');
      }
    });
  }
}
