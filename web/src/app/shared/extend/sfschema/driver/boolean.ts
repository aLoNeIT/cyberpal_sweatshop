import { SFSchema, SFSchemaEnum, SFUISchemaItem, SFValue } from '@delon/form';
import { enumFromSelect } from '../../../utils/function';

import { IDictItem } from '../../../model/public-api';
import { Driver, SFSchemaUIType } from './../driver';

/**
 * 布尔型
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @class NumberSFSchema
 * @extends {Driver}
 */
export class BooleanSFSchema extends Driver {
  fromDictItem(dictItem: IDictItem, uiType: SFSchemaUIType, curd: number): SFSchema | SFSchema[] {
    let ui = { ...this.getDefaultUI(dictItem, uiType, curd), widget: 'condition' == uiType ? 'select' : null } as SFUISchemaItem,
      schema = {
        ...this.getDefaultSchema(dictItem, curd),
        enum: 'condition' == uiType ? enumFromSelect(dictItem.select || '0-否;1-是') : null,
        default:
          'condition' == uiType
            ? null
            : undefined === dictItem.default || '' === dictItem.default || null === dictItem.default
              ? ''
              : Number.parseInt(dictItem.default)
      } as SFSchema;
    if (8 == curd) {
      ui = {
        ...ui,
        widget: 'view',
        formatText: (value: SFValue): string => {
          let text: string = '-';
          enumFromSelect(dictItem.select || '0-否;1-是').every((item: SFSchemaEnum) => {
            if (item.value == value) {
              text = `${item.value}-${item.label}`;
              return false;
            }
            return true;
          });
          return text;
        }
      };
    }
    return { ...schema, ui: ui };
  }
}
