import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { Observable } from 'rxjs';
import { YzbFormComponent } from '../../base/curd/yzb-form.component';
import { IJsonTable, IYzbDialogFormComponent, IKVPaire } from '../../../model/public-api';

import { BaseCurdComponent } from './base-curd.component';
import { SFUISchema } from '@delon/form';
import { SHARED_IMPORTS } from '@shared';

@Component({
  templateUrl: './base-update.component.html',
  imports: [...SHARED_IMPORTS, YzbFormComponent]
})
export class BaseUpdateComponent extends BaseCurdComponent implements AfterViewInit, IYzbDialogFormComponent {
  //#region 组件基础

  /**
   * 主键数据
   */
  id: number = 0;
  /**
   * 当前数据
   */
  data: NzSafeAny = {};

  @ViewChild('update', { static: false }) update!: YzbFormComponent;
  ui: SFUISchema = {};
  protected override initialize(): void {
    super.initialize();
    this.curd = 4;
  }

  protected getUpdateData() {
    if (!this.id) {
      this.msgSrv.error('请选择有效数据');
      return;
    }
    const { success } = this.reqGet(`${this.baseUri}/${this.id}`);
    success.subscribe((res: IJsonTable) => {
      this.update?.setFormData(res.data);
    });
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    setTimeout(() => {
      this.getUpdateData();
    });
  }

  //#endregion

  //#region 对话框组件

  reset(): Observable<NzSafeAny> {
    return new Observable<NzSafeAny>(() => {
      this.update.resetFormData();
    });
  }

  override submit(): Observable<NzSafeAny> {
    return new Observable<NzSafeAny>(observer => {
      // 获取当前页面数据
      this.update.getFormData().subscribe(data => {
        if (this.loading) {
          this.msgSrv.warning('数据正在提交，请稍后再试');
          return;
        }
        this.loading = true;
        this.reqPut(`${this.baseUri}/${this.id}`, data).success.subscribe({
          next: (result: IJsonTable) => {
            if (0 != result.state) {
              if (result.data) {
                // 存在多条错误信息，则循环显示
                Object.keys(result.data).forEach(key => {
                  this.msgSrv.error(`${result.data[key]}[${key}]`);
                });
              } else {
                result.msg = result.msg.replace(/</g, '&lt;').replace(/>/g, '&gt;'); //后端返回的信息里包括<>的转义处理
                this.msgSrv.error(`${result.msg}[${result.state}]`);
              }
            } else {
              observer.next(result.data);
              this.msgSrv.success('保存成功');
            }
          },
          complete: () => {
            this.loading = false;
          }
        });
      });
    });
  }

  //#endregion

  //#region 对话框组件

  override initDialog(params: IKVPaire) {
    super.initDialog(params);
    this.id = params['id'];
  }

  //#endregion

  //#region 子组件相关

  //#endregion
}
