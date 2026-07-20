import { HttpContext } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { ALLOW_ANONYMOUS } from '@delon/auth';
import { map, Observable } from 'rxjs';

import { BaseLogic } from './base.logic';
import { ApplicationLogic } from './application.logic';
import { HttpLogic } from './http.logic';
import { IJsonTable } from '@shared/model';
import { Md5 } from 'ts-md5';

const LoginApiMap: {
  [key: string]: string;
} = {
  '1': 'admin/v1/session',
};

export class UserLogic extends BaseLogic {
  protected reuseTabService!: ReuseTabService;
  protected router!: Router;
  protected override initialize() {
    super.initialize();
    this.reuseTabService = this.injector.get(ReuseTabService, undefined, { optional: true }) as ReuseTabService;
    this.router = this.injector.get(Router);
  }

  getCaptchaUrl(appType: number): Observable<string> {
    return this.http
      .get(
        '/home/v1/captcha',
        {
          app_type: appType,
          _: Math.random()
        },
        {
          responseType: 'blob',
          context: new HttpContext().set(ALLOW_ANONYMOUS, true)
        }
      )
      .pipe(map((blob: Blob) => window.URL.createObjectURL(blob)));
  }

  /**
   * 用户登录(可能未来存在验证码)
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-02-25
   * @param {string} account 账号
   * @param {string} password 密码
   * @param {number} [appType=3] 登陆类型
   * @returns {*}  {Observable<void>}
   */
  login(account: string, password: string, appType: number = 1, code: any): Observable<void> {
    const loginApi = LoginApiMap[appType.toString()];
    if (!loginApi) {
      throw new Error(`Unsupported login appType: ${appType}`);
    }
    const httpLogic = HttpLogic.getInstance(this.injector);
    this.privilegeSrv.clear();
    this.menuSrv.clear();
    this.aclSrv.setAbility([]);
    const param = {
      account: account,
      password: Md5.hashStr(password),
      code: code
    };
    const { success, error, complete } = httpLogic.reqPost(
      loginApi,
      param,
      {},
      {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      }
    );
    success.subscribe((jResult: IJsonTable) => {
      const functions = {
        ...(jResult.data.function || {})
      };
      // 清空路由复用信息
      // this.reuseTabService.clear();
      // 初始化应用信息
      ApplicationLogic.getInstance(this.injector).load(
        {
          token: jResult.data.token,
          refresh_token: jResult.data.refresh_token,
          expired: +new Date() + (jResult.data.expire_in - 30 * 60) * 1000,
          refresh_expired: +new Date() + (jResult.data.expire_in - 5 * 60) * 1000,
          expire_in: jResult.data.expire_in,
          refresh_expire_in: jResult.data.refresh_expire_in
        },
        {
          user: jResult.data.user,
          menu: jResult.data.menu,
          functions,
          appType: appType
        }
      );

      if (appType === 1) {
        this.router.navigateByUrl('/admin/dashboard');
      } else {
        ApplicationLogic.getInstance(this.injector).toHome();
      }
    });
    error.subscribe((jResult: IJsonTable) => {
      switch (jResult.state) {
        case 77: // 医院状态异常-过期或者未开启
        case 75: // 登录方式无权访
        case 71: // 功能编码没查到无权访问
        case 751: // 医院状态异常-过期或者未开启
          this.msgSrv.error(`${jResult.msg}[${jResult.state}]`);
          // this.router.navigate(['/transfer/no_role'], { queryParams: { errmsg: jResult.msg } });
          break;
        default:
          this.msgSrv.error(`${jResult.msg}[${jResult.state}]`);
          break;
      }
    });
    return complete;
  }
}
