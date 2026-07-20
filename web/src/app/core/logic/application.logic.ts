import { Router } from '@angular/router';
import { ITokenModel } from '@delon/auth';

import { BaseLogic } from './base.logic';
import { MenuLogic } from './menu.logic';

import { CookieService } from '@delon/util';
import { IApplicationData, IKVPaire } from '@shared/model';
import { REDIRECT_URI } from 'src/app/shared/consts/cache.consts';

const VALID_APP_TYPES = [1];

export class ApplicationLogic extends BaseLogic {
  /**
   * 加载应用信息
   */
  load(tokenData: ITokenModel, appData: IApplicationData | null = null): void {
    const tokenRecord = tokenData as ITokenModel & Record<string, unknown>;
    const appType = this.normalizeAppType(appData?.appType ?? tokenRecord['app_type'] ?? tokenRecord['appType'] ?? this.privilegeSrv.appType);
    if (appType) {
      tokenRecord['app_type'] = appType;
      this.privilegeSrv.appType = appType;
    }
    // 设置token
    this.tokenSrv.set(tokenRecord);
    // 设置cookie的token
    this.injector.get<CookieService>(CookieService).put('token', tokenData.token as string, {
      expires: tokenData.expired
    });
    if (null != appData) {
      let { user, functions, menu, appType }: IApplicationData = appData;
      if (user) this.privilegeSrv.user = user;
      if (menu) this.privilegeSrv.menu = menu;
      if (functions) this.privilegeSrv.functions = functions;
      const normalizedAppType = this.normalizeAppType(appType);
      if (normalizedAppType) this.privilegeSrv.appType = normalizedAppType;
    } else {
      this.privilegeSrv.refresh();
    }
    const user = this.privilegeSrv.user;
    if (user) {
      this.settingsSrv.setUser({
        name: user.realname,
        avatar: user.img_head,
        ...user
      });
    }
    const functions = this.privilegeSrv.functions;
    if (functions || null != appData) {
      this.aclSrv.setAbility(this.privilegeSrv.funcode);
    }
    const menu = this.privilegeSrv.menu;
    setTimeout(() => {
      if (!menu || Object.keys(menu).length <= 0) return;
      this.menuSrv.clear();
      this.menuSrv.add(MenuLogic.getInstance(this.injector).load(menu));
    }, 10);
  }

  private normalizeAppType(value: unknown): number {
    const appType = Number(value || 0);
    return VALID_APP_TYPES.includes(appType) ? appType : 0;
  }

  /**
   * 跳转至登录页面
   */
  toLogin(
    content: string | null = null,
    title: string | null = null,
    appType: number | null = null,
    queryParams: IKVPaire | null = null,
    cacheRedirect = true
  ): void {
    this.privilegeSrv.clear();
    this.menuSrv.clear();
    this.aclSrv.setAbility([]);
    if (null !== content && null !== title) {
      this.notificationSrv.error(title, content);
    }
    appType = appType || 1;
    this.privilegeSrv.appType = appType;
    const appTypeName = this.privilegeSrv.getAppTypeName(appType);
    const loginUrl = this.privilegeSrv.loginUrl ? this.privilegeSrv.loginUrl : `/${appTypeName}${this.tokenSrv.login_url}`;
    this.tokenSrv.clear();
    this.injector.get(CookieService).removeAll();
    const url = new URL(location.href),
      path = url.hash ? url.hash.substring(1) : url.pathname;
    if (path.indexOf('/passport/login') >= 0 || '/' == path) {
      return;
    }
    if (!cacheRedirect) {
      this.cacheSrv.remove(REDIRECT_URI);
      this.goTo(loginUrl, queryParams);
      return;
    }
    this.cacheSrv.set(REDIRECT_URI, decodeURIComponent(path), {
      type: 's',
      expire: 600
    });
    this.goTo(loginUrl, {
      redirect_uri: encodeURIComponent(path),
      ...(queryParams || {})
    });
  }

  /** 跳转首页 */
  toHome() {
    const module = this.privilegeSrv.appTypeName,
      redirectUri = this.cacheSrv.get(REDIRECT_URI, { mode: 'none' });
    this.cacheSrv.remove(REDIRECT_URI);
    this.goTo(redirectUri || module);
  }

  /** 跳转指定页面 */
  goTo(path: string, queryParams: IKVPaire | null = null): void {
    setTimeout(() => {
      this.injector.get(Router).navigate(
        [path],
        queryParams ? { queryParams } : undefined
      );
    });
  }

  /** 应用程序初始化 */
  init(appType: number, loginUrl: string | null = null, appData: Partial<IApplicationData> | null = null): void {
    this.privilegeSrv.loginUrl = loginUrl;
    const tokenData = (this.tokenSrv.get() || {}) as ITokenModel;
    const hasValidToken = Object.keys(tokenData).length > 0 && !!tokenData.expired && tokenData.expired >= +new Date();
    const currentAppType = this.privilegeSrv.appType;
    if (currentAppType && appType !== currentAppType) {
      return this.toLogin(null, null, appType, null, false);
    }
    if (appType != this.privilegeSrv.appType) {
      if (hasValidToken) {
        this.privilegeSrv.appType = appType;
      } else {
        return this.toLogin(null, null, appType);
      }
    }
    if (hasValidToken && !this.privilegeSrv.appType) {
      this.privilegeSrv.appType = appType;
    }
    if (Object.keys(tokenData).length > 0) {
      if (!tokenData.expired || tokenData.expired < +new Date()) {
        return this.toLogin('登录令牌已过期', '登陆失效');
      }
    } else {
      return this.toLogin(null, null, appType);
    }
    return this.load(
      tokenData,
      appData
        ? {
            user: appData.user || this.privilegeSrv.user,
            functions: appData.functions || this.privilegeSrv.functions,
            menu: appData.menu || this.privilegeSrv.menu,
            appType: appData.appType || appType
          }
        : null
    );
  }
}
