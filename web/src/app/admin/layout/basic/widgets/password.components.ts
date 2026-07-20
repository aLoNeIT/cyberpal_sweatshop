import { Component, Inject, ChangeDetectorRef, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { PrivilegeService, HttpLogic } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { CacheService } from '@delon/cache';
import { SettingsService, User, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { IKVPaire } from '@shared/model';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-admin-password-pwd',
  standalone: false,
  template: `
    <form nz-form [formGroup]="formPwd">
      @if (error) {
        <nz-alert [nzType]="'error'" [nzMessage]="error" [nzShowIcon]="true" class="mb-lg"></nz-alert>
      }
      <nz-form-item>
        <nz-form-label nzRequired [nzSpan]="6" nzFor="pwd_src">原密码</nz-form-label>
        <nz-form-control [nzSpan]="14" [nzErrorTip]="oldPwdErrorTip">
          <nz-input-group [nzSuffix]="iconZero">
            <input
              id="pwd_src"
              nz-input
              [type]="ifHideOldPwd ? 'password' : 'text'"
              formControlName="pwd_src"
              placeholder="输入旧密码"
              (ngModelChange)="updateConfirmValidator()"
              minlength="6"
            />
          </nz-input-group>
          <ng-template #iconZero>
            <i (click)="ifHideOldPwd = !ifHideOldPwd" nz-icon [nzType]="ifHideOldPwd ? 'eye-invisible' : 'eye'" nzTheme="outline"></i>
            <!-- <i (click)="ifHideOldPwd = !ifHideOldPwd" nz-icon nzType="eye" nzTheme="outline" [hidden]="ifHideOldPwd"></i> -->
          </ng-template>
          <ng-template #oldPwdErrorTip let-control>
            @if (control.errors.required) {
              请输入密码
            }
            @if (control.hasError('minlength')) {
              密码长度不够
            }
          </ng-template>
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label nzRequired [nzSpan]="6" nzFor="pwd">新密码</nz-form-label>
        <nz-form-control [nzSpan]="14" [nzErrorTip]="pwdErrorTip">
          <nz-input-group [nzSuffix]="iconOne">
            <input
              id="pwd"
              nz-input
              [type]="ifHidePwd ? 'password' : 'text'"
              formControlName="pwd"
              placeholder="密码格式：长度为8-20位数字和字母组合"
              (ngModelChange)="updateConfirmValidator()"
            />
          </nz-input-group>
          <ng-template #iconOne>
            <i nz-icon (click)="ifHidePwd = !ifHidePwd" [nzType]="ifHidePwd ? 'eye-invisible' : 'eye'" nzTheme="outline"></i>
          </ng-template>
          <ng-template #pwdErrorTip let-control>
            @if (control.errors.required) {
              请输入密码
            }
            @if (control.errors.pattern) {
              密码格式：长度为8-20位数字和字母组合
            }
          </ng-template>
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label nzRequired [nzSpan]="6" nzFor="pwd_confirm">确认密码</nz-form-label>
        <nz-form-control [nzSpan]="14" [nzErrorTip]="pwdConfirmErrorTip">
          <nz-input-group [nzSuffix]="iconTwo">
            <input
              id="pwd_confirm"
              nz-input
              [type]="ifHidePwdTwo ? 'password' : 'text'"
              formControlName="pwd_confirm"
              placeholder="确认新密码"
            />
          </nz-input-group>
          <ng-template #iconTwo>
            <i nz-icon (click)="ifHidePwdTwo = !ifHidePwdTwo" [nzType]="ifHidePwdTwo ? 'eye-invisible' : 'eye'" nzTheme="outline"></i>
            <!-- <i (click)="showPwd(2)" nz-icon nzType="eye" nzTheme="outline" [hidden]="ifHidePwdTwo"></i> -->
          </ng-template>
          <ng-template #pwdConfirmErrorTip let-control>
            @if (control.errors.required) {
              请确认密码
            }
            @if (control.errors.pattern) {
              密码格式：长度为8-20位数字和字母组合。
            }
            @if (control.errors.confirm) {
              两次输入的密码不匹配
            }
          </ng-template>
        </nz-form-control>
      </nz-form-item>
    </form>
    <!-- <div class="modal-footer">
          <button nz-button type="button" (click)="close()">关闭</button>
          <button nz-button type="submit" [nzType]="'primary'" (click)="submit()" [nzLoading]="loading">确定</button>
        </div> -->
  `
})
export class AdminpasswordComponent {
  row: any;

  loading = false;

  // #region modify password

  formPwd: FormGroup;
  error = '';
  ifHideOldPwd = true;
  ifHidePwd = true;
  ifHidePwdTwo = true;

  // #end region

  get user(): User {
    return this.settings.user;
  }

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    public http: _HttpClient,
    public msgSrv: NzMessageService,
    private cdr: ChangeDetectorRef,
    private settings: SettingsService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private cacheSrv: CacheService,
    private injector: Injector,
    private privilegeSrv: PrivilegeService
  ) {
    this.formPwd = fb.group({
      pwd_src: [null, [Validators.required]],
      pwd: [null, [Validators.required, Validators.pattern(/^(?!([a-zA-Z]+|\d+)$)[a-zA-Z\d]{8,20}$/)]],
      pwd_confirm: [null, [Validators.required, Validators.pattern(/^(?!([a-zA-Z]+|\d+)$)[a-zA-Z\d]{8,20}$/), this.confirmationValidator]]
    });
  }

  // #region modify password modal

  submit(): void {
    this.error = '';
    for (const i in this.formPwd.controls) {
      this.formPwd.controls[i].markAsDirty();
      this.formPwd.controls[i].updateValueAndValidity();
    }

    if (this.formPwd.invalid) {
      return;
    }

    const params = this.formPwd.value;
    Object.keys(params).forEach(key => {
      params[key] = Md5.hashStr(params[key]);
    });

    this.loading = true;
    const request = HttpLogic.getInstance(this.injector).reqPut('/admin/v1/user/password', params, undefined, undefined, true);
    request.success.subscribe(() => {
      this.loading = false;
      this.cdr.detectChanges();
      this.msgSrv.success('密码修改成功！');

      this.privilegeSrv.user = Object.assign(this.user, { need_change: 0 });

      this.settings.setUser(Object.assign(this.user, { need_change: 0 }));
      this.close();
    });
    request.error.subscribe(res => {
      this.loading = false;
      this.error = String(res.msg || '密码修改失败');
      this.cdr.detectChanges();
    });
  }

  close(): void {
    this.error = '';
    this.formPwd.reset();
    this.modal.destroy();
  }

  // #end region

  // #region modify password

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.formPwd.controls['pwd'].value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.formPwd.controls['pwd_confirm'].updateValueAndValidity());
  }

  isDialog: boolean = false;
  initDialog(params: IKVPaire) {
    this.isDialog = true;
  }
  // #end region
}
