import { Component, Type, ViewChild, OnInit, TemplateRef, ViewContainerRef, ComponentRef, Input } from '@angular/core';
import { STData } from '@delon/abc/st';
import { deepCopy } from '@delon/util';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { interval, Observable, filter, Subject } from 'rxjs';
import { YzbDialogComponent } from '../../common/yzb-dialog.component';
import {
  IKVPaire,
  IYzbDialogComponent,
  IConditionSet,
  IEventEmitter,
  IJsonTable,
  IPage,
  IStringPaire,
  IYzbDialogFormComponent,
  IFunctionSet
} from '../../../model/public-api';

import { ISelectRow, YzbIndexComponent } from '../../base/curd/yzb-index.component';
import { BaseCurdComponent } from './base-curd.component';
import { SHARED_IMPORTS } from '@shared';

@Component({
  templateUrl: './base-index.component.html',
  imports: [...SHARED_IMPORTS, YzbIndexComponent]
})
export class BaseIndexComponent extends BaseCurdComponent implements OnInit {
  //#region 当前组件基础

  @ViewChild('buttonsRightSideContainer', { static: false, read: ViewContainerRef })
  buttonsRightSideContainer!: ViewContainerRef;

  //#endregion

  //#region 窗体化相关

  @ViewChild('index', { static: false }) index!: YzbIndexComponent;

  // 创建数据对话框
  protected saveComponent!: Type<void>;
  // 更新数据对话框
  protected updateComponent!: Type<void>;
  // 查看数据对话框
  protected readComponent!: Type<void>;

  protected override initialize(): void {
    super.initialize();
    this.curd = 1;
  }

  override submit(): Observable<NzSafeAny> {
    return new Observable<NzSafeAny>(observer => {
      // 只有选中有效数据才会发布消息
      if (!this.selectRow) {
        this.msgSrv.error('请选中有效数据');
        return;
      }
      observer.next(this.getSelectedData());
    });
  }
  //#endregion

  //#region 当前组件基础
  /**
   * 显示行号
   */
  rowNumbered = true;
  /**
   * 是否多选
   */
  multiSelected = false;
  /**
   * 显示第一列选择框
   */
  @Input() checkBoxed = false;
  /**
   * 功能集合
   */
  functionSet!: IFunctionSet;

  override ngOnInit() {
    super.ngOnInit();
    const queryParams = this.route.snapshot.queryParams;
    if (!this.menuCode && queryParams['menucode']) {
      this.menuCode = queryParams['menucode'];
    }
    if (!this.backButton && String(queryParams['backbutton']).toLowerCase() === 'true') {
      this.backButton = true;
    }
    if (this.menuCode) {
      // 配置了有效的菜单才会进行查询
      this.commonSrv.getButtons(this.menuCode, this.privilegeSrv.appType!).subscribe((functionSet: IFunctionSet) => {
        this.functionSet = functionSet;
      });
    }
  }

  //#endregion

  //#region 按钮处理
  /**
   * 是否显示返回按钮
   */
  backButton = false;
  /**
   * 按钮显示方式
   */
  buttonStyle = 7;

  /**
   * 当前选中行数据
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-29
   * @protected
   * @type {STData}
   */
  protected selectRow: ISelectRow | ISelectRow[] | null = null;
  // 行选中事件
  onSelectRow($event: IEventEmitter) {
    this.selectRow = $event.data;
  }
  /**
   * 页面按钮点击事件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-18
   * @param {IEventEmitter} $event 子组件传递的数据
   */
  onButtonClick($event: IEventEmitter) {
    const code = ($event.data as string).slice(-2);

    switch (code) {
      case '99': // 返回
        history.back();
        break;
      case '01': // 刷新
        this.getCurrData();
        break;
      case '02': // 新建
        this.showSave($event);
        break;
      case '03': // 更新
        this.showUpdate($event);
        break;
      case '04':
        this.showDelete($event);
        break;
      case '05': // 详情
        this.showRead($event);
        break;
    }
  }
  onSearch($event: IEventEmitter) {
    // this.msgSrv.warning(JSON.stringify($event.data));
  }
  onConditionSchema($event: IEventEmitter) {
    this.onInitForm($event);
  }
  /**
   * 表格初始化事件
   *
   * @author 王阮强(wangruanqiang@hongshanhis.com)
   * @date 2021-12-29
   * @param {IEventEmitter} $event
   */
  onInitGrid($event: IEventEmitter) {}
  /**
   * 按钮初始化事件
   *
   * @author 王阮强(wangruanqiang@hongshanhis.com)
   * @date 2021-12-29
   * @param {IEventEmitter} $event
   */
  onInitButtons($event: IEventEmitter) {}
  saveParam: any = undefined;
  protected showSave(menuCode: IEventEmitter) {
    if (!this.saveComponent) {
      this.msgSrv.error('窗体创建失败');
    } else {
      YzbDialogComponent.open(
        this.injector,
        this.saveComponent,
        {
          title: `新建[${this.title}]数据`,
          buttons: [
            {
              title: '重置',
              click: (component: IYzbDialogComponent, modalRef: NzModalRef, $event) => {
                (component as IYzbDialogFormComponent).reset().subscribe(data => {});
              }
            },
            {
              title: '取消',
              click: (component: IYzbDialogComponent, modalRef: NzModalRef, $event) => {
                (component as IYzbDialogFormComponent).close().subscribe(data => {
                  modalRef.close(data);
                });
              }
            },
            {
              title: '保存',
              type: 'primary',
              click: (component: IYzbDialogComponent, modalRef: NzModalRef, $event) => {
                (component as IYzbDialogFormComponent).submit().subscribe(data => {
                  modalRef.close(data);
                  this.getCurrData();
                });
              }
            }
          ]
        },
        this.saveParam,
        {
          autoClose: false
        }
      ).subscribe(data => {
        // console.log(data);
      });
    }
  }

