import { Injector } from '@angular/core';
import { CommonService } from '../service/common.service';
import { PrivilegeService } from '../service/privilege.service';
import { ACLService } from '@delon/acl';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { CacheService } from '@delon/cache';
import { _HttpClient, MenuService, SettingsService } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { EventService } from '../service/event.service';
import { ReuseTabService } from '@delon/abc/reuse-tab';

/**
 * 逻辑基类
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-29
 * @class BaseLogic
 */
export class BaseLogic {
  //#region 通用服务
  protected tokenSrv: ITokenService;
  protected privilegeSrv: PrivilegeService;
  protected settingsSrv: SettingsService;
  protected cacheSrv: CacheService;
  protected aclSrv: ACLService;
  protected http: _HttpClient;
  protected menuSrv: MenuService;
  protected commonSrv: CommonService;
  protected notificationSrv: NzNotificationService;
  protected msgSrv: NzMessageService;
  protected evtSrv: EventService;
  //#endregion
  constructor(protected injector: Injector) {
    this.tokenSrv = this.injector.get(DA_SERVICE_TOKEN);
    this.privilegeSrv = this.injector.get(PrivilegeService);
    this.settingsSrv = this.injector.get(SettingsService);
    this.cacheSrv = this.injector.get(CacheService);
    this.aclSrv = this.injector.get(ACLService);
    this.http = this.injector.get(_HttpClient);
    this.menuSrv = this.injector.get(MenuService);
    this.commonSrv = this.injector.get(CommonService);
    this.notificationSrv = this.injector.get(NzNotificationService);
    this.msgSrv = this.injector.get(NzMessageService);
    this.evtSrv = this.injector.get(EventService);
    // protected reuseTabService: ReuseTabService
    this.initialize();
  }

  protected initialize() {}

  static getInstance<T extends object>(this: (new (injector: Injector) => T) & { _instance?: T }, injector: Injector): T {
    const instance = Object.prototype.hasOwnProperty.call(this, '_instance') ? this._instance : undefined;
    if (instance instanceof this) return instance;

    const nextInstance = new this(injector);
    this._instance = nextInstance;
    return nextInstance;
  }

  protected setCache(key: string, value: any, expire: number = 7200, type: 's' | 'm' = 's') {
    this.cacheSrv.set(key, value, {
      type: type,
      expire: expire
    });
  }

  protected getCache(key: string): any {
    this.cacheSrv.get(key, {
      mode: 'none'
    });
  }
}
