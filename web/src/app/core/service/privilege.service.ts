import { Injectable } from '@angular/core';

import { IMenuSet, IFunctionSet, IUser } from '@shared/model';
import { BaseService } from './base.service';

const APP_TYPE_NAME: { [key: string]: string } = {
  '1': 'admin'
};

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService extends BaseService {
  /**
   * 获取用户信息
   */
  public get user(): IUser | null {
    return this.cacheSrv!.get('user', {
      mode: 'none',
      expire: this.expire
    });
  }

  /**
   * 设置用户信息
   */
  public set user(value: IUser | null) {
    if (null === value) {
      this.cacheSrv!.remove('user');
      return;
    }
    this.cacheSrv!.set('user', value, {
      type: 's',
      expire: this.expire
    });
  }

  /**
   * 获取权限信息
   */
  public get functions(): IFunctionSet | null {
    return this.cacheSrv.get('functions', {
      mode: 'none',
      expire: this.expire
    });
  }

  /**
   * 设置权限信息
   */
  public set functions(value: IFunctionSet | null) {
    if (null === value) {
      this.cacheSrv.remove('functions');
      return;
    }
    // 处理数据后存储
    this.cacheSrv.set('functions', value, {
      type: 's',
      expire: this.expire
    });
  }

  /**
   * 获取权限编码
   */
  public get funcode(): string[] {
    return ['99', ...Object.keys(this.functions || {})];
  }

  /**
   * 获取菜单
   */
  public get menu(): IMenuSet | null {
    return this.cacheSrv.get('menu', {
      mode: 'none',
      expire: this.expire
    });
  }

  /**
   * 设置菜单
   */
  public set menu(value: IMenuSet | null) {
    if (null === value) {
      this.cacheSrv.remove('menu');
      return;
    }
    this.cacheSrv.set('menu', value, {
      type: 's',
      expire: this.expire
    });
  }

  /**
   * 获取应用类型
   */
  public get appType(): number | null {
    return this.cacheSrv.get('app_type', {
      mode: 'none',
      expire: this.expire
    });
  }

  /**
   * 设置应用类型
   */
  public set appType(value: number | null) {
    if (null === value) {
      this.cacheSrv.remove('app_type');
      return;
    }
    this.cacheSrv.set('app_type', value, {
      type: 's',
      expire: this.expire
    });
  }

  /**
   * 获取应用名称
   */
  public get appTypeName(): string {
    return APP_TYPE_NAME[this.appType?.toString() || ''] || '';
  }

  /**
   * 获取应用名称
   *
   * @param appType 应用类型
   * @returns 返回应用名称
   */
  public getAppTypeName(appType: number): string {
    return APP_TYPE_NAME[appType.toString() || ''] || '';
  }

  /**
   * 登录地址
   */
  private _loginUrl: string | null = null;

  /**
   * 设置登录地址
   */
  public set loginUrl(value: string | null) {
    this._loginUrl = value;
  }

  /**
   * 获取登录地址
   */
  public get loginUrl(): string | null {
    return this._loginUrl;
  }

  /**
   * 设置缓存值
   *
   * @param key 键名
   * @param value 保存的值，若设置null，则代表清理缓存内容
   * @param type 保存类型，s代表storage，m代表内存
   * @param expire 有效期
   */
  protected setValue(key: string, value: any | null, type: 's' | 'm' = 'm', expire: number = 7200): void {
    if (null == value) {
      // 如果设置为null，则代表清理内容
      this.cacheSrv.remove(key);
      return;
    }
    this.cacheSrv.set(key, value, {
      type,
      expire
    });
  }

  /**
   * 根据名称获取应用类型
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-03-30
   * @param {string} name 应用名称
   * @param {number} [def=4] 应用类型
   * @returns {*}  {number}
   */
  public getAppTypeByName(name: string, def: number = 1): number {
    const appType = Object.keys(APP_TYPE_NAME).find(key => {
      return APP_TYPE_NAME[key] === name;
    });
    return appType ? Number.parseInt(appType) : def;
  }

  /**
   * 刷新数据
   */
  refresh(): void {
    const appType = this.appType;
    const user = this.user;
    const functions = this.functions;
    const menu = this.menu;
    if (appType !== null) this.appType = appType;
    if (user !== null) this.user = user;
    if (functions !== null) this.functions = functions;
    if (menu !== null) this.menu = menu;
  }

  /**
   * 清空当前服务下相关数据
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-02-23
   */
  clear(): void {
    ['user', 'functions', 'menu', 'app_type'].forEach(key => {
      this.cacheSrv.remove(key);
    });
  }

  /**
   * 获取有效期（秒）
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-02-04
   * @readonly
   * @protected
   * @type {number}
   */
  protected get expire(): number {
    const expired = this.tokenSrv.get()?.expired || -1;
    return -1 == expired ? 7200 : (expired - +new Date() + 60000) / 1000;
  }
}
