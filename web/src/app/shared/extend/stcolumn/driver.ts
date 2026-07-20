import { STColumn, STData } from '@delon/abc/st';
import { deepMerge } from '@delon/util';
import { IDictItem } from '../../model/table';
import { showFromSelect } from '../../utils/function';
export interface ISTColumnConfig {
  showWidth?: number;
}

/**
 * 动态表单驱动基类
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @abstract
 * @class Driver
 */
export abstract class Driver {
  /**
   * 默认配置参数
   */
  protected config: ISTColumnConfig = {
    showWidth: 100
  };
  /**
   * 设置当前对象配置信息
   */
  public setConfig(config: ISTColumnConfig) {
    this.config = deepMerge(this.config, config);
  }

  constructor(config: ISTColumnConfig = {}) {
    this.config = deepMerge(this.config, config);
  }

  /**
   * 从字典项获取
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-06
   * @abstract
   * @param {IDictItem} dictItem 字典项
   * @returns {*}  {STColumn}
   */
  abstract fromDictItem(dictItem: IDictItem): STColumn;

  protected showWidth(showWidth: number): string | number {
    if (-1 == showWidth) {
      return this.config.showWidth!;
    }
    return showWidth;
  }

  protected getDefaultSTColumn(dictItem: IDictItem): STColumn {
    const column: STColumn = {
      type: '',
      index: dictItem.fieldname,
      // index: dictItem.key_dict! > 0 ? dictItem.key_show : dictItem.fieldname,
      title: dictItem.name,
      width: this.showWidth(dictItem.show_width!),
      default: dictItem.default || '-',
      className: 'text-center',
      sort:
        undefined != dictItem.sort && 0 == dictItem.sort
          ? undefined
          : {
              default: 0 == dictItem.sort! % 2 ? 'descend' : 'ascend',
              compare: null
            },
      iif: () => {
        return 0 != dictItem.show_width;
      },
      format: (item: STData, col: STColumn, index: number): string => {
        if (dictItem.select) {
          const formatStr = dictItem.select ? showFromSelect(item[col.index as string], dictItem.select) : item[col.index as string];
          return formatStr && '' !== formatStr ? `${formatStr}` : '-';
        } else if (dictItem.key_dict! > 0) {
          return item[dictItem.key_show!] === null || item[dictItem.key_show!] === '' ? '-' : `${item[dictItem.key_show!]}`;
        } else {
          return item[dictItem.fieldname!] === null || item[dictItem.fieldname!] === '' ? '-' : `${item[dictItem.fieldname!]}`;
        }
      }
    } as STColumn;
    return column;
  }
}
