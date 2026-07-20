import { STColumn } from '@delon/abc/st';

import { IDictItem } from '../../../model/public-api';
import { Driver } from './../driver';

/**
 * 字符型
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @class StringSTColumn
 * @extends {Driver}
 */
export class StringSTColumn extends Driver {
  fromDictItem(dictItem: IDictItem): STColumn {
    return {
      ...this.getDefaultSTColumn(dictItem),
      className: 'text-center'
    };
  }
}
