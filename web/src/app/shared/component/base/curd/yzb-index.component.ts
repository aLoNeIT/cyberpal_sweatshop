import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  Output,
  SimpleChanges,
  ViewContainerRef,
  ViewChild,
  TemplateRef,
  Type,
  numberAttribute
} from '@angular/core';
import {
  STChange,
  STClickRowClassNameType,
  STColumn,
  STColumnButton,
  STComponent,
  STContextmenuFn,
  STContextmenuItem,
  STContextmenuOptions,
  STData,
  STPage,
  STRowClassName
} from '@delon/abc/st';
import { SFComponent, SFSchema, SFUISchema, SFUISchemaItem } from '@delon/form';
import { InputBoolean } from 'ng-zorro-antd/core/util';

import { YzbCurdComponent } from 'src/app/shared/component/base/curd/yzb-curd.component';
import { SFSchemaManager } from '../../../extend/sfschema/sfschema';
import { STColumnManager } from '../../../extend/stcolumn/stcolumn';
import { IEventEmitter, IGetDataParam, IGridPage, IKVPaire, IFunctionSet, IDict, IFunction, Dict } from '../../../model/public-api';
import { IYzbButton, YzbButtonGroupComponent } from '../../common/yzb-button-group.component';
import { copy } from '@delon/util';
import { from } from 'rxjs';
import { SHARED_IMPORTS } from '@shared';

/**
 * 分页每页数据量
 */
const PAGE_SIZES = [10, 20, 30, 50, 100];

/**
 * 行选中
 */
export interface ISelectRow {
  index: number;
  data: STData;
}

/**
 * 基础组件，封装常用方法
 */
@Component({
  selector: 'yzb-index',
  imports: [...SHARED_IMPORTS, YzbButtonGroupComponent],
  templateUrl: './yzb-index.component.html'
})
/**
 * 列表页组件类型
 */
export class YzbIndexComponent extends YzbCurdComponent {
  //#region 组件初始化

  /**
   * 按钮组右侧区域模板
   */
  @Input() buttonsRightSideTemplate!: TemplateRef<any>;

  /**
   * 标题
   */
  @Input() title = 'Yzb';

  /**
   * 获取按钮接口
   */
  @Input() menuCode = '';

  /**
   * 应用类型
   */
  @Input() appType = 3;
  /**
   * 显示按钮区控制，1顶部，2列表，4右键
   */
  @Input({ transform: numberAttribute }) buttonStyle = 7;
  /**
   * 显示按钮判断
   *
   * @param style 按钮样式
   * @returns 返回是否显示结果
   */
  showButton(style: number): boolean {
    return style == (style & this.buttonStyle);
  }

  /**
   * 是否显示行号
   */
  @Input() @InputBoolean() rowNumbered = true;
  /**
   * 是否多选
   */
  @Input() @InputBoolean() multiSelected = false;
  /**
   * 是否显示复选框
   *
   * @author 王阮强(wangruanqiang@hongshanhis.com)
   * @date 2022-11-22
   */
  @Input() @InputBoolean() checkBoxed = false;

  /**
   * condButtonDisplay = 'block';
   * 原用于按钮样式调整，14版本后不需要
   */
  condButtonDisplay = '';

  protected override initialize() {
    super.initialize();
    this.curd = 1;
  }

  /**
   * 初始化字典相关组件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-15
   * @protected
   * @param {Dict} dict
   */
  protected override onInitDict(dict: Dict) {
    super.onInitDict(dict);
    const dictData = dict.getData();
    this.initCondition(dictData);
    this.initGrid(dictData);
    this.condButtonDisplay =
      Object.keys(this.condSchema.properties!).filter(key => {
        return !(this.condSchema.properties![key].ui as SFUISchemaItem).hidden;
      }).length == 0
        ? 'none'
        : /**
           * : 'block';
           * 原用于按钮样式调整，14版本后不需要
           */
          '';
    this.initGridButton(this.columns, this.buttonsGrid);
    this.initControl = false;
    setTimeout(() => {
      // 执行触发更新数据
      const condData = this.procCondition(this.condition.value);
      // 提交给父组件进行加工
      this.searchEvent.emit({
        source: this.condition,
        data: condData
      });
      this.getData({
        source: this,
        data: {
          curr: this.gridPage.pi,
          num: this.gridPage.ps,
          condition: condData,
          sort: null
        } as IGetDataParam
      });
    });
  }

