import { STColumn } from '@delon/abc/st';
import { CurrencyFormatOptions } from '@delon/util';

import { IDictItem } from '../../../model/public-api';
import { Driver } from './../driver';

/**
 * 数值型
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @class NumberSTColumn
 * @extends {Driver}
 */
export class NumberSTColumn extends Driver {
  fromDictItem(dictItem: IDictItem): STColumn {
    let column = {
      ...this.getDefaultSTColumn(dictItem),
      type: dictItem.key_dict! > 0 ? '' : 2 == dictItem.subtype ? 'currency' : 'number',
      default: dictItem.default || '0'
    } as STColumn;
    // 判断子类型
    switch (dictItem.subtype) {
      case 2:
        // 针对货币类型做额外处理
        const unit = '' != dictItem.unit && ['yuan', 'cent'].indexOf(dictItem.unit!) >= 0 ? dictItem.unit : 'yuan';
        const unitI18n = 'cent' == unit ? '元' : '分';
        column = {
          ...column,
          title: {
            text: column.title as string,
            optional: `（${unitI18n}）`
          },
          currency: {
            format: {
              startingUnit: unit
            } as CurrencyFormatOptions
          },
          format: undefined
        };
        break;
      default:
        break;
    }
    return column;
  }
}
