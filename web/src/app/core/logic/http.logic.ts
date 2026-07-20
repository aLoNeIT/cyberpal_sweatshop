import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

import { EVENT_LOADING } from '../../shared/consts/component.consts';
import { IJsonTable, IRspSubjectSet, IKVPaire } from '@shared/model';
import { BaseLogic } from './base.logic';

export class HttpLogic extends BaseLogic {
  public request(method: string, url: string, options: IKVPaire, pubEvent: boolean = false): IRspSubjectSet {
    const success = new Subject<IJsonTable>();
    const error = new Subject<IJsonTable>();
    const complete = new Subject<void>();

    pubEvent && this.evtSrv.publish(EVENT_LOADING, true);

    const finish = () => {
      if (complete.observed) {
        complete.next();
      }
      pubEvent && this.evtSrv.publish(EVENT_LOADING, false);
    };

    this.http.request<IJsonTable>(method, url, options).subscribe({
      next: (result: IJsonTable) => {
        if (result.state === 0) {
          if (success.observed) {
            success.next(result);
          } else {
            this.msgSrv.success(result.msg === 'success' ? '执行成功' : result.msg);
          }
          return;
        }

        if (error.observed) {
          error.next(result);
          return;
        }

        if (result.state === 1) {
          this.msgSrv.error('系统繁忙，请稍后再试!');
        } else {
          this.msgSrv.error(`${result.msg}[${result.state}]`);
        }
      },
      error: (httpError: HttpErrorResponse) => {
        const result: IJsonTable = {
          state: Number(httpError.status || -1),
          msg: httpError.error?.msg || httpError.error?.message || httpError.message || '请求失败',
          data: httpError.error?.data
        };
        if (error.observed) {
          error.next(result);
        } else {
          this.msgSrv.error(result.msg);
        }
        finish();
      },
      complete: () => {
        finish();
      }
    });

    return {
      success: success.asObservable(),
      error: error.asObservable(),
      complete: complete.asObservable()
    };
  }

  public reqGet(url: string, params?: any, options?: IKVPaire, pubEvent: boolean = false): IRspSubjectSet {
    options = { params, ...options };
    return this.request('get', url, options, pubEvent);
  }

  public reqPost(url: string, body?: any, params?: any, options?: IKVPaire, pubEvent: boolean = false): IRspSubjectSet {
    options = { params, body, ...options };
    return this.request('post', url, options, pubEvent);
  }

  public reqPut(url: string, body?: any, params?: any, options?: IKVPaire, pubEvent: boolean = false): IRspSubjectSet {
    options = { params, body, ...options };
    return this.request('put', url, options, pubEvent);
  }

  public reqDelete(url: string, params?: any, options?: IKVPaire, pubEvent: boolean = false): IRspSubjectSet {
    options = { params, ...options };
    return this.request('delete', url, options, pubEvent);
  }
}