  /**
   * Input属性变动监测
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-31
   * @param {SimpleChanges} changes 简单变更对象
   */
  override onChanges(changes: SimpleChanges) {
    super.onChanges(changes);
    if (changes['functionSet'] && changes['functionSet'].currentValue) {
      this.initButtons(changes['functionSet'].currentValue as IFunctionSet);
      this.initGridButton(this.columns, this.buttonsGrid);
    }
    if (changes['gridPage'] && changes['gridPage'].currentValue) {
      // 当列表数据发生变化，重新计算分页器中可改变的页数值
      const gridPage = changes['gridPage'].currentValue as IGridPage,
        pageSizes: number[] = [];
      PAGE_SIZES.every(value => {
        // 优先推入数据，再判断实际总数量是否超过分页器每页数量
        pageSizes.push(value);
        return value < gridPage.total;
      });
      this.stPage = { ...this.stPage, pageSizes: pageSizes };
    }
    if (changes['multiSelected'] && changes['multiSelected'].currentValue) {
      // 多选配置发生变化，需要重新设置点击行设置
      this.clickRowClassName = {
        ...this.clickRowClassName,
        exclusive: !(changes['multiSelected'].currentValue as boolean)
      };
    }
  }

  /**
   * 右键菜单
   *
   * @author 王阮强(wangruanqiang@hongshanhis.com)
   * @date 2021-10-25
   * @param {STContextmenuOptions} options 菜单选项
   * @type {STContextmenuFn}
   */
  createContextMenu: STContextmenuFn = (options: STContextmenuOptions): STContextmenuItem[] => {
    return this.showButton(4)
      ? []
      : this.buttonsContextMenu.map((button: IYzbButton) => {
          return {
            text: button.title,
            code: button.code,
            fn: (item: STContextmenuItem) => {
              // 获取数据所属的下标
              const data = options.data,
                index = this.grid.list.indexOf(data);
              !this.multiSelected &&
                this.setSelectRow({
                  index,
                  data
                });
              // 设置选中样式
              // this.setSelectRowClassName(index, !this.multiSelected);
              // 触发按钮点击
              this.onButtonClick({
                source: this.grid,
                $event: options.event,
                data: item['code'],
                // 可能存在问题
                extend: {
                  index,
                  data
                }
              });
            }
          } as STContextmenuItem;
        });
  };

  //#endregion

  //#region 按钮初始化

  /**
   * 顶部按钮组
   */
  buttonsTop: IYzbButton[] = [];
  /**
   * 右键菜单
   */
  buttonsContextMenu: IYzbButton[] = [];

  /**
   * 当前页按钮组
   */
  buttons: IYzbButton[] = [];
  /**
   * 点击事件
   */
  @Output() readonly buttonClickEvent = new EventEmitter<IEventEmitter>();
  /**
   * 按钮点击事件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-18
   * @param {IEventEmitter} $event 按钮点击传递的参数
   */
  onButtonClick($event: IEventEmitter) {
    $event.extend = $event.extend || this.selectRow;
    this.buttonClickEvent.emit($event);
  }
  /**
   * 当前页面功能集合
   */
  @Input() functionSet!: IFunctionSet;
  /**
   * 是否需要返回按钮
   *
   * @type {boolean} 默认不需要
   */
  @Input() @InputBoolean() backButton: boolean = false;

  /**
   * 按钮生成完成后回调事件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2022-09-29
   */
  @Output() readonly initButtonsEvent = new EventEmitter<IEventEmitter>();

