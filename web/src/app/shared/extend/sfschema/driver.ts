import { ErrorData, FormProperty, PropertyGroup, SFSchema, SFUISchemaItem, SFValue } from '@delon/form';

import { IDictItem } from '../../model/public-api';

export type SFSchemaUIType = 'condition' | 'form';

export interface ISFSchemaConfig {
  // 输入框宽度
  inputWidth?: number;
  uiType?: SFSchemaUIType;
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
  protected config: ISFSchemaConfig = {
    inputWidth: 250
  };

  constructor(config: ISFSchemaConfig = {}) {
    this.setConfig(config);
  }

  setConfig(config: ISFSchemaConfig = {}) {
    this.config = { ...this.config, ...config };
  }
  /**
   * 获取全局的UI配置
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-15
   * @protected
   * @param {IDictItem} dictItem 字典项
   * @param {number} curd curd类型
   * @returns {*}  {SFUISchemaItem}
   */
  protected getDefaultUI(dictItem: IDictItem, uiType: SFSchemaUIType, curd: number): SFUISchemaItem {
    return {
      placeholder: dictItem.key_dict! > 0 ? `请选择${dictItem.name}` : `请输入${dictItem.name}`,
      width: dictItem.input_width || this.config.inputWidth,
      spanLabelFixed: 100,
      autocomplete: 'off',
      liveValidate: false,
      grid: {
        span: 8
      },
      hidden: 'condition' == uiType ? !dictItem.filtered : !(curd === (curd & dictItem.curd!) && curd == (curd & dictItem.inputed!)),
      showRequired: curd === (curd & dictItem.inputed!) && curd === (curd & dictItem.required!),
      widget: curd === (curd & dictItem.readonly!) ? 'view' : undefined,
      validator: (value: SFValue, formProperty: FormProperty, form: PropertyGroup): ErrorData[] => {
        // 基于字典规则进行校验
        // 校验必填
        if (
          0 < dictItem.required! && // 必须大于0才校验
          curd === (curd & dictItem.inputed!) && // 元素在当前操作类型显示时才校验
          curd === (curd & dictItem.required!) && // 当前操作类型在必填校验中
          ('' === value || null === value || undefined === value) // 只有值为此3种才算作未填写
        ) {
          return [{ keyword: 'required', message: `${dictItem.name}是必填项` }];
        }
        //
        return [];
      },
      errors: {
        required: `${dictItem.name}是必填项`
      }
    };
  }
  /**
   * 获取默认配置
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-18
   * @protected
   * @param {IDictItem} dictItem 字典项
   * @param {number} curd curd操作类型
   * @returns {*}  {SFSchema} 返回配置信息
   */
  protected getDefaultSchema(dictItem: IDictItem, curd: number): SFSchema {
    return {
      type: (() => {
        switch (dictItem.type) {
          case 1:
          case 2:
            return 'number';
          case 3:
          case 4:
          case 5:
            return 'number';
          case 7:
            return 'boolean';
          default:
            return 'string';
        }
      }).call(this),
      title: dictItem.name,
      $comment: dictItem.fieldname,
      default: dictItem.default
      // readOnly: curd == (curd & dictItem.readonly), // 只读
    } as SFSchema;
  }

  /**
   * 从字典项获取
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-06
   * @abstract
   * @param {IDictItem} dictItem 字典项
   * @param {SFSchemaUIType} uiType ui类型，表单或者条件选择区
   * @param {boolean} curd curd类型
   * @returns {*}  {SFSchema} 返回生成好的组件配置
   */
  abstract fromDictItem(dictItem: IDictItem, uiType: SFSchemaUIType, curd: number): SFSchema | SFSchema[];
}
