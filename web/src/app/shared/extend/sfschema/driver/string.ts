import { SFSchema, SFSelectWidgetSchema, SFValue, FormProperty } from '@delon/form';
import { deepCopy } from '@delon/util';
import { enumFromSelect, isVSStr } from '../../../utils/function';

import { IDictItem } from '../../../model/public-api';
import { Driver, SFSchemaUIType } from './../driver';

/**
 * 字符型
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @class NumberSFSchema
 * @extends {Driver}
 */
export class StringSFSchema extends Driver {
  fromDictItem(dictItem: IDictItem, uiType: SFSchemaUIType, curd: number): SFSchema | SFSchema[] {
    let ui = this.getDefaultUI(dictItem, uiType, curd);
    let schema: SFSchema = this.getDefaultSchema(dictItem, curd);
    // 长度限制
    if (dictItem.min! <= dictItem.max!) {
      schema = { ...schema, maxLength: dictItem.max!, minLength: dictItem.min! };
    }
    // 验证规则
    if (dictItem.regex) {
      dictItem.regex = dictItem.regex.slice(1, -1); //去掉首尾/
      schema = { ...schema, pattern: dictItem.regex! };
      ui.errors = { ...ui.errors, pattern: dictItem.regex_msg! };
    }
    // 下拉框配置
    if (dictItem.select) {
      schema = { ...schema, enum: enumFromSelect(dictItem.select!, '-', false) };
      ui = { ...ui, widget: 'select' } as SFSelectWidgetSchema;
    }
    if (dictItem.key_dict! > 0) {
      ui = {
        ...deepCopy(ui),
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
          return '' == text ? value : isVSStr(value.toString()) ? value : `${value}-${text}`;
        }
      };
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
            enumFromSelect(dictItem.select!, '-', false).every(item => {
              if (item.value == value) {
                text = item.label;
                return false;
              }
              return true;
            });
          } else if (dictItem.pwded) {
            value = '********';
          }
          return '' == text ? value : `${value}-${text}`;
        }
      };
    }
    return { ...schema, ui: ui };
  }
}