  /**
   * 初始化界面按钮
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-12
   * @protected
   * @param {IFunctionSet} functionSet 权限集合
   */
  protected initButtons(functionSet: IFunctionSet) {
    const topButtons: IYzbButton[] = [],
      contextButtons: IYzbButton[] = [],
      gridButtons: IYzbButton[] = [],
      totalButtons: IYzbButton[] = [];
    if (this.backButton) {
      topButtons.push({
        title: '返回',
        code: '99',
        type: 'default',
        style: 1,
        class: '',
        enable: true
      } as IYzbButton);
    }
    // 将后台的IFunction转换为IYzbButton格式
    Object.keys(functionSet).forEach((key, idx, arr) => {
      const item: IFunction = functionSet[key],
        button: IYzbButton = {
          title: item.name!,
          code: item.code!,
          type: item.type!,
          style: item.style,
          sort: item.sort,
          class: item.css,
          enable: 0 != item.state
        };
      // 顶部按钮
      if (1 == (button.style! & 1)) {
        topButtons.push(button);
      }
      // 行内按钮
      if (2 == (button.style! & 2)) {
        gridButtons.push(button);
      }
      // 列表右键按钮
      if (4 == (button.style! & 4)) {
        contextButtons.push(button);
      }
      totalButtons.push(button);
    });
    // 赋值变更
    this.buttonsTop = topButtons;
    gridButtons.sort((a: any, b: any) => a.sort - b.sort);
    this.buttonsGrid = gridButtons;
    this.buttonsContextMenu = contextButtons;
    // 提供上层修改按钮的机会
    this.initButtonsEvent.emit({
      data: totalButtons,
      source: this.grid
    });
    setTimeout(() => {
      if (this.buttonsContextMenu.length > 0 && this.grid) {
        this.grid.contextmenu = this.createContextMenu;
      }
    }, 500);
  }

  //#endregion

  //#region 表格相关初始化

  /**
   * 列表字段定义
   */
  columns: STColumn[] = [{}];

  /**
   * 列表按钮
   */
  protected buttonsGrid: IYzbButton[] = [];
  /**
   * 列表组件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-29
   * @type {STComponent}
   */
  @ViewChild('grid', { static: false }) grid!: STComponent;
  /**
   * 当前选中行数据
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-29
   * @protected
   * @type {(ISelectRow | ISelectRow[] | null)}
   */
  protected get selectRow(): ISelectRow | ISelectRow[] | null {
    const data = this.grid.list;
    if (data) {
      const selectRow: ISelectRow[] = [];
      data.forEach((item, index) => {
        if (item.checked) {
          selectRow.push({
            index: index,
            data: item
          });
        }
      });
      return 0 == selectRow.length ? null : this.multiSelected ? selectRow : selectRow[0];
    }
    return null;
  }
  /**
   * 行选中事件
   */
  @Output() readonly selectRowEvent: EventEmitter<IEventEmitter> = new EventEmitter<IEventEmitter>();
  /**
   * 本地缓存的列表数据，用于处理多选时的选中状态
   * 每一个元素都是列表中某行的下标值
   *
   */
  private localListIndex: number[] = [];

