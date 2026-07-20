import { STColumn } from '@delon/abc/st';
import { ynFromSelect } from '../../../utils/function';

import { IDictItem } from '../../../model/public-api';
import { Driver } from './../driver';

/**
 * 布尔型
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @class BooleanSTColumn
 * @extends {Driver}
 */
export class BooleanSTColumn extends Driver {
  fromDictItem(dictItem: IDictItem): STColumn {
    return {
      ...this.getDefaultSTColumn(dictItem),
      type: 'yn',
      default: dictItem.default || '0',
      yn: ynFromSelect(dictItem.select as string)
    };
  }
}
