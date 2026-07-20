import { Component, OnInit } from '@angular/core';
import { FormProperty, SFComponent, SFSchema } from '@delon/form';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Observable, Subscription } from 'rxjs';
import { DictService, CommonService } from '@core';
import { BaseComponent } from '../base.component';
import { YzbDialogComponent } from '../../common/yzb-dialog.component';
import { SFInputButtonWidgetSchema } from '../../../json-schema/input-button/schema';
import { ITinymceData, UploadObservable } from '../../../json-schema/tinymce/tinymce.widget';
import {
  Dict,
  DictItem,
  IDictComponentPaire,
  IEventEmitter,
  IJsonTable,
  IKVPaire,
  IUploadFileData,
  IYzbDialogComponent
} from '../../../model/public-api';
import { parseName, vs2Str } from '../../../utils/function';

import { SFTinymceWidgetSchema } from './../../../json-schema/tinymce/schema';
import { SFUploadWidgetSchema } from '@delon/form/widgets/upload';
import { SHARED_IMPORTS } from '@shared';

@Component({
  template: '',
  imports: SHARED_IMPORTS
})
export class BaseCurdComponent extends BaseComponent implements OnInit, IYzbDialogComponent {
  //#region 当前组件基础

  /**
   * curd类型，1刷新；2新增；4修改；8读取；16删除
   */
  protected curd: number = 15;
  /**
   * 字典对象
   */
  dict!: Dict;
  /**
   * 模块标题
   */
  title: string = '';
  /**
   * 数据接口地址
   */
  protected baseUri: string = '';
  /**
   * 菜单编码
   */
  protected menuCode: string = '';
  /**
   * 字典id
   */
  protected dictId: number = 0;
  /**
   * 应用类型，-1代表后台自行判定
   */
  protected appType: number = -1;
  /**
   * 对话框服务
   */
  protected get dialogSrv(): NzModalService {
    return this.injector.get(NzModalService);
  }
  /**
   * 字典服务
   */
  protected get dictSrv(): DictService {
    return this.injector.get(DictService);
  }

  /**
   * 通用服务
   */
  protected get commonSrv(): CommonService {
    return this.injector.get(CommonService);
  }

  override ngOnInit() {
    super.ngOnInit();
    if (this.dictId) {
      this.dictSrv.get(this.dictId, this.appType).subscribe(([dict]) => {
        if (!dict) {
          this.msgSrv.error(`字典数据获取失败[${this.dictId}]`);
          return;
        }
        this.dict = new Dict(dict);
      });
    }
  }

  /**
   * 字典对应的组件类型，这里需要提前定义好
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-25
   * @protected
   * @type {IDictComponentPaire}
   */
  protected dictComponent: IDictComponentPaire = {};
  InputButtonParams: IKVPaire = {};
  /**
   * 表单元素input-form组件的点击事件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-21
   * @protected
   * @param {Event} $event dom事件
   * @param {FormProperty} property 表单元素属性，用于和表单数据交互
   * @param {string} key 表单元素对应的数据key
   * @param {any} data 当前表单完整数据
   */
  protected onInputButtonClick($event: IEventEmitter, property: FormProperty, key: string, data: any) {
    // 判断字典是否存在该字典项
    const dictItem = this.dict.getItem(key);
    // 判断相应数据是否存在
    if (dictItem && dictItem.key_dict >= 0 && this.dictComponent[dictItem.key_dict]) {
      const component = this.dictComponent[dictItem.key_dict];
      this.modal
        .createStatic(
          YzbDialogComponent,
          {
            autoClose: false,
            componentType: component,
            params: this.InputButtonParams,
            options: {
              title: `查询数据`,
              buttons: [
                {
                  title: '关闭',
                  click: (component: IYzbDialogComponent, modalRef: NzModalRef, $event: NzSafeAny) => {
                    component.close().subscribe(data => {
                      modalRef.close(data);
                    });
                  }
                },
                {
                  title: '选择',
                  type: 'primary',
                  click: (component: IYzbDialogComponent, modalRef: NzModalRef, $event: NzSafeAny) => {
                    component.submit().subscribe(selectRow => {
                      //字典生成页面多选模式处理
                      if (Array.isArray(selectRow)) {
                        property.setValue(`已选择${selectRow.length}条`, false);
                        property.updateValueAndValidity({ updateValue: selectRow });
                        modalRef.close(selectRow);
                        return;
                      }
                      // 统一处理前缀
                      const prefix = parseName(dictItem.key_table, 0),
                        keyField =
                          '' !== dictItem.key_join_name
                            ? dictItem.key_field.toLowerCase().replace(`${dictItem.key_join_name.toLowerCase()}_`, '')
                            : dictItem.key_field.toLowerCase().replace(`${prefix}_`, ''),
                        keyShow =
                          '' !== dictItem.key_join_name
                            ? dictItem.key_show.toLowerCase().replace(`${dictItem.key_join_name.toLowerCase()}_`, '')
                            : dictItem.key_show.toLowerCase().replace(`${prefix}_`, '');
                      // 将选中数据写入到当前组件内
                      property.setValue(vs2Str(selectRow[keyField], selectRow[keyShow]), false);
                      // property.widget.detectChanges();
                      // 遍历字典对象，对于配置了link属性的进行数据提取
                      this.dict.eachItem((key, item) => {
                        if (item.link_dict > 0) {
                          // 处理前缀
                          const linkField = item.link_field.toLowerCase().replace(`${prefix}_`, '');
                          // 配置了字典关联，则读取关联字段写入当前字典项对应字段
                          data[item.fieldname] = item.link_field;
                        }
                        return true;
                      });
                      modalRef.close(selectRow);
                    });
                  }
                }
              ]
            }
          },
          {
            size: 'lg'
          }
        )
        .subscribe(data => {
          // console.log(data);
        });
    }
  }

