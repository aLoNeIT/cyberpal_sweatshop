import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { deepCopy } from '@delon/util';
import { Subject } from 'rxjs';

import { IEventEmitter, ISelectItem, IYzbListItem } from '../../model/public-api';
import { SHARED_IMPORTS } from '@shared';

@Component({
  selector: 'yzb-list',
  imports: SHARED_IMPORTS,
  templateUrl: './yzb-list.component.html'
})
/**
 * 列表组件
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-26
 * @class YzbListComponent
 * @implements {OnInit}
 */
export class YzbListComponent implements OnInit, OnChanges {
  //#region 组件基础

  /**
   * 是否可关闭
   */
  @Input() enableClose = true;

  /**
   * 标题
   */
  @Input() title = '数据选择';

  /**
   * 是否带有边框
   */
  @Input() bordered = false;
  /**
   * 列表大小
   */
  @Input() size: 'default' | 'small' | 'large' = 'default';
  /**
   * 数据载入状态
   */
  @Input() loading = false;
  /**
   * 列表头
   */
  @Input() header?: string | TemplateRef<void> = undefined;
  /**
   * 列表尾
   */
  @Input() footer?: string | TemplateRef<void> = undefined;
  /**
   * 列表项目布局方式
   */
  @Input() itemLayout: 'vertical' | 'horizontal' = 'horizontal';
  /**
   * 列表无数据时界面
   */
  @Input() noResult: string | TemplateRef<void> = '暂无数据';

  constructor() {}

  ngOnInit() {
    // 组件初始化
    let i = 0;
    i++;
  }

  ngOnChanges(changes: SimpleChanges) {
    // 数据变更执行这里
    let i = 0;
    i++;
  }

  //#endregion

  //#region 组件功能
  /**
   * 界面是否显示
   */
  visibled = false;

  /**
   * 选中项内容
   */
  protected selectedItem: ISelectItem | ISelectItem[] = { index: -1, data: null };
  /**
   * 是否多选
   */
  protected multied = false;
  /**
   * 列表数据，任意类型数组，但是需要支持toString方法
   */
  protected data!: IYzbListItem[];
  /**
   * 原始数据
   */
  showData!: IYzbListItem[];
  /**
   * 提交事件订阅对象
   */
  protected modalSubject = new Subject<IYzbListItem | IYzbListItem[]>();
  /**
   * 自动关闭
   */
  @Input() autoClosed = false;
  /**
   * 提交数据事件，若是多选模式，则返回一个数组
   */
  submit() {
    this.modalSubject.next(
      this.multied
        ? (this.selectedItem as ISelectItem[]).map(item => {
            return item.data as IYzbListItem;
          })
        : ((this.selectedItem as ISelectItem).data as IYzbListItem)
    );
    this.visibled = !this.autoClosed;
  }

  /**
   * 界面关闭，不触发选择事件
   */
  close() {
    this.visibled = false;
  }

  /**
   * 确定选择
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-27
   * @param {IYzbListItem[]} [data=[]] 界面显示内容
   * @param {boolean} [multied=false] 是否多选
   * @param {any | any[]} selectData 选中项
   * @returns {*}  {(Subject<IYzbListItem | IYzbListItem[]>)} 返回一个订阅对象
   */
  open(data: IYzbListItem[] = [], multied = false, selectData?: any | any[]): Subject<IYzbListItem | IYzbListItem[]> {
    this.data = data;
    this.multied = multied;
    // 显示数据初始化
    this.showData = deepCopy(this.data);
    // 选中数据初始化
    this.selectedItem = this.multied ? [] : { index: -1, data: null };
    if (selectData) {
      if (this.multied) {
        // 双重循环查找选中项
        (selectData as IYzbListItem[]).forEach(val => {
          // 循环传递进来的选中项，寻找他在元素列表中的下标和对象
          this.data.every((item, idx) => {
            if (val == item.value) {
              (this.selectedItem as ISelectItem[]).push({
                index: idx,
                data: item
              });
              return false;
            }
            return true;
          });
        });
      } else {
        // 单循环查找
        this.data.every((item, idx) => {
          if ((item.value = (selectData as IYzbListItem).value)) {
            this.selectedItem = {
              index: idx,
              data: item
            };
            return false;
          }
          return true;
        });
      }
    }
    // 显示
    this.visibled = true;
    // 返回订阅对象
    return this.modalSubject;
  }
  /**
   * 列表项点击方法，传递给父类使用
   */
  @Output() readonly itemClickEvent = new EventEmitter<IEventEmitter>();
  /**
   * 列表项点击方法
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-26
   * @param {Event} $event
   * @param {*} item
   */
  itemClick($event: IEventEmitter | any, item: IYzbListItem, index: number): void {
    if (this.multied) {
      let $index = -1;
      const selItem = (this.selectedItem as ISelectItem[]).find((val, idx) => {
        $index = idx;
        return val.data!.value == item.value;
      });
      if (selItem) {
        // 已存在则删除
        (this.selectedItem as ISelectItem[]).splice($index, 1);
      } else {
        // 不存在则添加
        (this.selectedItem as ISelectItem[]).push({
          index: index,
          data: item
        });
      }
    } else {
      this.selectedItem = {
        index: index,
        data: item
      };
    }
    this.itemClickEvent.emit({
      $event: $event,
      data: this.selectedItem,
      source: this
    });
  }
  /**
   * 选中行样式
   */
  @Input() selectedClassName: string | string[] = 'bg-grey-light';
  /**
   * 列表项获取样式名称
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-26
   */
  itemClassName(item: IYzbListItem, index: number): string | string[] {
    if (this.multied) {
      const currItem = (this.selectedItem as ISelectItem[]).find(val => {
        return val.data!.value == item.value;
      });
      return currItem ? this.selectedClassName : '';
    } else {
      return index == (this.selectedItem as ISelectItem).index ? this.selectedClassName : '';
    }
  }
  /**
   * 搜索文本变更
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-26
   * @param {InputEvent} $event 输入的文本内容
   */
  onSearchInput($event: IEventEmitter) {
    this.showData = this.data.filter((item: IYzbListItem) => {
      return item.label.indexOf(($event.target as any).value) >= 0;
    });
  }

  //#endregion
}