  /**
   * 表格数据改变事件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @param {STChange} $event 事件对象
   * @returns void
   */
  onGridChange($event: STChange): void {
    switch ($event.type) {
      case 'pi':
      case 'ps':
      case 'sort':
        const condData = this.procCondition(this.condition.value);
        this.searchEvent.emit({
          source: this.condition,
          data: condData
        });
        this.getData({
          source: this,
          data: {
            curr: $event.pi,
            num: $event.ps,
            condition: condData,
            sort:
              $event.sort && $event.sort.map
                ? (sortStr => {
                    const kv: IKVPaire = {};
                    sortStr.split('-').every(item => {
                      const arr = item.split('.');
                      if (2 == arr.length) {
                        kv[arr[0]] = arr[1];
                      }
                      return true;
                    });
                    return kv;
                  })($event.sort.map['sort'] || '')
                : null
          } as IGetDataParam
        });
        // 更换页码等操作则重置本地缓存
        this.localListIndex = [];
        break;
      case 'checkbox':
        this.selectRowEvent.emit({
          source: this.grid,
          data: this.selectRow
        });
        // if ($event.checkbox?.length == 0) {
        //   // 全部取消时，则置空
        //   this.localListIndex = [];
        //   this.setSelectRow(null);
        // } else {
        //   // 判断是否需要显示加载页面
        //   const needLoading = $event.checkbox && Math.abs($event.checkbox.length - this.localListIndex.length) > 10;
        //   if (needLoading) {
        //     this.loading = true;
        //   }
        //   timer(1).subscribe({
        //     next: () => {
        //       // 获取所有选中行的下标值
        //       const keys =
        //           $event.checkbox?.map((data, index, array) => {
        //             return this.grid.list.indexOf(data);
        //           }) || [],
        //         listIndex: number[] = [];
        //       // 对取消的行进行取消选中处理
        //       this.localListIndex.forEach(index => {
        //         if (-1 == keys.indexOf(index)) {
        //           this.setSelectRow({
        //             index: index,
        //             data: {
        //               ...this.grid.list[index],
        //               checked: true
        //             }
        //           });
        //         }
        //       });
        //       // 对新增的行进行选中处理
        //       keys.forEach(index => {
        //         listIndex.push(index);
        //         if (-1 == this.localListIndex.indexOf(index)) {
        //           this.setSelectRow({
        //             index: index,
        //             data: {
        //               ...this.grid.list[index],
        //               checked: false
        //             }
        //           });
        //         }
        //       });
        //       // 更新本地缓存
        //       this.localListIndex = listIndex;
        //     },
        //     complete: () => {
        //       // 如果开启了加载页面，则延迟关闭
        //       if (needLoading) {
        //         timer(1).subscribe({
        //           complete: () => {
        //             this.loading = false;
        //           }
        //         });
        //       }
        //     }
        //   });
        // }

        break;
      case 'radio':
        this.setSelectRow({
          index: this.grid.list.indexOf($event.radio),
          data: $event.radio
        });
        break;
      case 'click':
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim()) {
          break;
        }
        this.setSelectRow({
          index: $event.click!.index as number,
          data: $event.click!.item
        });
        break;
      case 'dblClick':
        const target = $event.dblClick?.e?.target;
        if (target instanceof HTMLSpanElement) {
          // 复制到剪切板
          const content = target.textContent as string;
          from(copy(content)).subscribe(() => {
            // 获取当前窗体选择区对象
            const selection = window.getSelection();
            if (selection) {
              // 移除其他所有选择区域
              selection?.removeAllRanges();
              const range = document.createRange();
              // 设置选中区域
              range.selectNodeContents(target);
              selection.addRange(range);
            }
            this.msgSrv.info('已复制单元格内容至剪切板');
          });
        }
        break;
    }
  }
  /**
   * 表格行样式，用于处理选中行的样式
   */
  rowClassName: STRowClassName = (row, index) => {
    return (row as STData).checked ? 'bg-grey-light' : 'bg-white';
  };

  /**
   * 表格行点击后样式
   *
   * @author 王阮强(wangruanqiang@hongshanhis.com)
   * @date 2021-10-25
   * @type {STClickRowClassNameType}
   */
  clickRowClassName: STClickRowClassNameType = {
    fn: (record, index) => {
      return 'bg-grey-light';
      // return this.selectRow?.index === index ? 'bg-grey-light' : '';
    },
    exclusive: !this.multiSelected // 后面可以配置行可复选
  };
  /**
   * 设置选中行样式，只需要提供下标即可
   *
   * @author 王阮强(wangruanqiang@hongshanhis.com)
   * @date 2021-10-25
   * @protected
   * @param {Number} index 选中行下标
   * @param {Boolean} [exclusive=true] 是否排除其他选中状态
   */
  protected setSelectRowClassName(index: Number, exclusive: boolean = true) {
    const className = 'bg-grey-light';
    const elementRef = this.injector.get(ElementRef);
    const trEl: HTMLElement = elementRef.nativeElement.querySelector(`tr[data-index='${index}']`);
    if (exclusive) {
      trEl.parentElement!!.querySelectorAll('tr').forEach((a: HTMLElement) => a.classList.remove(className));
    }
    if (trEl.classList.contains(className)) {
      trEl.classList.remove(className);
    } else {
      trEl.classList.add(className);
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
   * 设置选中数据
   */
  protected setSelectRow(selectRow: ISelectRow | null = null, ignore: boolean = false) {
    if (false === ignore) {
      if (null !== selectRow) {
        // 根据每行数据的checked来进行选择过滤
        if (this.multiSelected) {
          // 多选模式
          // this.grid.setRow(selectRow!.index, {
          //   checked: !selectRow!.data['checked']
          // });
        } else {
          // 单选
          // 先获取到当前选中的数据
          const index = (this.selectRow as ISelectRow)?.index;
          // 取消该行选中效果
          if (undefined != index) {
            this.grid.setRow(index, {
              checked: false
            });
          }
          // 设置新的选中行
          this.grid.setRow(selectRow!.index, {
            checked: true
          });
        }
      } else {
        if (this.multiSelected && this.selectRow != null) {
          (this.selectRow as ISelectRow[]).forEach(item => {
            this.grid.setRow(item.index, { checked: false });
          });
        } else {
          this.grid.setRow((this.selectRow as ISelectRow)?.index, { checked: false });
        }
      }
    }
    // 触发行选中事件
    this.selectRowEvent.emit({
      source: this.grid,
      data: this.selectRow
    });

    // this.cdr.detectChanges();
    return;
  }
  /**
   * 表格页码配置项
   */
  stPage: STPage = {
    front: false,
    showSize: true,
    show: true,
    pageSizes: [10, 20, 30, 50, 100],
    showQuickJumper: true,
    total: '第 [{{range[0]}}] 到 [{{range[1]}}] 条/共 [{{total}}] 条'
  };

  /**
   * 表格数据源
   */
  @Input()
  gridData: any[] = [];

  @Input()
  gridPage: IGridPage = {
    pi: 1,
    ps: 10,
    total: 0
  };
  /**
   * 表格初始化完成后回调事件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-29
   */
  @Output() readonly initGridEvent = new EventEmitter<IEventEmitter>();
  /**
   * 获取数据事件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-19
   */
  @Output() readonly getDataEvent = new EventEmitter<IEventEmitter>();

  /**
   * 初始化表格组件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-29
   * @param {IDict} dict 字典信息
   */
  public initGrid(dict: IDict) {
    // 获取动态表单管理器
    const stColumnManager = STColumnManager.instance();
    // 获取动态表单内容
    const columns = [
      ...(this.rowNumbered ? [{ title: '行号', type: 'no', width: 80, className: 'text-center' }] : []),
      ...stColumnManager.fromDictItemSet(dict.dict_item!)
    ];
    if (this.checkBoxed) {
      columns.unshift({
        title: '选择',
        type: this.multiSelected ? 'checkbox' : 'radio',
        className: 'text-center',
        width: 40
      });
    }
    // 添加按钮列，且设置为隐藏
    if (this.showButton(2)) {
      columns.push({
        title: '功能',
        width: 155,
        fixed: this.gridButtonFixed,
        className: 'text-center',
        buttons: [],
        iif: item => {
          // 根据按钮数量来决定当前列是否显示
          return (item.buttons?.length || 0) > 0;
        }
      });
    }

    // 触发初始化事件，传递grid对象，允许列表进行修改
    this.initGridEvent.emit({
      data: columns,
      source: this.grid
    });
    // 遍历处理列，计算scroll.x
    let width: number = 0;
    columns.forEach(column => {
      column = column as STColumn;
      if (column.title == '行号' || column.title == '功能' || column.title == '选择') {
        column.resizable = false;
      }
      if (Number.isInteger(column.width!)) {
        width += column.width as number;
      } else {
        // 处理字符串类型宽度，不支持百分比
        width += Number.parseInt(((column.width || '80') as string).replace('px', '').replace('%', '')) || 0;
      }
    });
    this.gridScroll = {
      x: `${width}px`
    };
    this.columns = columns as STColumn[];
  }

  @Input()
  gridButtonFixed: 'right' | 'left' = 'right';
  /**
   * 列表滚动条设置
   */
  gridScroll = {};

  /**
   * 表格初始化完成后回调事件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-29
   */
  @Output() readonly initGridButtonEvent = new EventEmitter<IEventEmitter>();

  /**
   * 初始化列表按钮组
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-02-05
   * @protected
   * @param {STColumn[]} columns st 列定义
   * @param {IYzbButton[]} buttons 按钮组定义
   */
  protected initGridButton(columns: STColumn[], buttons: IYzbButton[]) {
    let gridButtons: STColumnButton[] = [];
    buttons.forEach((button, idx, arr) => {
      const stButton: STColumnButton = {
        text: button.title,
        className: button.class,
        click: (record: STData) => {
          // 设置选中数据
          const index = this.grid.list.indexOf(record);
          !this.multiSelected &&
            this.setSelectRow({
              index: index,
              data: record
            });
          // 设置选中样式
          // this.setSelectRowClassName(index, !this.multiSelected);
          // 向父级触发点击事件
          this.onButtonClick({
            source: button,
            $event: record as Event,
            data: button.code,
            // 当前按钮只会向上返回当前按钮所代表的的选中行数据
            extend: {
              index: index,
              data: record
            }
          });
        },
        acl: {
          ability: [button.code]
        },
        iif: (item, btn, column) => {
          return 'function' == typeof button.iif ? button.iif(item) : true;
        },
        iifBehavior: 'disabled',
        code: button.code
      };
      gridButtons.push(stButton);
    });
    // 合并按钮
    if (gridButtons.length > 3) {
      gridButtons = [
        ...gridButtons.slice(0, 2),
        {
          text: '更多',
          children: gridButtons.slice(2)
        }
      ];
    }
    // 提交触发按钮事件
    this.initGridButtonEvent.emit({
      data: gridButtons,
      source: this.grid,
      extend: {
        dict: this.dict // 传递字典
      }
    });
    if (columns[columns.length - 1] && '功能' == columns[columns.length - 1].title) {
      columns[columns.length - 1] = {
        ...columns[columns.length - 1],
        // maxMultipleButton: 3,
        buttons: gridButtons
      };
    }
    this.grid?.resetColumns({
      columns: columns
    });
    // 设置列表的contextmenu
  }

  //#endregion

  //#region 筛选区初始化

  /**
   * 查询条件区配置项
   */
  condSchema: SFSchema = {
    properties: {}
  };

  @Input() condUI: SFUISchema = {};

  /**
   * 查询条件区组件
   */
  @ViewChild('condition', { static: false }) condition!: SFComponent;
  /**
   * 查询按钮事件
   */
  @Output() readonly searchEvent = new EventEmitter<IEventEmitter>();

  condData: any = {};

  /**
   * 组件内查询方法
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-25
   * @param {Event} $event dom事件
   */
  search($event: any): void {
    // 对筛选区数据做预处理
    const condData = this.procCondition(this.condition.value as IKVPaire);
    // 提交给父组件进行加工
    this.searchEvent.emit({
      source: this.condition,
      $event: $event,
      data: condData
    });
    // 提交给父组件进行查询
    this.getDataEvent.emit({
      source: this,
      data: {
        curr: 1,
        num: this.grid.ps,
        condition: condData
      } as IGetDataParam
    });
  }

  /**
   * 重置按钮事件
   */
  @Output() readonly resetEvent = new EventEmitter<IEventEmitter>();
  /**
   * 重置方法
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-25
   * @param {Event} $event dom事件
   * @param {boolean} [emited=false] 是否向父级菜单提交事件
   * @returns void
   */
  reset($event: any): void {
    this.resetEvent.emit({
      source: $event.target,
      $event: $event
    });
    // 清空
    this.condition.reset();
  }

  @Output() readonly initConditionEvent = new EventEmitter<IEventEmitter>();

  /**
   * 初始化筛选条件区内容
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-30
   * @param {IDict} dict
   */
  initCondition(dict: IDict) {
    // 获取动态表单管理器
    const sfSchemaManager = SFSchemaManager.instance();
    // 获取动态表单内容
    const condSchema = sfSchemaManager.fromDictItemSet(dict.dict_item!, 'condition', this.curd);
    // 触发初始化时间，传递表单对象，允许分类进行修改
    this.initConditionEvent.emit({
      data: condSchema,
      source: this.condition
    });
    this.condSchema = condSchema;
  }
  //#endregion
}
