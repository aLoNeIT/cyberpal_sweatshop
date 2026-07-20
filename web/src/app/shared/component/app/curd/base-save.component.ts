import { Component, ViewChild } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { Observable } from 'rxjs';
import { IKVPaire, IJsonTable, IYzbDialogFormComponent } from '../../../model/public-api';

import { BaseCurdComponent } from './base-curd.component';
import { YzbFormComponent } from '../../base/curd/yzb-form.component';
import { SHARED_IMPORTS } from '@shared';

@Component({
  templateUrl: './base-save.component.html',
  imports: [...SHARED_IMPORTS, YzbFormComponent]
})
export class BaseSaveComponent extends BaseCurdComponent implements IYzbDialogFormComponent {
  //#region 当前组件基础
  protected override initialize(): void {
    super.initialize();
    this.curd = 2;
  }
  //#endregion

  //#region save组件相关

  @ViewChild('save', { static: false }) save!: YzbFormComponent;

  //#endregion

  //#region 对话框组件相关

  reset(): Observable<NzSafeAny> {
    return new Observable<NzSafeAny>(observer => {
      this.save.resetFormData();
    });
  }
  /**
   * 数据提交时候的处理，可以对data数据进行处理
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-29
   * @protected
   * @param {IKVPaire} data 提交的数据
   */
  protected onSubmit(data: IKVPaire) {}
  /**
   * 数据提交
   */
  override submit(): Observable<NzSafeAny> {
    return new Observable<NzSafeAny>(observer => {
      // 获取当前页面数据
      this.save.getFormData().subscribe(data => {
        if (this.loading) {
          this.msgSrv.warning('数据正在提交，请稍后再试');
          return;
        }
        if (data['img_head_file']) {
          data['img_head_file'] = data['img_head_file'].id;
        }
        // 向后台发起请求
        this.loading = true;
        this.http.post(this.baseUri, data).subscribe({
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
}
