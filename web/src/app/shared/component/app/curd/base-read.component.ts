import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { Observable } from 'rxjs';
import { YzbFormComponent } from '../../base/curd/yzb-form.component';

import { BaseCurdComponent } from './base-curd.component';
import { IJsonTable, IKVPaire, IYzbDialogFormComponent } from '../../../model/public-api';
import { SHARED_IMPORTS } from 'src/app/shared/shared-imports';

@Component({
  templateUrl: './base-read.component.html',
  imports: [...SHARED_IMPORTS, YzbFormComponent]
})
export class BaseReadComponent extends BaseCurdComponent implements AfterViewInit, IYzbDialogFormComponent {
  //#region 组件基础

  /**
   * 主键数据
   */
  id: number = 0;
  /**
   * 当前界面数据
   */
  data: NzSafeAny = {};

  @ViewChild('read', { static: false }) read!: YzbFormComponent;

  protected override initialize(): void {
    super.initialize();
    this.curd = 8;
  }

  /**
   * 获取只读数据
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-04-02
   */
  getReadData() {
    if (!this.id) {
      this.msgSrv.error('请选择有效数据');
      return;
    }
    const { success } = this.reqGet(`${this.baseUri}/${this.id}`);
    success!.subscribe((res: IJsonTable) => {
      this.read?.setFormData(res.data);
    });
  }

  //#endregion

  //#region 对话框相关
  override initDialog(params: IKVPaire) {
    this.id = params['id'];
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    setTimeout(() => {
      this.getReadData();
    });
  }

  reset(): Observable<NzSafeAny> {
    return new Observable<NzSafeAny>(() => {
      this.read.resetFormData();
    });
  }

  //#endregion
}
