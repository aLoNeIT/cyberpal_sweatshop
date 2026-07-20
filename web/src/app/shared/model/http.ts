import { Observable } from 'rxjs';

import { IJsonTable, JsonTableData } from './core';
import { IFunction, IMenu } from './table';

/**
 * 接口定义
 */

/**
 * 功能接口集合
 */
export interface IFunctionSet {
  [key: string]: IFunction;
}

/**
 * 网络请求成功回调
 */
export type cbHttpSuccess = (msg: string | any, data?: JsonTableData) => void;
/**
 * 网络请求失败回调
 */
export type cbHttpError = (state: number, msg: string | any, data?: JsonTableData) => void;
/**
 * 网络请求响应订阅对象结合
 */
export interface IRspSubjectSet {
  success: Observable<IJsonTable>;
  error: Observable<IJsonTable>;
  complete: Observable<void>;
}
/**
 * 接口返回的菜单数据集合
 */
export interface IMenuData extends IMenu {
  children?: IMenuSet;
}
/**
 * 菜单集合
 */
export interface IMenuSet {
  [key: string]: IMenuData;
}
