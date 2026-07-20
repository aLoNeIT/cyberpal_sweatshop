import { Injectable } from '@angular/core';
import { CacheService } from '@delon/cache';
import { _HttpClient } from '@delon/theme';
import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';

import { Dict, DictSet, IJsonTable, JsonTableData, IDict } from '@shared/model';
import { PrivilegeService } from './privilege.service';

// 字典信息接口
const DICT_URI = 'home/v1/dict';
// 码表信息接口
const DICT_CODE = 'home/v1/code';

/**
 * 字典服务类
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2020-12-25
 * @export
 * @class DictService
 */
@Injectable({
  providedIn: 'root'
})
export class DictService {
  constructor(
    private http: _HttpClient,
    private cacheSvr: CacheService,
    private privilegeSrv: PrivilegeService
  ) {}

  protected dictSet: DictSet = {};

  /**
   * 添加字典信息
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-25
   * @param {IDict} dict 字典项
   */
  append(dict: IDict): void {
    this.dictSet[dict.id!.toString()] = new Dict(dict);
  }
  /**
   * 获取本地字典对象
   */
  getLocal(dictId: number): Dict {
    return this.dictSet[dictId.toString()];
  }

  get(dictId: number | number[], appType: number = -1): Observable<IDict[]> {
    // 封装成数组
    if (!Array.isArray(dictId)) {
      dictId = [dictId];
    }
    let appTypeUri = '';
    if (-1 !== appType) {
      appTypeUri = `?app_type=${appType}`;
    }
    // 字典观察者
    const dictObs: Array<Observable<IJsonTable>> = [];
    // 将缓存放入待处理数组
    dictId.forEach(item => {
      dictObs.push(
        this.cacheSvr.get<IJsonTable>(`${DICT_URI}/${item}${appTypeUri}`, {
          mode: 'promise',
          type: 'm',
          expire: 86400
        })
      );
    });
    // 返回观察者数据
    return new Observable<IDict[]>(observer => {
      zip(...dictObs)
        .pipe(map(values => values.map(item => item.data)))
        .subscribe(result => {
          observer.next(result as IDict[]);
        });
    });
  }

  getCode(dictId: number): Observable<JsonTableData> {
    // 字典观察者
    const dictObs: Array<Observable<IJsonTable>> = [];
    // 返回观察者数据
    return new Observable<JsonTableData>(observer => {
      this.cacheSvr
        .get<IJsonTable>(`${DICT_CODE}?dict=${dictId}`, {
          mode: 'promise',
          type: 'm',
          expire: 86400
        })
        .pipe(map(value => value.data))
        .subscribe(result => {
          observer.next(result);
        });
    });
  }
}