  protected showUpdate($event: IEventEmitter) {
    if (!this.updateComponent) {
      this.msgSrv.error('窗体创建失败');
      return;
    }
    // 验证提交上来的数据是否数组，如果是则说明多选模式，暂不支持
    if (Array.isArray($event.extend)) {
      this.msgSrv.error('当前操作不支持多选模式');
      return;
    }
    const selectData = $event.extend?.data as STData;
    if (!selectData) {
      this.msgSrv.error('请选中有效数据');
      return;
    }
    // 传递进去的应该是主键
    const pk = this.dict.getPrimaryKey(),
      id = selectData[pk!.fieldname];
    this.modal
      .createStatic(YzbDialogComponent, {
        autoClose: false,
        componentType: this.updateComponent,
        options: {
          title: `编辑[${this.title}]数据`,
          buttons: [
            {
              title: '重置',
              click: (component: IYzbDialogComponent, modalRef: NzModalRef, $event: IEventEmitter) => {
                (component as IYzbDialogFormComponent).reset().subscribe(data => {});
              }
            },
            {
              title: '取消',
              click: (component: IYzbDialogComponent, modalRef: NzModalRef, $event: IEventEmitter) => {
                (component as IYzbDialogFormComponent).close().subscribe(data => {
                  modalRef.close(data);
                });
              }
            },
            {
              title: '保存',
              type: 'primary',
              click: (component: IYzbDialogComponent, modalRef: NzModalRef, $event: IEventEmitter) => {
                (component as IYzbDialogFormComponent).submit().subscribe(data => {
                  modalRef.close(data);
                  this.getCurrData();
                });
              }
            }
          ]
        },
        params: {
          id,
          param: this.saveParam
        }
      })
      .subscribe(data => {
        // console.log(data);
        // this.msgSrv.info(data ? JSON.stringify(data) : 'closed');
      });
  }

