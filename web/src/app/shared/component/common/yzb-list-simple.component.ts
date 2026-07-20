import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { STChange, STColumn, STComponent, STData, STRowClassName } from '@delon/abc/st';
import { SFComponent, SFSchema, SFUISchema } from '@delon/form';

import { IEventEmitter, IGetDataParam, IGridPage } from '../../model/public-api';
import { YzbBaseComponent } from '../base/yzb-base.component';
import { SHARED_IMPORTS } from '@shared';

@Component({
  selector: 'yzb-list-simple',
  imports: SHARED_IMPORTS,
  templateUrl: './yzb-list-simple.component.html'
})
export class YzbListSimpleComponent extends YzbBaseComponent implements OnChanges {
  //#region 组件基础

  /**
   * 组件宽度，282是最小
   */
  @Input() width: number | string = '282px';
  /**
   * 组件高度，距离底部125px
   */
  @Input() height: number | string = 'calc(100vh - 125px)';
  /**
   * 其他样式集合
   */
  @Input() style: any = {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['schema']) {
      if (Object.keys((changes['schema'].currentValue as SFSchema).properties!).length > 0) {
        this.initControl = false;
      }
    }
  }
  //#endregion

  //#region 筛选条件区域

  /**
   * 标题
   */
  @Input() title: string = '';

  /**
   * 查询条件区配置项
   */
  @Input() schema: SFSchema = {
    properties: {}
  };
  /**
   * 查询条件区UI配置
   */
  @Input() ui: SFUISchema = {};
  /**
   * 组件初始化
   */
  initControl = true;
  /**
   * 条件配置区域按钮是否显示
   */
  buttonDisplay = 'none';
  /**
   * 查询条件区组件
   */
  @ViewChild('sf', { static: false }) sf!: SFComponent;

  search($event: IEventEmitter) {
    this.getData({
      source: this,
      data: {
        curr: 1,
        num: this.gridPage.ps,
        condition: this.sf.value,
        sort: null
      } as IGetDataParam
    });
  }

  reset($event: IEventEmitter) {
    this.sf.reset();
  }

  //#endregion
  //#region 列表数据区域
  /**
   * 滚动配置
   */
  @Input() scroll = { y: '390px' };
  /**
   * 列表字段定义
   */
  @Input() columns: STColumn[] = [{}];
  /**
   * 列表数据
   */
  @Input() data: any[] = [];

  /**
   * 列表组件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-29
   * @type {STComponent}
   */
  @ViewChild('st', { static: false }) st!: STComponent;
  /**
   * st表格分页数据
   */
  @Input() gridPage: IGridPage = {
    pi: 1,
    ps: 10,
    total: 0
  };

  /**
   * 表格行样式，用于处理选中行的样式
   */
  @Input() rowClassName: STRowClassName = (row, index) => {
    return this.selectRow?.index === index ? 'bg-grey-light' : '';
  };
  /**
   * 获取数据事件，condition节点为原始sf数据结构
   */
  @Output() readonly getDataEvent = new EventEmitter<IEventEmitter>();
  /**
   * 表格数据变化触发
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-03-23
   * @param {STChange} $event
   */
  stChange($event: STChange): void {
    switch ($event.type) {
      case 'pi':
      case 'ps':
      case 'sort':
        this.getData({
          source: this,
          data: {
            curr: $event.pi,
            num: $event.ps,
            condition: this.sf.value,
            sort: $event.sort && $event.sort.map ? $event.sort.map : null
          } as IGetDataParam
        });
        break;
      case 'click':
        this.setSelectRow({
          index: $event.click!.index as number,
          data: $event.click!.item
        });
        break;
    }
  }

  /**
   * 获取数据
   */
  protected getData(eventEmitter: IEventEmitter) {
    this.setSelectRow();
    this.getDataEvent.emit(eventEmitter);
  }
  /**
   * 选中行数据事件
   */
  @Output() readonly selectRowEvent = new EventEmitter<IEventEmitter>();
  /**
   * 设置选中数据
   */
  protected setSelectRow(selectRow: { index: number; data: STData } | null = null) {
    // 先处理掉选中状态
    if (null !== this.selectRow) {
      this.st.setRow(this.selectRow.index, {
        checked: false
      });
    }
    // 设置选中行数据
    this.selectRow = selectRow;
    // 触发行选中事件
    this.selectRowEvent.emit({
      source: this.st,
      data: this.selectRow
    });
    if (null != selectRow) {
      this.st.setRow(this.selectRow!.index, {
        checked: true
      });
    }
    this.cdr.detectChanges();
  }

  /**
   * 当前选中行数据
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-03-23
   * @protected
   * @type {STData}
   */
  protected selectRow: { index: number; data: STData } | null = null;

  //#endregion
}
