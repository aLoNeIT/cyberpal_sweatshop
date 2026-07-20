import { FormProperty, SFUISchemaItem, SFValue } from '@delon/form';
import { NzButtonType } from 'ng-zorro-antd/button';
import { NzSafeAny, NzSizeLDSType } from 'ng-zorro-antd/core/types';

import { InputButtonWidget } from './input-button.widget';
import { IEventEmitter } from '../../model/public-api';

/**
 * 带有按钮的输入框组件
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-21
 * @export
 * @interface SFInputButtonWidgetSchema
 * @extends {SFUISchemaItem}
 */
export interface SFInputButtonWidgetSchema extends SFUISchemaItem {
  /**
   * 按钮文本
   */
  buttonText?: string;
  /**
   * 按钮类型
   */
  buttonType?: NzButtonType;
  /**
   * 按钮大小
   */
  buttonSize?: NzSizeLDSType;
  /**
   * 按钮图标类型
   */
  iconType?: string;
  /**
   * 按钮类型，是按钮或者图标
   */
  buttonStyle?: 'button' | 'icon';
  /**
   * 输入框提示语
   */
  placeholder?: '';
  /**
   * 输入框是否只读
   */
  readonly?: true;
  /**
   * 按钮是否禁用
   */
  disabled?: false;
  /**
   * 后置按钮点击事件
   *
   * @param {Event} $event dom点击事件
   * @param {FormProperty} property 当前组件对应的表单对象属性
   * @param {string} key 当前组件对应的数据键名
   * @param {NzSafeAny} data 当前组件父级所拥有的的完整数据
   */
  click?: ($event: IEventEmitter, property: FormProperty, key: string, data: NzSafeAny) => void;
  /**
   * 格式化数据函数，回调传递键名、值
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-20
   * @param {SFValue} value 当前组件值
   * @param {FormProperty} property 当前组件对应的表单对象属性
   * @param {string} key 当前组件对应的key
   * @param {SFValue} data 当前整体数据
   * @param {InputButtonWidget} widget 当前组件对象
   */
  formatText?: (value: SFValue, property: FormProperty, key: string, data: NzSafeAny, widget: InputButtonWidget) => string;
}
