import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Injector, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrivilegeService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { DrawerHelper, ModalHelper, SettingsService, User, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApplicationLogic } from '@core';
import { IYzbDialogComponent, IEventEmitter } from '@shared/model';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { YzbDialogComponent } from 'src/app/shared/component/common/yzb-dialog.component';
import { AdminpasswordComponent } from './password.components';
@Component({
  selector: 'app-admin-header-user',
  standalone: false,
  template: `
    <div
      class="alain-default__nav-item d-flex align-items-center px-sm"
      nz-dropdown
      nzTrigger="click"
      nzPlacement="bottomRight"
      [nzDropdownMenu]="userMenu"
    >
      <nz-avatar [nzText]="avatarText" nzSize="small" class="mr-sm"></nz-avatar>
      {{ user.real_name }}
    </div>

    <nz-dropdown-menu #userMenu="nzDropdownMenu">
      <div nz-menu class="width-sm">
        <div nz-menu-item (click)="openEditPwd()">
          <i nz-icon nzType="user" class="mr-sm"></i>
          修改密码
        </div>
        <div nz-menu-item (click)="logout()">
          <i nz-icon nzType="logout" class="mr-sm"></i>
          退出登录
        </div>
      </div>
    </nz-dropdown-menu>
  `,

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminHeaderUserComponent implements OnInit {
  get user(): any {
    return this.settings.user;
  }

  get avatarText(): string {
    return this.getNameInitial(this.user?.real_name || this.user?.realname || this.user?.name || this.user?.account);
  }

  validateForm!: UntypedFormGroup;
  isVisiblea = false;
  constructor(
    private settings: SettingsService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private fb: UntypedFormBuilder,
    private http: _HttpClient,
    private msg: NzMessageService,
    private injector: Injector,
    private cdr: ChangeDetectorRef,
    private modal: ModalHelper,
    protected privilegeSrv: PrivilegeService
  ) {}
  protected get modaldraw(): DrawerHelper {
    return this.injector.get(DrawerHelper);
  }
  logout(): void {
    this.tokenService.clear();
    ApplicationLogic.getInstance(this.injector).toLogin(null, null, 1, { auto: false });
  }
  openEditPwd() {
    this.modal
      .createStatic(
        YzbDialogComponent,
        {
          autoClose: false,
          componentType: AdminpasswordComponent,
          options: {
            title: '修改密码',
            buttons: [
              {
                title: '确定',
                type: 'primary',
                click: (component: IYzbDialogComponent, modalRef: NzModalRef, $event: IEventEmitter) => {
                  component.submit();
                }
              },
              {
                title: '关闭',
                click: (component: IYzbDialogComponent, modalRef: NzModalRef, $event: IEventEmitter) => {
                  modalRef.close();
                }
              }
            ]
          }
        },
        {
          size: 'md',
          modalOptions: {
            nzMaskClosable: false
          }
        }
      )
      .subscribe(res => {
        // console.log(res);
      });
  }
  ngOnInit(): void {
    this.validateForm = this.fb.group({
      email: [null, [Validators.email, Validators.required]]
    });
    let emali = this.user.mail;
    this.validateForm.get('email')!.setValue(emali);
  }

  private getNameInitial(name: unknown): string {
    const text = String(name || '').trim();
    return Array.from(text)[0] || '用';
  }
}
