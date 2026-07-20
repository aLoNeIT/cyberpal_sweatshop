import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { STChange, STColumn, STComponent, STData, STPage, STRowClassName } from '@delon/abc/st';
import { InputBoolean } from 'ng-zorro-antd/core/util';

import { IYzbButton } from './yzb-button-group.component';
import { IEventEmitter, IGetDataParam, IGridPage } from '../../model/public-api';
import { YzbBaseComponent } from '../base/yzb-base.component';
import { SHARED_IMPORTS } from '@shared';

@Component({
  selector: 'yzb-master-detail',
  imports: SHARED_IMPORTS,
  templateUrl: './yzb-master-detail.component.html'
})
export class YzbMasterDetailComponent extends YzbBaseComponent implements AfterViewInit, OnChanges {
  //#region 组件基础
  @Input() width: number | string = '100%';
  @Input() height: number | string = 'calc(100vh - 125px)';
  @Input() style: any = {};

  @Input() @InputBoolean() backButtonVisibled = true;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['masterItems'] && changes['masterItems'].currentValue) {
      this.masterData = [];
    }
  }
  //#endregion

  //#region master区域
  /**
   * 主区域标题
   */
  @Input() masterTitle = '';
  /**
   * 主区域每个数据项标签宽度
   */
  @Input() masterLabelWidth = 100;
  /**
   * 主区域每行显示几个数据项
   */
  @Input() masterCol = 4;
  /**
   * 主区域数据项定义及数据
   */
  @Input() masterItems: IMasterItem[] = [];

  protected _masterData: any[] = [];

  @Output() readonly buttonBackClickEvent = new EventEmitter();

  onButtonBackClick($event: IEventEmitter) {
    this.buttonBackClickEvent.emit({
      source: $event.target,
      $event: $event
    });
  }

  /**
   * 主区域数据
   */
  set masterData(value: any) {
    // 根据配置项处理数据
    const data: Array<{ title: string; value: string }> = [];
    this.masterItems.forEach((item: IMasterItem) => {
      if (value[item.field]) {
        data.push({
          title: item.title,
          value: item.format ? item.format(value[item.field], item.field) : value[item.field]
        });
      } else {
        data.push({
          title: item.title,
          value: '-'
        });
      }
    });
    this._masterData = data;
  }

  get masterData(): any {
    return this._masterData;
  }

  //#endregion

  //#region 按钮区
  /**
   * 开启acl校验
   */
  @Input() @InputBoolean() enableAcl = true;
  /**
   * 按钮组件
   */
  @Input() buttons: IYzbButton[] = [
    {
      title: '测试',
      code: '01010101',
      enable: true
    }
  ];

  @Output() readonly buttonClickEvent = new EventEmitter<IEventEmitter>();

  onButtonClick($event: IEventEmitter) {
    this.buttonClickEvent.emit($event);
  }
  //#endregion

  //#region detail区域
  /**
   * 明细区域标题
   */
  @Input() detailTitle = '';

  /**
   * 列表字段定义
   */
  @Input() columns: STColumn[] = [{}];
  /**
   * 列表数据
   */
  @Input() data: any[] = [];
  /**
   * 滚动配置
   */
  @Input() scroll = { y: '390px' };

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

  @Input() page: STPage = {
    front: false,
    showSize: true,
    show: true,
    pageSizes: [10, 20, 30, 50, 100],
    showQuickJumper: true,
    total: '第 [{{range[0]}}] 到 [{{range[1]}}] 条/共 [{{total}}] 条'
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
            condition: null,
            sort: $event.sort && $event.sort.map ? $event.sort.map : null
          } as IGetDataParam
        });
        break;
      case 'click':
        this.setSelectRow({
          index: $event.click!.index!,
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

  ngAfterViewInit(): void {
    let i = 0;
    i++;
  }
}
/**
 * 主数据区配置项定义
 */
export interface IMasterItem {
  field: string;
  title: string;
  format?: (value: any, field?: string) => string;
  value?: any;
}
