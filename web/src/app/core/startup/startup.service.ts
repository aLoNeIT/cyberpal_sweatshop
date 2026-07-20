import { HttpClient, HttpContext } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ACLService } from '@delon/acl';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenModel, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, IGNORE_BASE_URL, MenuService, SettingsService, TitleService, _HttpClient } from '@delon/theme';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzIconService } from 'ng-zorro-antd/icon';
import { catchError, filter, map, Observable, of, switchMap, zip } from 'rxjs';

import { environment } from '@env/environment';
import { jerror } from '@shared';
import { IApplicationData, IJsonTable } from '@shared/model';

import { ICONS } from '../../../style-icons';
import { ICONS_AUTO } from '../../../style-icons-auto';
import { I18NService } from '../i18n/i18n.service';
import { ApplicationLogic } from '../logic/application.logic';
import { PrivilegeService } from '../service/privilege.service';

interface RefreshResult {
  result: IJsonTable;
  tokenData: ITokenModel;
}

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable()
export class StartupService {
  constructor(
    iconSrv: NzIconService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    @Inject(DA_SERVICE_TOKEN) private tokenSrv: ITokenService,
    private httpClient: HttpClient,
    private injector: Injector,
    private http: _HttpClient,
    private privilegeSrv: PrivilegeService
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }

  /**
   * 是否正在刷新 token，避免并发刷新。
   */
  private refreshToking = false;

  private init(): void {
    this.subscribeRefresh();
  }

  /**
   * 刷新 token。
   */
  protected refreshToken(tokenData: ITokenModel): Observable<IJsonTable> {
    const refreshToken = tokenData['refresh_token'];
    return this.http.put<IJsonTable>(`admin/v1/session/${tokenData.token}`, {
      refresh_token: refreshToken
    });
  }

  /**
   * 订阅 token 失效事件。
   */
  protected subscribeRefresh(): void {
    this.tokenSrv.refresh
      .pipe(
        filter(() => !this.refreshToking),
        switchMap(tokenData => {
          if (tokenData['refresh_expired'] < +new Date()) {
            return of({
              result: jerror('刷新令牌无效', 12),
              tokenData
            });
          }
          this.refreshToking = true;
          return this.refreshToken(tokenData).pipe(
            map(result => ({
              result,
              tokenData
            }))
          );
        })
      )
      .subscribe(({ result, tokenData }: RefreshResult) => {
        this.refreshToking = false;
        if (0 != result.state) {
          return ApplicationLogic.getInstance(this.injector).toLogin(`${result.msg}[${result.state}]`);
        }

        const refreshData = (result.data || {}) as Record<string, NzSafeAny>;
        const currentToken = (this.tokenSrv.get() || {}) as ITokenModel;
        const appData: IApplicationData = {
          user: refreshData['user'] || this.privilegeSrv.user,
          menu: refreshData['menu'] || this.privilegeSrv.menu,
          functions: refreshData['function'] || refreshData['functions'] || this.privilegeSrv.functions,
          appType: 1
        };

        ApplicationLogic.getInstance(this.injector).load(
          {
            ...currentToken,
            ...refreshData,
            app_type: 1,
            expired: +new Date() + (refreshData['expire_in'] - 30 * 60) * 1000,
            refresh_expired: +new Date() + ((refreshData['refresh_expire_in'] || refreshData['expire_in']) - 5 * 60) * 1000
          },
          appData
        );
      });
  }

  changeFavicon(): void {
    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.type = 'image/x-icon';
    newLink.href = environment['img'].favicon;
    const existingLink = document.querySelector('link[rel="icon"]');
    if (existingLink) {
      document.head.removeChild(existingLink);
    }
    document.head.appendChild(newLink);
  }

  private viaHttp(): Observable<void> {
    const defaultLang = this.i18n.defaultLang;
    return zip(
      this.i18n.loadLangData(defaultLang),
    ).pipe(
      catchError((res: NzSafeAny) => {
        console.warn(`StartupService.load: Network request failed`, res);
        return [];
      }),
      map(([langData]: [Record<string, string>]) => {
        this.i18n.use(defaultLang, langData);
      })
    );
  }

  load(): Observable<void> {
    this.init();
    return this.viaHttp();
  }
}
