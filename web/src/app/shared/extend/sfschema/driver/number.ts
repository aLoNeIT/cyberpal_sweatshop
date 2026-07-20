import { FormProperty, SFSchema, SFSelectWidgetSchema, SFUISchemaItem, SFValue } from '@delon/form';
import { enumFromSelect, isVSStr } from '../../../utils/function';

import { IDictItem } from '../../../model/public-api';
import { Driver, SFSchemaUIType } from './../driver';

/**
 * 数值型
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @class NumberSFSchema
 * @extends {Driver}
 */
export class NumberSFSchema extends Driver {
  fromDictItem(dictItem: IDictItem, uiType: SFSchemaUIType, curd: number): SFSchema | SFSchema[] {
    let ui = {
      ...this.getDefaultUI(dictItem, uiType, curd),
      widgetWidth: 'condition' == uiType ? (dictItem.input_width! || this.config.inputWidth!) - 100 : null
    } as SFUISchemaItem;
    let schema: SFSchema = {
      ...this.getDefaultSchema(dictItem, curd),
      default:
        'condition' == uiType
          ? null
          : undefined === dictItem.default || '' === dictItem.default || null === dictItem.default
            ? ''
            : Number.parseInt(dictItem.default)
    };
    // 取值范围配置
    if (dictItem.min! <= dictItem.max!) {
      schema = { ...schema, minimum: dictItem.min, maximum: dictItem.max, exclusiveMaximum: false, exclusiveMinimum: false };
    } else {
      schema = { ...schema, minimum: -Infinity, maximum: Infinity, exclusiveMaximum: false, exclusiveMinimum: false };
    }
    // 判断是否有后缀单位
    if (dictItem.unit) {
      ui = { ...ui, unit: dictItem.unit };
    } else if (dictItem.key_dict! > 0) {
      // 外键组件
      ui = {
        ...ui,
        widget: 'input-button',
        buttonStyle: 'button', // buttonStyle: 'condition' == uiType ? 'icon' : 'button',
        buttonType: 'default',
        readonly: true,
        formatText: (value: SFValue, formProperty: FormProperty, key: string, data: SFValue): string => {
          if (isVSStr(value.toString())) {
            return value;
          }
          let text: string = '';
          if (dictItem.key_dict! > 0) {
            // 存在外键关联
            text = data[dictItem.key_show!] || '';
          } else if (dictItem.show_dict! > 0) {
            // 存在外显关联
            text = data[dictItem.show_field!] || '';
          }
          return '' == text ? value : `${value}-${text}`;
        }
      };
      schema = { ...schema, type: 'string' };
    } else if (dictItem.select) {
      schema = { ...schema, enum: enumFromSelect(dictItem.select!) };
      // 组装下拉框
      ui = { ...ui, widget: 'select' } as SFSelectWidgetSchema;
    }
    if (8 == curd) {
      ui = {
        ...ui,
        widget: 'view',
        formatText: (value: SFValue, formProperty: FormProperty, key: string, data: SFValue): string => {
          let text: string = '';
          if (dictItem.key_dict! > 0) {
            // 存在外键关联
            text = data[dictItem.key_show!] || '';
          } else if (dictItem.show_dict! > 0) {
            // 存在外显关联
            text = data[dictItem.show_field!] || '';
          } else if ('' != dictItem.select) {
            // 存在自定义显示内容
            enumFromSelect(dictItem.select!).every(item => {
              if (item.value == value) {
                text = item.label;
                return false;
              }
              return true;
            });
          } else if (1 == dictItem.type && 2 == dictItem.subtype) {
            value = (parseFloat((value || '0').toString()) / 100).toFixed(2);
          }
          return '' == text ? value : `${value}-${text}`;
        }
      };
    }
    return { ...schema, ui: ui };
  }
}
