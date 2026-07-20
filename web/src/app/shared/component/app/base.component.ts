import { Component, OnChanges, OnInit, SimpleChanges, AfterViewInit, OnDestroy } from '@angular/core';
import { Base64 } from 'js-base64';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { of, Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { EventService, PrivilegeService, HttpLogic } from '@core';
import { EVENT_LOADING } from './../../consts/component.consts';
import { YzbBaseComponent } from './../base/yzb-base.component';
import { parseConditionSet } from '../../utils/function';
import { IConditionSet, IStringPaire, IRspSubjectSet, IKVPaire } from '../../model/public-api';

/**
 * 业务层基础组件
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-03-23
 * @export
 * @class BaseComponent
 * @extends {YzbBaseComponent}
 */
@Component({
  template: ''
})
export class BaseComponent extends YzbBaseComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  //#region 页面UI
  /**
   * 页面自带的过滤条件
   */
  protected filter: IConditionSet = {};
  /**
   * 载入状态计数
   */
  private _loadingNum: number = 0;
  /**
   * 加载事件监听对象
   *
   * @type {Subscription}
   */
  private _loadingSubscription?: Subscription = undefined;

  /**
   * 开始加载
   */
  startLoading() {
    this.loading = ++this._loadingNum > 0;
    this.cdr.detectChanges();
  }
  /**
   * 停止加载
   */
  stopLoading() {
    this.loading = --this._loadingNum > 0;
    this.cdr.detectChanges();
  }

  // 组件初始化
  ngOnInit() {
    let i = 0;
    i++;
    this._loadingSubscription = this.eventService.subscribe<boolean>(EVENT_LOADING, event => {
      event ? this.startLoading() : this.stopLoading();
    });
  }

  ngOnDestroy() {
    this._loadingSubscription!.unsubscribe();
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  // 组件视图显示
  ngAfterViewInit() {
    let i = 0;
    i++;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['loading']) {
      // 根据父组件进行的配置来调整加载状态
      // 20220109，貌似这里不会被触发，因为当前组件一般情况下不会作为子组件被使用
      true === changes['loading'].currentValue ? this.startLoading() : this.stopLoading();
    }
  }
  /**
   * 权限服务
   */
  protected get privilegeSrv(): PrivilegeService {
    return this.injector.get<PrivilegeService>(PrivilegeService);
  }
  /**
   * 事件服务
   */
  protected get eventService(): EventService {
    return this.injector.get<EventService>(EventService);
  }
  /**
   * 路由服务
   */
  protected get router(): Router {
    return this.injector.get<Router>(Router);
  }
  /**
   * 当前路由
   */
  protected get route(): ActivatedRoute {
    return this.injector.get<ActivatedRoute>(ActivatedRoute);
  }
  /**
   * 获取页面数据
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-30
   * @protected
   * @param {string} 接口地址
   * @param {number} [curr=1] 页码
   * @param {number} [num=10] 每页数量
   * @param {IStringPaire} [sortMap=null] 排序方式
   * @returns {*}  {IRspSubjectSet}
   */
  protected getData(
    uri: string,
    curr: number = 1,
    num: number = 10,
    condData: IConditionSet | null = null,
    sortData: IStringPaire | null = null
  ): IRspSubjectSet {
    let params = {
      p: curr,
      num: num
    } as NzSafeAny;
    // 合并filter和condition
    const condition = parseConditionSet({ ...this.filter, ...(null === condData ? {} : condData) });
    // 若有值，则合并参数
    if (Object.keys(condition).length > 0) {
      params = { ...params, condition: Base64.encode(JSON.stringify(condition)) };
    }
    if (sortData && Object.keys(sortData).length > 0) {
      console.log(sortData);
      params = { ...params, order: Base64.encode(JSON.stringify(sortData)) };
    }
    return this.reqGet(uri, params);
  }

  //#endregion

  //#region 通用方法
  /**
   * http请求方法，统一处理loading和响应信息，返回成功和失败订阅对象
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-27
   * @protected
   * @param {string} method 请求方法
   * @param {string} url 请求地质
   * @param {IKVPaire} options 配置信息
   * @returns {*}  {IRspSubjectSet}
   */
  protected request(method: string, url: string, options: IKVPaire, showLoading: boolean = true): IRspSubjectSet {
    const { success, error, complete } = HttpLogic.getInstance(this.injector).request(method, url, options, showLoading);
    // 成功和失败的订阅
    const curdComplete = new Subject<void>();
    // complete!.subscribe(() => {
    //   curdComplete.next();
    // });
    // 返回Observable对象方便上层订阅
    return {
      success: success,
      error: error,
      complete: of()
    };
  }
  /**
   * get请求
   *
   * @param {string} url 请求地址
   * @param {*} [params] 请求参数
   * @param {IKVPaire} [options] 请求选项信息
   * @param {boolean} [showLoading=true] 是否显示加载状态
   * @returns {*}  {IRspSubjectSet}
   */
  protected reqGet(url: string, params?: any, options?: IKVPaire, showLoading: boolean = true): IRspSubjectSet {
    options = { params, ...options };
    return this.request('get', url, options, showLoading);
  }
  /**
   * post请求
   *
   * @param {string} url 请求地址
   * @param {*} [body] 请求body数据
   * @param {*} [params] 请求queryString参数
   * @param {IKVPaire} [options] 请求选项信息
   * @param {boolean} [showLoading=true] 是否显示加载状态
   * @returns {*}  {IRspSubjectSet}
   */
  protected reqPost(url: string, body?: any, params?: any, options?: IKVPaire, showLoading: boolean = true): IRspSubjectSet {
    options = { params, body, ...options };
    return this.request('post', url, options, showLoading);
  }
  /**
   * put请求
   *
   * @param {string} url 请求地址
   * @param {*} [body] 请求body数据
   * @param {*} [params] 请求queryString参数
   * @param {IKVPaire} [options] 请求选项信息
   * @param {boolean} [showLoading=true] 是否显示加载状态
   * @returns {*}  {IRspSubjectSet}
   */
  protected reqPut(url: string, body?: any, params?: any, options?: IKVPaire, showLoading: boolean = true): IRspSubjectSet {
    options = { params, body, ...options };
    return this.request('put', url, options, showLoading);
  }
  /**
   * delete请求
   *
   * @param {string} url 请求地址
   * @param {*} [params] 请求queryString参数
   * @param {IKVPaire} [options] 请求选项信息
   * @param {boolean} [showLoading=true] 是否显示加载状态
   * @returns {*}  {IRspSubjectSet}
   */
  protected reqDelete(url: string, params?: any, options?: IKVPaire, showLoading: boolean = true): IRspSubjectSet {
    options = { params, ...options };
    return this.request('delete', url, options, showLoading);
  }
  /**
   * 页面订阅集合
   */
  protected subscriptions: Subscription[] = [];

  //#endregion
}