  protected showRead($event: IEventEmitter) {
    if (!this.readComponent) {
      this.msgSrv.error('窗体创建失败');
      return;
    }
    // 验证提交上来的数据是否数组，如果是则说明多选模式，暂不支持
    if (Array.isArray($event.extend)) {
      this.msgSrv.error('当前操作不支持多选模式');
      return;
    }
    const selectData = $event.extend?.data as STData;
    if (!selectData) {
      this.msgSrv.error('请选中有效数据');
      return;
    }
    // 传递进去的应该是主键
    const pk = this.dict.getPrimaryKey(),
      id = selectData[pk!.fieldname];
    this.modal
      .createStatic(YzbDialogComponent, {
        autoClose: false,
        componentType: this.readComponent,
        options: {
          title: `查看[${this.title}]数据`,
          buttons: [
            {
              title: '关闭',
              click: (component: IYzbDialogComponent, modalRef: NzModalRef, $event: IEventEmitter) => {
                (component as IYzbDialogFormComponent).close().subscribe(data => {
                  modalRef.close(data);
                });
              }
            }
          ]
        },
        params: {
          id,
          param: this.saveParam
        }
      })
      .subscribe(data => {
        // console.log(data);
        // this.msgSrv.info(data ? JSON.stringify(data) : 'closed');
      });
  }
  errorMessage: string = '确定删除选中数据?';
  protected showDelete($event: IEventEmitter): void {
    const modalSrv = this.injector.get(NzModalService);
    modalSrv.confirm({
      nzTitle: '数据删除',
      nzContent: this.errorMessage,
      nzOkText: '删除',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        // 验证提交上来的数据是否数组，如果是则说明多选模式，暂不支持
        if (Array.isArray($event.extend)) {
          this.msgSrv.error('当前操作不支持多选模式');
          return;
        }
        const selectData = $event.extend?.data as STData;
        if (!selectData) {
          this.msgSrv.error('请选中有效数据');
          return;
        }
        // 传递进去的应该是主键
        const pk = this.dict.getPrimaryKey(),
          id = selectData[pk!.fieldname],
          { success, error } = this.reqDelete(`${this.baseUri}/${id}`);
        success!.subscribe(() => {
          this.msgSrv.success('删除成功');
          setTimeout(() => {
            this.getCurrData();
          });
        });
        error!.subscribe(result => {
          result.msg = result.msg.replace(/</g, '&lt;').replace(/>/g, '&gt;'); //后端返回的信息里包括<>的转义处理
          this.msgSrv.error(`${result.msg}[${result.state}]`);
        });
      },
      nzCancelText: '取消'
    });
  }

  /**
   * 列表数据
   */
  gridData: any[] = [];
  /**
   * 列表页码配置
   */
  gridPage: {
    pi: number;
    ps: number;
    total: number;
  } = {
    pi: 1,
    ps: 10,
    total: 0
  };
  /**
   * 刷新所需参数，保存每次结果
   */
  protected refreshParams: { curr: number; num: number; condition: any; sort: any } = {
    curr: 1,
    num: 10,
    condition: {},
    sort: null
  };
  /**
   * 获取数据事件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-19
   * @param {IEventEmitter} $event
   */
  onGetData($event: IEventEmitter) {
    this.refreshParams = deepCopy($event.data);
    this.getIndexData($event.data.curr || 1, $event.data.num || 10, $event.data.condition || {}, $event.data.sort || null);
  }

  protected getIndexData(curr: number = 1, num: number = 10, condData: IConditionSet = {}, sortData: IStringPaire | null = null) {
    const { success } = this.getData(this.baseUri, curr, num, condData, sortData);
    success!.subscribe((res: IJsonTable) => {
      this.gridData = (res.data as any[]) || [];
      const page = res.msg as IPage;
      this.gridPage = {
        pi: page.curr,
        ps: page.num,
        total: page.count
      };
    });
  }
  /**
   * 获取数据，保持参数不变
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-02-05
   * @protected
   */
  protected getCurrData() {
    const { curr, num, condition, sort } = this.refreshParams;
    this.getIndexData(curr, num, condition, sort);
    this.selectRow = null;
  }
  /**
   * 生成按钮区右侧组件
   *
   * @param componentType 组件类型
   * @returns 返回可被订阅对象，发送的值是组件实例
   */
  protected makeButtonsRightSideComponent(componentType: Type<any>): Subject<Component> {
    const subject = new Subject<Component>(),
      subscription = interval(10)
        .pipe(
          filter((value, index) => {
            return !!this.buttonsRightSideContainer;
          })
        )
        .subscribe(value => {
          subscription.unsubscribe();
          const tpl = this.buttonsRightSideContainer;
          tpl.clear();
          const component = tpl.createComponent(componentType, {
            injector: this.injector,
            index: 0
          });
          subject.next(component.instance);
          this.cdr.detectChanges();
        });
    return subject;
  }

  //#endregion

  /**
   * 获取选中行数据
   */
  protected getSelectedData($event: IEventEmitter | null = null): STData | ISelectRow[] | null {
    // 底层传递了选中数据，则优先选择底层传递的
    if (null != $event && $event.extend) {
      return this.multiSelected ? ($event.extend as ISelectRow[]) : ($event.extend as ISelectRow).data;
    }
    // 底层未传递，则选择当前组件内记录的已选择数据
    if (null != this.selectRow) {
      return this.multiSelected ? (this.selectRow as ISelectRow[]) : (this.selectRow as ISelectRow).data;
    }
    // 其余情况返回null
    return null;
  }

  override initDialog(params: IKVPaire) {
    super.initDialog(params);
    this.buttonStyle = 0; // 对话框形式不显示任何按钮
  }
  initGridButton($event: IEventEmitter) {}
  /**
   * 重置事件
   *
   * @param event
   */
  onReset(event: any) {}
}
