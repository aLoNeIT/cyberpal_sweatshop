import { Component, Injector } from '@angular/core';
import { SHARED_IMPORTS } from '@shared';

import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'hospital-components-examine',
  imports: SHARED_IMPORTS,
  template: `
    <div class="ant-modal-confirm-body-wrapper">
      <div class="ant-modal-confirm-body" style="padding: 17px 0;">
        <span nz-icon [nzType]="nzIconType!" style="color:#fbb834"></span>
        <span class="ant-modal-confirm-title">
          <span>{{ title }}</span>
        </span>
        <div class="ant-modal-confirm-content">
          <div>{{ content }}</div>
        </div>
      </div>
      <div class="ant-modal-confirm-btns" style="float: right;">
        @if (options.buttons && options.buttons.length > 0) {
          @for (button of options.buttons; track button) {
            <button
              nz-button
              type="button"
              (click)="button.click(modalRef)"
              [nzType]="button.type || 'default'"
              [nzDanger]="button.isDanger"
            >
              {{ button.title }}
            </button>
          }
        }
      </div>
    </div>
  `
})
export class ComponentsExamineComponent {
  nzIconType: string = 'exclamation-circle';
  onCancel() {}
  title: string = '数据审核';
  content: string = '确认审核选中数据？';
  options!: any;
  ngOnInit() {
    const options: any = {
      buttons: [
        {
          title: '不通过',
          click: () => {
            this.modalRef.close('close');
          }
        },
        {
          title: '通过',
          type: 'primary',
          click: () => {
            this.modalRef.close('ok');
          }
        }
      ]
    };
    if (!this.options) {
      this.options = options;
    }
  }
  protected get modalRef(): NzModalRef {
    return this.injector.get(NzModalRef);
  }
  constructor(protected injector: Injector) {}
}
