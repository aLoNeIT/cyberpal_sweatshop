import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { IEventItem, IEventItemSet } from '@shared/model';

/**
 * 事件服务，可以通过该服务订阅不同的事件信息
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-28
 * @export
 * @class EventService
 */
@Injectable({
  providedIn: 'root'
})
export class EventService implements OnDestroy {
  /**
   * 事件集合
   */
  protected events: IEventItemSet = {};
  /**
   * 订阅事件
   *
   * @template T 订阅响应的数据类型
   * @param {string} key 事件名称
   * @param {(value: T) => void} next 时间回调函数
   * @returns {Subscription} 返回事件对应的Subscription对象用于订阅
   */
  subscribe<T>(key: string, next: (value: T) => void): Subscription {
    const event: IEventItem = this.getEvent(key);
    return event.subject.subscribe(next);
  }
  /**
   * 事件发布
   *
   * @template T 发布的数据类型
   * @param {string} key 事件名称
   * @param {T} value 发布的数据
   */
  publish<T>(key: string, value: T): void;
  /**
   * 事件发布
   *
   * @param {string} key 事件名称
   * @param {*} value 发布的数据
   */
  publish(key: string, value: any): void {
    const event: IEventItem = this.getEvent(key);
    event.subject.next(value);
  }
  /**
   * 获取事件对象
   *
   * @param {string} key
   * @returns {*}  {IEventItem}
   */
  protected getEvent(key: string): IEventItem {
    if (!this.events[key]) {
      // 没有发现该事件对应对象则立即创建一个
      this.events[key] = {
        name: key,
        subject: new Subject<any>()
      } as IEventItem;
    }
    return this.events[key];
  }
  /**
   * 清理事件对象
   *
   * @param {string} [key] 事件名称，为空则表示清理所有
   */
  protected clear(key?: string): void {
    const events = key
      ? (k => {
          const item = this.getEvent(k),
            itemSet = {} as IEventItemSet;
          itemSet[k] = item;
          return itemSet;
        })(key)
      : this.events;
    Object.keys(events).forEach(key => {
      const item = this.events[key],
        subject = item.subject;
      subject.unsubscribe();
    });
    key ? delete this.events[key] : (this.events = {});
  }
  /**
   * 组件销毁
   */
  ngOnDestroy() {
    // 清理所有订阅对象
    this.clear();
  }
}
