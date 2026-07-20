import { IKVPaire } from './core';

/**
 * 应用内表单配置结构
 *
 * @author 王阮强(wangruanqiang@hongshanhis.com)
 * @date 2024-03-27
 * @export
 * @interface IAppXForm
 */
export interface IAppXForm {
  form: IKVPaire; // 表单属性
  item: IKVPaire[]; // 表单组件属性
}
