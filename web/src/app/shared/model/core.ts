import { Type } from '@angular/core';
import { NzButtonType } from 'ng-zorro-antd/button';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { ModalOptions, NzModalRef } from 'ng-zorro-antd/modal';
import { Observable, Subject } from 'rxjs';
import { DictItem, Dict } from './class';

/**
 * @description 列表页中页面数据相关
 * @author 王阮强 <wangruanqiang@youzhibo.cn>
 * @date 2020-12-16
 * @export
 */
export interface IPage {
  /**
   * 当前页码
   */
  curr: number;
  /**
   * 总页数
   */
  page: number;
  /**
   * 每页显示数量
   */
  num: number;
  /**
   * 总数据量
   */
  count: number;
}
/**
 * 自定义事件结构
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2020-12-29
 * @export
 * @interface IEventEmitter
 */
export interface IEventEmitter {
  /**
   * 触发事件的对象
   */
  source?: any;
  /**
   * 事件对象
   */
  $event?: Event;
  /**
   * 附带信息
   */
  data?: any;
  /**
   * 扩展信息
   */
  extend?: any;
  target?: any;
}
/**
 * data节点定义
 *
 * @author aLoNe.Adams.K <alone@alonetech.com>
 * @date 2020-12-15
 */
export type JsonTableData = NzSafeAny[] | NzSafeAny;
/**
 * @description JsonTable数据格式接口定义
 * @author aLoNe.Adams.K <alone@alonetech.com>
 * @date 2020-02-09
 * @export
 */
export interface IJsonTable {
  state: number;
  msg: string | any;
  data?: JsonTableData;
}

/**
 * 枚举类型
 */
export interface IEnum {
  [key: string]: string;
  [key: number]: string;
}
/**
 * 对话框配置项
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-05
 * @export
 * @interface IYzbDialog
 */
export interface IYzbDialogOption {
  title?: string;
  buttons?: IYzbDialogButton[];
}
/**
 * 对话框组件属性定义
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-02-23
 * @export
 * @interface IYzbDialogComponentOption
 */
export interface IYzbDialogComponentOption {
  enableClose?: boolean;
  autoClose?: boolean;
  modalOptions?: ModalOptions;
}
/**
 * 对话框按钮
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-05
 * @export
 * @interface IYzbDialogButton
 */
export interface IYzbDialogButton {
  title: string;
  type?: NzButtonType;
  isDanger?: boolean;
  click: (component: IYzbDialogComponent, modalRef: NzModalRef, $event: IEventEmitter) => void;
}

/**
 * 对话框组件必须实现的方法
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-05
 * @export
 * @interface IYzbDialogComponent
 */
export interface IYzbDialogComponent {
  // 初始化
  initDialog(params: IKVPaire): void;
  // 窗体点击关闭触发
  close(): Observable<NzSafeAny>;
  // 窗体点击确定触发
  submit(): Observable<NzSafeAny>;
}
/**
 * 列表对话框组件必须实现的方法
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-15
 * @export
 * @interface IYzbDialogIndexComponent
 */
export interface IYzbDialogIndexComponent extends IYzbDialogComponent {
  getValue(): Observable<NzSafeAny>;
}
/**
 * 表单对话框组件
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-19
 * @export
 * @interface IYzbDialogFormComponent
 * @extends {IYzbDialogComponent}
 */
export interface IYzbDialogFormComponent extends IYzbDialogComponent {
  reset(): Observable<NzSafeAny>;
}
/**
 * 任意类型kv定义
 */
export interface IKVPaire {
  [key: string]: any;
}

/**
 * 字符串键名和布尔键值的键值对
 */
export interface ISBPaire {
  [key: string]: boolean;
}

export interface IArrayPaire {
  [key: string]: any[];
}
/**
 * 字符串kv定义
 */
export interface IStringPaire {
  [key: string]: string;
}
/**
 * 字典kv定义
 */
export interface IDictComponentPaire {
  [key: number]: Type<any>;
}

/**
 * 获取数据参数结构
 */
export interface IGetDataParam {
  curr?: number;
  num?: number;
  condition?: IConditionSet | null;
  sort?: IStringPaire | null;
}
/**
 * yzb-list组件数据项
 */
export interface IYzbListItem {
  label: string | string[];
  value: any;
}
/**
 * 选中数据项
 */
export interface ISelectItem {
  index: number;
  data: IYzbListItem | null;
}
/**
 * 事件项目定义
 */
export interface IEventItem {
  name: string;
  subject: Subject<any>;
}
/**
 * 事件项目集合
 */
export interface IEventItemSet {
  [key: string]: IEventItem;
}
/**
 * st组件页码相关定义
 */
export interface IGridPage {
  /**
   * 当前页码
   */
  pi: number;
  /**
   * 每页数量
   */
  ps: number;
  /**
   * 总数据量
   */
  total: number;
}
/**
 * 条件表达式
 */
export interface ICondition {
  field: string; // 字段名
  operator: string; // 操作符
  value: any; // 值
}
/**
 * 条件表达式集合
 */
export interface IConditionSet {
  [key: string]: ICondition;
}
/**
 * 应用初始化所需要的数据
 */
export interface IApplicationData {
  user?: any;
  functions?: any;
  menu?: any;
  appType?: number;
}
/**
 * 数据枚举体
 */
export interface IEnumItem {
  label: string; // 标签名
  value: any; // 值
}
/**
 * 枚举体集合
 */
export interface IEnumSet {
  [key: string]: IEnumItem;
}
export interface IUploadFileData {
  id: number; //返回的上传id
  url: string; //返回的上传url
}

/**
 * 字典对象集合定义
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-14
 * @export
 * @interface DictItemSet
 */
export interface DictItemSet {
  [key: string]: DictItem;
}
/**
 * 字典对象集合定义
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-14
 * @export
 * @interface DictSet
 */
export interface DictSet {
  [key: string]: Dict;
}

/**
 * jsTicket信息集合，用于jssdk、wecom_jssdk
 */
export interface IJSTicketInfo {
  timeStamp: Number; // 时间戳
  nonceStr: string; // 干扰码
  corpSignature: string; // 企业签名
  agentSignature: string; // 应用签名
  url: string; // 页面地址
}
