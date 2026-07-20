import { Injectable, Injector } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IJsonTable, JsonTableData, IFunctionSet } from '@shared/model';
import { BaseService } from './base.service';
import { PrivilegeService } from './privilege.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService extends BaseService {
  constructor(
    private privilegeSrv: PrivilegeService,
    injector: Injector
  ) {
    super(injector);
  }

  menuData: NzSafeAny = {};
  privilegeData: { [key: string]: string } = {};
  tabBar: NzSafeAny[] = [];

  // 菜单数据
  getMenuData() {
    return this.menuData;
  }

  setMenuData(data: any) {
    this.menuData = data;
  }

  // 对应功能数据
  getPrivilegeData() {
    return this.privilegeData;
  }

  setPrivilegeData(data: any) {
    this.privilegeData = data;
  }

  // 从功能数据中获取菜单 link
  // key：对应 key 值
  getMenuLinkFormPrivilegeData(key: string) {
    if (!this.privilegeData[key]) return '';
    let child: any[] = Object.values(this.privilegeData[key]);
    if (child[0].children) {
      let url: string = `/${child[0].children[0].module}/${child[0].children[0].controller}`;
      return url;
    }
    return '';
  }

  setTabBar(data: any[]) {
    this.tabBar = data;
  }

  getTabBar() {
    return this.tabBar;
  }

  /**
   * 获取指定页面的按钮数据
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-11
   * @param {String} menuCode
   * @param {number} [appType=4]
   * @returns {*}  {Observable<JsonTableData>}
   */
  getButtons(menuCode: String, appType: number = 1): Observable<JsonTableData> {
    let uri: string;
    appType = this.privilegeSrv.appType || 1;
    switch (appType) {
      case 1:
      default:
        uri = `admin/v1/permission/menu/${menuCode}/function`;
        break;
    }
    // 调用接口获取数据
    return new Observable<JsonTableData>(observer => {
      this.cacheSrv!.get<IJsonTable>(uri, {
        mode: 'promise',
        type: 'm',
        expire: 86400
      })
        .pipe(map(value => value.data))
        .subscribe(result => {
          observer.next(result as IFunctionSet);
        });
    });
  }

  /**
   * 应用类型
   */
  public get appType(): number {
    return this.cacheSrv!.get('app_type', { mode: 'none' });
  }

  public set appType(value: number) {
    this.cacheSrv!.set('app_type', value);
  }

  /**
   * 应用名称
   */
  public get appTypeName(): string {
    const map: { [key: string]: string } = {
      '1': 'admin'
    };
    return map[this.appType.toString()];
  }
}
