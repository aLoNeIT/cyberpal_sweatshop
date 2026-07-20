import { HttpContext } from '@angular/common/http';
import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { ACLService } from '@delon/acl';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN } from '@delon/auth';
import { CacheService } from '@delon/cache';
import { MenuService, SettingsService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EMPTY, of } from 'rxjs';
import { Md5 } from 'ts-md5';

import { UserLogic } from './user.logic';
import { HttpLogic } from './http.logic';
import { CommonService } from '../service/common.service';
import { EventService } from '../service/event.service';
import { PrivilegeService } from '../service/privilege.service';

describe('UserLogic', () => {
  function createLogic() {
    const http = jasmine.createSpyObj<_HttpClient>('_HttpClient', ['get']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    const tokenSrv = {};
    const privilegeSrv = jasmine.createSpyObj<PrivilegeService>('PrivilegeService', ['clear']);
    const settingsSrv = {};
    const cacheSrv = {};
    const aclSrv = jasmine.createSpyObj<ACLService>('ACLService', ['setAbility']);
    const menuSrv = jasmine.createSpyObj<MenuService>('MenuService', ['clear']);
    const commonSrv = {};
    const notificationSrv = {};
    const msgSrv = jasmine.createSpyObj<NzMessageService>('NzMessageService', ['error', 'success']);
    const evtSrv = {};
    const injector = {
      get: (token: any) => {
        if (token === DA_SERVICE_TOKEN) return tokenSrv;
        if (token === PrivilegeService) return privilegeSrv;
        if (token === SettingsService) return settingsSrv;
        if (token === CacheService) return cacheSrv;
        if (token === ACLService) return aclSrv;
        if (token === _HttpClient) return http;
        if (token === MenuService) return menuSrv;
        if (token === CommonService) return commonSrv;
        if (token === NzNotificationService) return notificationSrv;
        if (token === NzMessageService) return msgSrv;
        if (token === EventService) return evtSrv;
        if (token === Router) return router;
        if (token === ReuseTabService) return undefined;
        return {};
      }
    } as Injector;

    return {
      logic: new UserLogic(injector),
      http,
      aclSrv,
      menuSrv,
      privilegeSrv
    };
  }

  function mockHttpLogic() {
    const httpLogic = jasmine.createSpyObj<HttpLogic>('HttpLogic', ['reqPost']);
    httpLogic.reqPost.and.returnValue({
      success: EMPTY,
      error: EMPTY,
      complete: of(void 0)
    });
    spyOn(HttpLogic, 'getInstance').and.returnValue(httpLogic);
    return httpLogic;
  }

  it('loads captcha image through the http interceptor base url', done => {
    const blob = new Blob(['captcha'], { type: 'image/png' });
    const { logic, http } = createLogic();
    spyOn(Math, 'random').and.returnValue(0.123);
    spyOn(URL, 'createObjectURL').and.returnValue('blob:captcha');
    http.get.and.returnValue(of(blob));

    logic.getCaptchaUrl(3).subscribe(url => {
      expect(url).toBe('blob:captcha');
      expect(http.get).toHaveBeenCalledWith(
        '/home/v1/captcha',
        {
          app_type: 3,
          _: 0.123
        },
        jasmine.objectContaining({
          responseType: 'blob'
        })
      );
      const options = http.get.calls.mostRecent().args[2] as { context: HttpContext };
      expect(options.context.get(ALLOW_ANONYMOUS)).toBeTrue();
      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
      done();
    });
  });

  const loginEndpoints: Array<[number, string]> = [
    [1, 'admin/v1/session'],
    [2, 'corporation/v1/session'],
    [3, 'pharmacy/v1/session'],
    [5, 'distributor/v1/session'],
    [6, 'hospital/v1/session']
  ];

  loginEndpoints.forEach(([appType, url]) => {
    it(`logs in app type ${appType} through ${url}`, () => {
      const { logic, aclSrv, menuSrv, privilegeSrv } = createLogic();
      const httpLogic = mockHttpLogic();

      logic.login('demo', 'password', appType, 'abcd').subscribe();

      expect(privilegeSrv.clear).toHaveBeenCalled();
      expect(menuSrv.clear).toHaveBeenCalled();
      expect(aclSrv.setAbility).toHaveBeenCalledWith([]);
      expect(httpLogic.reqPost).toHaveBeenCalledWith(
        url,
        {
          account: 'demo',
          password: Md5.hashStr('password'),
          code: 'abcd'
        },
        {},
        jasmine.objectContaining({
          context: jasmine.any(HttpContext)
        })
      );
      const options = httpLogic.reqPost.calls.mostRecent().args[3] as { context: HttpContext };
      expect(options.context.get(ALLOW_ANONYMOUS)).toBeTrue();
    });
  });

  it('does not route user app type 4 through a PC login session endpoint', () => {
    const { logic } = createLogic();
    const httpLogic = mockHttpLogic();

    expect(() => logic.login('demo', 'password', 4, 'abcd')).toThrowError('Unsupported login appType: 4');
    expect(httpLogic.reqPost).not.toHaveBeenCalled();
  });
});
