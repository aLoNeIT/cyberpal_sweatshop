import { formatDate } from '@angular/common';
import { SFDateWidgetSchema, SFSchema, SFUISchemaItem, SFValue } from '@delon/form';
import { IDictItem } from '../../../model/public-api';
import { Driver, SFSchemaUIType } from './../driver';

/**
 * 日期时间型
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @class NumberSFSchema
 * @extends {Driver}
 */
export class DateTimeSFSchema extends Driver {
  fromDictItem(dictItem: IDictItem, uiType: SFSchemaUIType, curd: number): SFSchema | SFSchema[] {
    let ui = {
        ...this.getDefaultUI(dictItem, uiType, curd),
        mode: 'condition' == uiType ? 'range' : 'date',
        placeholder: 'condition' == uiType ? '' : `请选择${dictItem.name}`
      } as SFUISchemaItem,
      schema = {
        ...this.getDefaultSchema(dictItem, curd),
        default: 'condition' == uiType ? null : dictItem.default ? dictItem.default : new Date()
      } as SFSchema,
      subSchema: SFSchema | null = null;
    // 根据字典类型做差异化配置
    switch (dictItem.type) {
      case 3: // 日期
        schema = {
          ...schema,
          default: 'condition' == uiType ? null : dictItem.default && dictItem.default !== '0' ? dictItem.default : '' // default: startOfToday(),
        };
        ui = {
          ...ui,
          widget: 'date',
          displayFormat: dictItem.select || 'yyyy-MM-dd',
          end: 'condition' == uiType ? `${dictItem.fieldname}_end` : null,
          width: 'condition' == uiType ? 360 : dictItem.input_width || this.config.inputWidth,
          showTime: 'condition' != uiType,
          mode: 'condition' == uiType ? 'range' : 'date'
        } as SFDateWidgetSchema;
        break;
      case 4: // 时间
        schema = {
          ...schema // default: startOfToday(),
        };
        ui = {
          ...ui,
          widget: 'time',
          displayFormat: dictItem.select || 'HH:mm:ss',
          end: 'condition' == uiType ? `${dictItem.fieldname}_end` : null
        } as SFDateWidgetSchema;
        break;
      case 5: // 时间日期
        schema = {
          ...schema // default: startOfToday(),
        };
        ui = {
          ...ui,
          widget: 'date',
          displayFormat: dictItem.select || ('condition' == uiType ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss'),
          showTime: 'condition' != uiType,
          mode: 'condition' == uiType ? 'range' : 'date',
          end: 'condition' == uiType ? `${dictItem.fieldname}_end` : null,
          width: 'condition' == uiType ? 360 : dictItem.input_width || this.config.inputWidth
        } as SFDateWidgetSchema;
        // if ('condition' == uiType) {
        //   subSchema = {
        //     type: 'number',
        //     // default: startOfTomorrow(),
        //     $comment: `${dictItem.fieldname}_end`,
        //     readOnly: schema.readOnly,
        //     ui: {
        //       widget: 'date',
        //       end: `${dictItem.fieldname}_end`,
        //       hidden: ui.hidden
        //     } as SFDateWidgetSchema
        //   };
        // }
        break;
    }
    if ('condition' == uiType) {
      subSchema = {
        type: 'number',
        // default: startOfTomorrow(),
        $comment: `${dictItem.fieldname}_end`,
        readOnly: schema.readOnly,
        ui: {
          // widget: ui.widget,
          end: `${dictItem.fieldname}_end`,
          hidden: ui.hidden
        } as SFDateWidgetSchema
      };
    }
    if (8 == curd) {
      ui = {
        ...ui,
        widget: 'view',
        formatText: (value: SFValue): string => {
          let formatStr: string;
          switch (dictItem.type) {
            case 3:
              formatStr = dictItem.select || 'yyyy-MM-dd';
              break;
            case 4:
              formatStr = dictItem.select || 'HH:mm:ss';
              break;
            default:
              formatStr = dictItem.select || 'yyyy-MM-dd HH:mm:ss';
              break;
          }
          return Number.isInteger(value) && 0 < (value as number) ? formatDate(value, formatStr, 'zh') : '-';
        }
      };
    }
    return 'condition' == uiType ? [{ ...schema, ui: ui }, subSchema] : { ...schema, ui: ui };
  }
}
