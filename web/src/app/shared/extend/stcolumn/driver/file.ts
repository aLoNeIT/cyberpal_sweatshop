import { STColumn, STComponent, STData } from '@delon/abc/st';

import { IDictItem } from '../../../model/public-api';
import { Driver } from './../driver';

/**
 * 文件型
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @class FileSTColumn
 * @extends {Driver}
 */
export class FileSTColumn extends Driver {
  fromDictItem(dictItem: IDictItem): STColumn {
    return {
      ...this.getDefaultSTColumn(dictItem),
      type: 'link',
      click: (record: STData, instance?: STComponent) => {
        // 直接跳转存在文件不存在直接跳转走了
        // 后面考虑使用blob等方法实现
        location.href = record[dictItem.fieldname!];
      }
    };
  }
}
