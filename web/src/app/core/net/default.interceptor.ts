import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
  HttpResponse,
  HttpResponseBase
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, IGNORE_BASE_URL, _HttpClient, CUSTOM_ERROR, RAW_BODY } from '@delon/theme';
import { environment } from '@env/environment';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, Observable, of, throwError, catchError, filter, mergeMap, switchMap, take } from 'rxjs';
import { ApplicationLogic } from '../logic/application.logic';
import { IJsonTable } from '@shared/model';
import { JsonTable } from 'src/app/shared/utils/json-table';

const CODEMESSAGE: { [key: number]: string } = {
  0: '网络错误，请刷新重试。',
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
};

/**
 * 默认HTTP拦截器，其注册细节见 `app.module.ts`
 */
@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  private get notification(): NzNotificationService {
    return this.injector.get(NzNotificationService);
  }

  private get tokenSrv(): ITokenService {
    return this.injector.get(DA_SERVICE_TOKEN);
  }

  private get http(): _HttpClient {
    return this.injector.get(_HttpClient);
  }

  private handleData(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    try {
      // 判断http状态码
      switch (ev.status) {
        case 200: // 请求成功
          if (ev instanceof HttpResponse) {
            const body = ev.body;
            if (body && JsonTable.instanceof(body) && body.state !== 0) {
              // 获取响应数据
              const jResult = ev.body as IJsonTable;
              // 判断内容
              switch (jResult.state) {
                case 10: // 令牌验证失败
                case 11: // 令牌不存在
                case 19: // 令牌类型不正确
                case 80: // 用户未登录
                  ApplicationLogic.getInstance(this.injector).toLogin(`${jResult.msg}[${jResult.state}]`, '登陆失效');
                  return of(null);
                default:
                  // 其它状态码
                  return of(ev);
              }
            } else {
              // 非jsonTable格式数据使用默认处理流程
              return of(ev);
            }
          } else {
            return of(null);
          }
          break;
        default:
          // 其他http请求错误
          // 若错误信息返回标准IJsonTable数据，提取返回的错误内容
          const errortext = JsonTable.instanceof((ev as HttpErrorResponse).error)
            ? ((ev as HttpErrorResponse).error as IJsonTable).msg
            : CODEMESSAGE[ev.status] || ev.statusText;
          // 弹窗提示
          // this.notification.error(`请求错误`, errortext);
          //发生401未授权时，直接跳到登录页，不做任何提示
          if (ev.status !== 401) {
            this.notification.error(`请求错误`, errortext);
          }

          return of(ev);
      }
    } finally {
      // 可能会因为 `throw` 导出无法执行 `_HttpClient` 的 `end()` 操作
      if (ev.status > 0) this.http.cleanLoading();
    }
  }

  private getAdditionalHeaders(headers?: HttpHeaders): { [name: string]: string } {
    const res: { [name: string]: string } = {};
    const lang = this.injector.get(ALAIN_I18N_TOKEN).currentLang;
    if (!headers?.has('Accept-Language') && lang) {
      res['Accept-Language'] = lang;
    }

    return res;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 统一加上服务端前缀
    let url = req.url;
    if (!req.context.get(IGNORE_BASE_URL) && !url.startsWith('https://') && !url.startsWith('http://')) {
      const { baseUrl } = environment.api;
      url = baseUrl + (baseUrl.endsWith('/') && url.startsWith('/') ? url.substring(1) : url);
    }
    const params = new HttpParams({
      fromString: req.params.toString(),
      encoder: this
    });
    let headers = this.getAdditionalHeaders(req.headers);
    // headers['token'] = this.tokenSrv.get()?.token || '';
    headers['Accept'] = 'application/json';
    if (false === req.headers.has('Content-Type') && !(req.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    // const newReq = req.clone({ url, setHeaders: this.getAdditionalHeaders(req.headers) });
    const newReq = req.clone({
      url,
      setHeaders: headers,
      params,
      withCredentials: false
    });
    return next.handle(newReq).pipe(
      mergeMap(ev => {
        // 允许统一对请求错误处理
        if (ev instanceof HttpResponseBase) {
          return this.handleData(ev, newReq, next);
        }
        // 若一切都正常，则后续操作
        return of(ev);
      }),
      catchError((err: HttpErrorResponse) => this.handleData(err, newReq, next))
    );
  }

  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}
