import { LazyService } from '@delon/util';
import { Observable, of } from 'rxjs';

import { BaseLogic } from './base.logic';

const TEMPLATEJS_URI = 'assets/tmp/index.aio.js';
declare var template: (content: any, data: any) => string;

export class TemplateJsLogic extends BaseLogic {
  // 是否加载成功
  protected loaded = false;

  protected engine(): Observable<boolean> {
    return false === this.loaded
      ? new Observable<boolean>(observer => {
          // 调用LasyService加载异步js
          this.lazySrv.loadScript(TEMPLATEJS_URI).then((result: any) => {
            if ('ok' !== result.status) {
              this.msgSrv.error('加载模板引擎失败');
              return;
            }
            this.loaded = true;
            observer.next(this.loaded);
          });
        })
      : of(this.loaded);
  }

  protected get lazySrv(): LazyService {
    return this.injector.get(LazyService);
  }

  public render(htmlTmpl: string, data: any): Observable<string> {
    return new Observable<string>(observer => {
      this.engine().subscribe({
        next: result => {
          if (false === result) {
            return;
          }
          const html = template(htmlTmpl, data);
          observer.next(html);
        }
      });
    });
  }
}
