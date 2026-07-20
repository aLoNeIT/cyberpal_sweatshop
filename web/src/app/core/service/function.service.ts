import { Injectable } from '@angular/core';
import { CacheService } from '@delon/cache';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IJsonTable, JsonTableData } from '@shared/model';

@Injectable({
  providedIn: 'root'
})
export class FunctionService {
  constructor(
    private http: _HttpClient,
    private cacheSvr: CacheService
  ) {}

  protected getUri(appType: number = 1): string {
    switch (appType) {
      case 1:
      default:
        return 'admin/v1/function/privilege_detail';
    }
  }

  get(menu: string, appType: number = 1): Observable<JsonTableData> {
    return new Observable<JsonTableData>(observer => {
      this.cacheSvr
        .get<IJsonTable>(this.getUri(appType), {
          mode: 'promise',
          type: 'm',
          expire: 86400
        })
        .pipe(map(value => value.data))
        .subscribe(result => {
          observer.next(result as JsonTableData);
        });
    });
  }
}
