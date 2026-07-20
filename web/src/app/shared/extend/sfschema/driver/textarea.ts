import { SFSchema } from '@delon/form';

import { IDictItem } from '../../../model/public-api';
import { Driver, SFSchemaUIType } from './../driver';

/**
 * 长文本
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @class NumberSFSchema
 * @extends {Driver}
 */
export class TextAreaSFSchema extends Driver {
  fromDictItem(dictItem: IDictItem, uiType: SFSchemaUIType, curd: number): SFSchema | SFSchema[] {
    let ui = this.getDefaultUI(dictItem, uiType, curd),
      schema = this.getDefaultSchema(dictItem, curd);

    if (2 == dictItem.subtype) {
      // 富文本编辑器
      ui = {
        ...ui,
        widget: 'tinymce',
        grid: {
          span: 24
        },
        width: undefined
      };
    } else {
      if (dictItem.min! <= dictItem.max!) {
        schema = { ...schema, maxLength: dictItem.max!, minLength: dictItem.min! };
      }
      ui = {
        ...ui,
        widget: 'textarea',
        maxCharacterCount: dictItem.max,
        autosize: false,
        grid: {
          span: 24
        },
        width: undefined
      };
    }
    if (8 == curd) {
      schema = { ...schema, readOnly: true };
    }
    return { ...schema, ui: ui };
  }
}
