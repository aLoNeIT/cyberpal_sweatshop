import { FormProperty, SFUISchemaItem, SFValue } from '@delon/form';

import { ViewWidget } from './view.widget';

export interface SFViewWidgetSchema extends SFUISchemaItem {
  /**
   * 格式化数据函数，回调传递键名、值
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-20
   * @param {SFValue} value 当前组件值
   * @param {FormProperty} formProperty 当前组件对应的表单对象属性
   * @param {string} key 当前组件对应的key
   * @param {SFValue} data 当前整体数据
   * @param {ViewWidget} widget 当前组件对象
   */
  formatText?: (value: SFValue, formProperty: FormProperty, key: string, data: SFValue, widget: ViewWidget) => string;
}
