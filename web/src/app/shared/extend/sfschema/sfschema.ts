import { SFSchema } from '@delon/form';

import { IDictItem, IDictItemSet } from '../../model/public-api';
import { Driver, ISFSchemaConfig, SFSchemaUIType } from './driver';
import { BooleanSFSchema } from './driver/boolean';
import { DateTimeSFSchema } from './driver/datetime';
import { FileSFSchema } from './driver/file';
import { NumberSFSchema } from './driver/number';
import { StringSFSchema } from './driver/string';
import { TextAreaSFSchema } from './driver/textarea';

/**
 * 当前支持的驱动类型
 */
export const SFSchemaDriverType = ['string', 'number', 'datetime', 'boolean', 'file'];

/**
 * 动态表单管理类
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @export
 * @class SFSchemaManager
 */
export class SFSchemaManager {
  /**
   * 驱动实例化对象
   */
  protected drivers: { [key: string]: Driver } = {};
  /**
   * 管理类实例化对象
   */
  protected static _instance: SFSchemaManager | null = null;

  /**
   * 从字典项集合获取处理后的SFSchema
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-06
   * @param {IDictItemSet} dictItemSet 字典项值集合
   * @param {SFSchemaUIType} [uiType='form'] 配置项类型
   * @param {number} [curd=15] curd类型
   * @returns {*}  {(SFSchema | SFSchema[])} 返回处理后的配置项
   */
  fromDictItemSet(dictItemSet: IDictItemSet, uiType: SFSchemaUIType = 'form', curd: number = 15): SFSchema {
    const sfSchema: SFSchema = {};
    // 遍历字典项集合
    Object.keys(dictItemSet).forEach((fieldname, idx, arr) => {
      const schema: SFSchema | SFSchema[] = this.fromDictItem(dictItemSet[fieldname], uiType, curd);
      if (Array.isArray(schema)) {
        schema.forEach((item: SFSchema) => {
          sfSchema[item.$comment!] = item;
        });
      } else {
        sfSchema[schema.$comment!] = schema;
      }
    });
    // 返回可以直接使用的SFSchema对象
    return {
      properties: sfSchema,
      ui: {
        grid: {
          span: 6,
          arraySpan: 4
        }
      }
    };
  }
  /**
   * 通过字典项获取配置信息
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-04-28
   * @param {IDictItem} dictItem 字典数据配置
   * @param {SFSchemaUIType} [uiType='form'] 配置项类型
   * @param {number} [curd=15] curd类型
   * @returns {*}  {(SFSchema | SFSchema[])} 返回处理后的配置项
   */
  fromDictItem(dictItem: IDictItem, uiType: SFSchemaUIType = 'form', curd: number = 15): SFSchema | SFSchema[] {
    let driver: Driver | null = null,
      driverType = 'string';
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
      case 8:
        driverType = 'textarea';
        break;
      case 9:
      case 10:
        driverType = 'file';
        break;
    }
    driver = this.driver(driverType);
    return driver.fromDictItem(dictItem, uiType, curd);
  }
  /**
   * 获取驱动对象
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-18
   * @param {string} driverType 驱动类型
   * @param {ISFSchemaConfig} [config={}] 配置信息
   * @param {boolean} [force=false] 是否强制创建新对象
   * @returns {*}  {Driver} 返回获取到的驱动实例对象
   */
  driver(driverType: string, config: ISFSchemaConfig = {}, force: boolean = false): Driver {
    if (true === force || !this.drivers[driverType]) {
      let instance: Driver | null = null;
      switch (driverType) {
        case 'number':
          instance = new NumberSFSchema(config);
          break;
        case 'datetime':
          instance = new DateTimeSFSchema(config);
          break;
        case 'boolean':
          instance = new BooleanSFSchema(config);
          break;
        case 'file':
          instance = new FileSFSchema(config);
          break;
        case 'textarea':
          instance = new TextAreaSFSchema(config);
          break;
        default:
          instance = new StringSFSchema(config);
          break;
      }
      this.drivers[driverType] = instance;
    }
    return this.drivers[driverType];
  }

  static instance(): SFSchemaManager {
    if (null == SFSchemaManager._instance) {
      SFSchemaManager._instance = new SFSchemaManager();
    }
    return SFSchemaManager._instance;
  }
}
