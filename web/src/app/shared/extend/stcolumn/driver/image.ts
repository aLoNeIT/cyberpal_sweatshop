import { STColumn } from '@delon/abc/st';

import { IDictItem } from '../../../model/public-api';
import { Driver } from './../driver';

/**
 * 图片类型
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @class ImageSTColumn
 * @extends {Driver}
 */
export class ImageSTColumn extends Driver {
  fromDictItem(dictItem: IDictItem): STColumn {
    return {
      ...this.getDefaultSTColumn(dictItem),
      type: 'widget',
      width: 150,
      format: undefined,
      widget: {
        type: 'img',
        params: ({ record, column }) => ({ img: record[column.index as string] })
      }
    };
  }
}