  //#endregion

  //#region 子组件

  onInitForm($event: IEventEmitter) {
    const schemas: SFSchema = $event.data,
      form: SFComponent = $event.source;
    Object.keys(schemas.properties as SFSchema).every(key => {
      const schema = schemas.properties![key],
        ui = schema.ui as SFUploadWidgetSchema,
        appTypeName = this.privilegeSrv.appTypeName;
      switch (ui.widget) {
        case 'upload':
          ui.action = `${appTypeName}/v1/file?group=public`;
          ui.customRequest = (item: NzUploadXHRArgs): Subscription => {
            const formData = new FormData();
            formData.append('file', item.postFile as File);
            return this.http.post(ui.action as string, formData).subscribe({
              next: (res: IJsonTable) => {
                if (0 !== res.state) {
                  // item.onError!(res, item.file!);
                  // 失败文件置空
                  form.getProperty(`/${key}`)?.widget?.reset(null);
                  this.msgSrv.error(`${res.msg}[${res.state}]`);
                  return;
                }
                let UploadFileData: IUploadFileData = {
                  id: res.data.id,
                  url: res.data.url
                };
                item.onSuccess!(UploadFileData, item.file!, res);
              },
              error: err => {
                console.error(err);
                this.msgSrv.error('系统繁忙，请稍后再试');
              },
              complete: () => {
                this.cdr.detectChanges();
              }
            });
          };
          break;
        case 'input-button':
          // 外键输入框
          (ui as SFInputButtonWidgetSchema).click = ($event: IEventEmitter, property: FormProperty, key: string, data: any) => {
            this.onInputButtonClick($event, property, key, data);
          };
          break;
        case 'tinymce':
          (ui as SFTinymceWidgetSchema).upload = (file: File, type: number): UploadObservable => {
            return new Observable<ITinymceData>(observer => {
              // 这里发起网络请求
              const uri = `${appTypeName}/v1/file?group=public`,
                formData = new FormData();
              formData.append('file', file);
              formData.append('category', type.toString());
              this.http.post(uri, formData).subscribe({
                next: (res: IJsonTable) => {
                  if (0 !== res.state) {
                    this.msgSrv.error(`${res.msg}[${res.state}]`);
                    return;
                  }
                  // 发送成功数据
                  observer.next({
                    url: res.data.url
                  });
                },
                error: err => {
                  console.error(err);
                  this.msgSrv.error('系统繁忙，请稍后再试');
                },
                complete: () => {
                  this.cdr.detectChanges();
                }
              });
            });
          };
          break;
        default:
          // nothing to do
          break;
      }
      if ('upload' == ui.widget) {
      } else if ('input-button' == ui.widget) {
      }
      return true;
    });
  }
  /**
   * 获取数据后，进行二次处理
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-04-29
   * @param {IEventEmitter} $event 包含source、data、extend三个节点
   */
  onGetFormData($event: IEventEmitter) {}
  /**
   * 设置数据前，进行二次处理
   *
   * @author 王阮强(wangruanqiang@hongshanhis.com)
   * @date 2021-11-11
   * @param {IEventEmitter} $event 包含source、data、extend三个节点
   */
  onSetFormData($event: IEventEmitter) {
    const data = $event.data,
      dict = $event.extend.dict;
    dict.eachItem((key: string, item: DictItem) => {
      switch (item.type) {
        case 9:
        case 10:
          // 处理图片问题
          // 获取当前字典关联外键字段名称
          const keyShow = item.key_show,
            // 获取当前值及外键值
            value = data[key],
            showValue = data[keyShow] as string;
          if (showValue) {
            const form = $event.source as SFComponent,
              name = showValue.substring(showValue.lastIndexOf('/') + 1),
              // 获取组件元素定义
              schema = form.schema.properties![key] as SFSchema,
              ui = schema.ui as SFUploadWidgetSchema,
              // 获取url及资源id重定义值
              urlReName = ui.urlReName as string,
              resReName = ui.resReName as string,
              // 文件对象
              file: { [key: string]: NzSafeAny } = {};
            // 文件对象赋值
            (file[urlReName] = showValue), (file['response'] = {}), (file['response'][resReName] = value);
            data[key] = [{ ...file, uid: value.toString(), name: name, status: 'done' }];
          }
          break;
        default:
          break;
      }
      return true;
    });
  }

  //#endregion

  //#region 对话框相关

  /**
   * 是否是对话框形式
   */
  isDialog: boolean = false;
  /**
   * 是否是对话框形式
   */
  isDraw: boolean = false;
  /**
   * 对话框初始化，如果以对话框形式打开当前界面，则会执行该方法
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-19
   * @param {IKVPaire} params
   */
  initDialog(params: IKVPaire) {
    this.isDialog = true;
  }
  // 窗体点击关闭触发
  close(): Observable<any> {
    return new Observable<any>(observer => {
      observer.next();
    });
  }
  // 窗体点击确定触发
  submit(): Observable<any> {
    return new Observable<any>(observer => {
      observer.next();
    });
  }

  //#endregion
}
