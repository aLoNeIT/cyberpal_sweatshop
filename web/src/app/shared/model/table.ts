import { NzButtonType } from 'ng-zorro-antd/button';

/**
 * 字典集合
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2020-12-28
 * @export
 * @interface IDictSet
 */
export interface IDictSet {
  [key: string]: IDict;
}
/**
 * @description 字典模型
 * @author 王阮强 <wangruanqiang@youzhibo.cn>
 * @date 2020-12-25
 * @export
 */
export interface IDict {
  id?: number;
  name?: string;
  tablename?: string;
  sub?: string;
  prefix?: string;
  dict_item?: IDictItemSet;
}
/**
 * 字典项集合
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2020-12-28
 * @export
 * @interface IDictItemSet
 */
export interface IDictItemSet {
  [key: string]: IDictItem;
}

/**
 * @description 字典模型
 * @author 王阮强 <wangruanqiang@youzhibo.cn>
 * @date 2020-12-25
 * @export
 */
export interface IDictItem {
  id?: number;
  dict?: number;
  name?: string;
  fieldname?: string;
  type?: number;
  subtype?: number;
  max?: number;
  min?: number;
  pk?: number;
  autoed?: number;
  pwded?: number;
  regex?: string;
  regex_msg?: string;
  unit?: string;
  show_width?: number;
  sort?: number;
  fuzzy?: number;
  key_dict?: number;
  key_table?: string;
  key_field?: string;
  key_show?: string;
  key_join_name?: string;
  key_join_type?: string;
  key_condition?: string;
  key_visibled?: number;
  key_width?: number;
  key_height?: number;
  link_dict?: number;
  link_table?: string;
  link_field?: string;
  show_dict?: number;
  show_table?: string;
  show_field?: string;
  default?: string;
  required?: number;
  inputed?: number;
  input_width?: number;
  show_order?: number;
  curd?: number;
  group?: string;
  select?: string;
  filtered?: number;
  readonly?: number;
}
/**
 * @description 用户模型
 * @author 王阮强 <wangruanqiang@youzhibo.cn>
 * @date 2020-12-17
 * @export
 */
export interface IUser {
  id?: number;
  acquirer?: number;
  acquirer_name?: string;
  organization?: number;
  organization_name?: string;
  app_type?: number;
  mp?: string;
  account?: string;
  pwd?: string;
  salt?: string;
  realname?: string;
  remark?: string;
  login_time?: number;
  login_num?: number;
  login_ip?: string;
  state?: number;
  create_time?: number;
  update_time?: number;
  delete_time?: number;
  position?: string;
  job?: string;
  job_name?: string;
  img_head?: string;
  sex?: number;
  need_change?: any;
  img_head_url?: any;
}
/**
 * 功能明晰
 */
export interface IFunctionDetail {
  id: number;
  function_code: string;
  module: string;
  controller: string;
  action: string;
  app_type: number;
}
/**
 * 功能
 */
export interface IFunction {
  id?: number;
  code?: string;
  menu_code?: string;
  name?: string;
  app_type?: number;
  state?: number;
  style?: number;
  sort?: number;
  css?: string;
  type?: NzButtonType;
  detail?: IFunctionDetail;
}
/**
 * 菜单
 */
export interface IMenu {
  id?: number;
  code?: string;
  parent_code?: string;
  title?: string;
  path?: string;
  sort?: number;
  app_type?: number;
  level?: number;
  parented?: number;
  state?: number;
  css?: string;
  style?: number;
  icon?: string;
  uri?: string;
}
