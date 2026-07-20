import { Component, Injector, Input } from '@angular/core';
import { SHARED_IMPORTS } from '@shared';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'hospital-components-wxwork-edit',
  imports: SHARED_IMPORTS,
  template: `
    <div class="modal-header">
      <div class="modal-title">编辑</div>
    </div>
    <div>
      <nz-textarea-count [nzMaxCharacterCount]="500">
        <textarea rows="4" rows="8" maxlength="500" placeholder="请输入" class="tips-tex" [(ngModel)]="value" nz-input></textarea>
      </nz-textarea-count>
    </div>
    <div class="modal-footer">
      <button nz-button type="button" (click)="modalRef.close()">关闭</button>
      <button nz-button type="submit" [nzType]="'primary'" (click)="submit()">保存</button>
    </div>
  `
})
export class ComponentsWxworkComponent {
  protected get modalRef(): NzModalRef {
    return this.injector.get(NzModalRef);
  }
  @Input() value = '';
  constructor(protected injector: Injector) {}
  submit() {
    this.modalRef.close(this.value);
  }
}
