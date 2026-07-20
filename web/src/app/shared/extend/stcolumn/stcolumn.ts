import { STColumn } from '@delon/abc/st';

import { IDictItemSet } from '../../model/public-api';
import { Driver, ISTColumnConfig } from './driver';
import { BooleanSTColumn } from './driver/boolean';
import { DateTimeSTColumn } from './driver/datetime';
import { ImageSTColumn } from './driver/image';
import { NumberSTColumn } from './driver/number';
import { StringSTColumn } from './driver/string';

/**
 * 动态表单管理类
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @export
 * @class STColumnManager
 */
export class STColumnManager {
  /**
   * 驱动实例化对象
   */
  protected drivers: { [key: string]: Driver } = {};
  /**
   * 管理类实例化对象
   */
  protected static _instance: STColumnManager | null = null;

  /**
   * 从字典项集合获取处理后的STColumn
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-06
   * @param {IDictItemSet} dictItemSet
   * @returns {*}  {STColumn}
   */
  fromDictItemSet(dictItemSet: IDictItemSet): STColumn[] {
    // 列定义集合
    const columns: STColumn[] = [];

    // 遍历字典项集合
    Object.keys(dictItemSet).forEach((fieldname, idx, arr) => {
      const dictItem = dictItemSet[fieldname];
      let driver: Driver | null = null,
        driverType = 'string',
        column: STColumn;
      // 根据字典项类型实例化对应的驱动类进行转换
      switch (dictItem.type) {
        case 1:
        case 2:
          driverType = 'number';
          break;
        case 3:
        case 4:
        case 5:
          driverType = 'datetime';
          break;
        case 7:
          driverType = 'boolean';
          break;
        case 9:
          driverType = 'image';
          break;
      }
      driver = this.driver(driverType);
      column = driver.fromDictItem(dictItem);
      // 当前列必须是需要列表显示，且列宽大于0才显示出来
      if (1 == (dictItem.curd! & 1) && (column.width! as number) > 0) {
        columns.push(column);
      }
    });
    // 返回stcolumn[]
    return columns;
  }

  driver(driverType: string, config: ISTColumnConfig = {}, force: boolean = false): Driver {
    if (true === force || !this.drivers[driverType]) {
      let instance: Driver | null = null;
      switch (driverType) {
        case 'number':
          instance = new NumberSTColumn(config);
          break;
        case 'datetime':
          instance = new DateTimeSTColumn(config);
          break;
        case 'boolean':
          instance = new BooleanSTColumn(config);
          break;
        case 'image':
          instance = new ImageSTColumn(config);
          break;
        default:
          instance = new StringSTColumn(config);
          break;
      }
      this.drivers[driverType] = instance;
    }
    return this.drivers[driverType];
  }
  /**
   * 获取单例对象
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-11
   * @static
   * @returns {*}  {STColumnManager}
   */
  static instance(): STColumnManager {
    if (null == STColumnManager._instance) {
      STColumnManager._instance = new STColumnManager();
    }
    return STColumnManager._instance;
  }
}
