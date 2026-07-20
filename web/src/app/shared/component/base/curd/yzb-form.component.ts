import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema } from '@delon/form';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { Observable } from 'rxjs';
import { str2VS } from '../../../utils/function';

import { YzbCurdComponent } from './yzb-curd.component';
import { SFSchemaManager } from '../../../extend/sfschema/sfschema';
import { Dict, DictItem, IEventEmitter, IKVPaire, IDict } from '../../../model/public-api';
import { SHARED_IMPORTS } from '@shared';

@Component({
  selector: 'yzb-form',
  imports: SHARED_IMPORTS,
  templateUrl: './yzb-form.component.html'
})
export class YzbFormComponent extends YzbCurdComponent {
  //#region 组件功能

  protected override onInitDict(dict: Dict) {
    super.onInitDict(dict);
    const dictData = dict.getData();
    this.initForm(dictData);
    this.initControl = false;
  }

  //#endregion

  //#region 表单配置

  schema: SFSchema = {
    properties: {}
  };

  @Input()
  ui: SFUISchema = {};

  data: NzSafeAny = {};

  /**
   * 表单组件
   */
  @ViewChild('form', { static: false }) protected form!: SFComponent;
  /**
   * 表单初始化事件
   */
  @Output() readonly initFormEvent = new EventEmitter<IEventEmitter>();

  /**
   * 初始化表单
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-15
   * @protected
   * @param {IDict} dict
   */
  protected initForm(dict: IDict) {
    // 获取动态表单管理器
    const sfSchemaManager = SFSchemaManager.instance();
    // 获取动态表单内容
    const schema = sfSchemaManager.fromDictItemSet(dict.dict_item!, 'form', this.curd);
    // 触发初始化时间，传递表单对象，允许分类进行修改
    this.initFormEvent.emit({
      data: schema,
      source: this.form
    });
    // 处理默认值
    if (this.data && 0 == Object.keys(this.data).length) {
      Object.keys(schema.properties!).forEach(key => {
        const property = schema.properties![key];
        if (!Object.prototype.hasOwnProperty.call(property, 'default')) {
          property.default = this.dict.getItem(key)?.default;
        }
      });
    }
    this.schema = schema;
  }
  /**
   * 表单数据处理事件
   */
  @Output() readonly getFormDataEvent = new EventEmitter<IEventEmitter>();

  onformError($event: any) {
    if ($event.length > 0) {
      console.log($event);
    }
  }
  /**
   * 获取表单数据
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-19
   * @returns {*}  {Observable<IKVPaire>} 返回observable对象
   */
  getFormData(): Observable<IKVPaire> {
    return new Observable<IKVPaire>(observer => {
      if (false === this.form.validator({ emitError: false })) {
        return;
      }
      const data: IKVPaire = {};
      // 遍历当前表单元素
      Object.keys(this.form.value).forEach(key => {
        const dictItem: DictItem | null = this.dict.getItem(key);
        // 不能存在对应字典项或者不是对应的curd类型则跳过或者是只读字段
        if (
          !dictItem ||
          this.curd !== (dictItem.curd & this.curd) ||
          this.curd !== (dictItem.inputed & this.curd) ||
          this.curd === (dictItem.readonly & this.curd)
        )
          return;
        switch (dictItem.type) {
          case 3:
          case 4:
          case 5:
            data[key] = Math.floor(this.form.value[key] / 1000);
            break;
          case 9:
          case 10:
            data[key] = this.form.value[key] || '';
            break;
          default:
            if (dictItem.key_dict > 0) {
              // 外键字段在当前界面显示的数据是带有-分割的
              if (this.form.value[key] !== undefined) {
                const vs = str2VS(this.form.value[key].toString());
                data[key] = vs.value;
              }
            } else {
              data[key] = 6 == dictItem.type || 8 == dictItem.type ? (this.form.value[key] as string).trim() : this.form.value[key];
            }
            break;
        }
      });
      /**
       * 触发父组件的数据处理，有机会处理数据
       */
      this.getFormDataEvent.emit({
        source: this.form,
        data: data,
        extend: {
          dict: this.dict
        }
      });
      observer.next(data);
    });
  }
  /**
   * 表单数据处理事件
   */
  @Output() readonly setFormDataEvent = new EventEmitter<IEventEmitter>();

  /**
   * 设置表单数据
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-25
   * @param {NzSafeAny} data 表单数据内容
   */
  setFormData(data: NzSafeAny) {
    // 处理数据
    Object.keys(data).forEach(key => {
      const dictItem = this.dict.getItem(key);
      if (dictItem && dictItem.type >= 3 && dictItem.type <= 5) {
        // 后端时间是秒，需要*1000变为毫秒
        data[key] *= 1000;
        // 0显示1970，需要转为空字符串
        if (data[key] == 0) {
          data[key] = '';
        }
      }
    });
    /**
     * 触发父组件的数据处理，有机会处理数据
     */
    this.setFormDataEvent.emit({
      source: this.form,
      data: data,
      extend: {
        dict: this.dict
      }
    });
    this.data = data;
  }
  /**
   * 重置表单数据
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-19
   */
  resetFormData() {
    this.dict.eachItem((key, item) => {
      if (this.form.formData![key]) {
        if (item.type == 9 || item.type == 10) {
          for (const iterator of this.form.formData![key]) {
            if (iterator.status) {
              iterator.status = 'done';
            }
          }
        }
      }

      return true;
    });
    this.form.reset();
  }
  //#endregion

  //#region 公用函数

  //#endregion
}
