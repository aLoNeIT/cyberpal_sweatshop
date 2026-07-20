import { STColumn, STData } from '@delon/abc/st';

import { IDictItem } from '../../../model/public-api';
import { Driver } from './../driver';
import { formatSecTime } from '../../../utils/function';

/**
 * 日期时间型
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @class DateTimeSTColumn
 * @extends {Driver}
 */
export class DateTimeSTColumn extends Driver {
  fromDictItem(dictItem: IDictItem): STColumn {
    return {
      ...this.getDefaultSTColumn(dictItem),
      type: 'date',
      format: (item: STData, col: STColumn, index: number): string => {
        // 数据格式化函数，该数据都是秒级时间戳
        let formatStr: string = '';
        switch (dictItem.type) {
          case 3: // 日期
            formatStr = 'yyyy-MM-dd';
            break;
          case 4: // 时间
            formatStr = 'HH:mm:ss';
            break;
          default:
            formatStr = 'yyyy-MM-dd HH:mm:ss';
            break;
        }
        return item[col.index as string] ? formatSecTime(item[col.index as string], formatStr) : '-';
      },
      className: 'text-center'
    };
  }
}
