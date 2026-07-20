import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  Injector,
  Input,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ModalHelper } from '@delon/theme';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { InputBoolean } from 'ng-zorro-antd/core/util';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';

import {
  IEventEmitter,
  IKVPaire,
  IYzbDialogButton,
  IYzbDialogComponent,
  IYzbDialogComponentOption,
  IYzbDialogOption
} from '../../model/public-api';
import { SHARED_IMPORTS } from '@shared';

/**
 * 弹窗组件
 *
 * @description 根据ng-alain组件格式要求，内部有标题和按钮区域，可以通过传递配置项来显示不同内容
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-05
 * @export
 * @class YzbDialogComponent
 * @implements {OnInit}
 * @implements {AfterViewInit}
 */
@Component({
  selector: 'yzb-dialog',
  imports: SHARED_IMPORTS,
  templateUrl: './yzb-dialog.component.html',
  styles: [
    `
      .modal-header-fix {
        margin-bottom: 4px;
      }
    `
  ]
})
export class YzbDialogComponent implements OnInit, AfterViewInit {
  /**
   * 加载状态
   */
  @Input() @InputBoolean() loading = false;
  /**
   * 加载提示内容
   */
  @Input() loadingTip = '加载中...';

  // 是否允许显示关闭按钮
  enableClose = true;
  // 点击按钮后是否自动关闭
  autoClose = true;
  // 对话框配置项
  options!: IYzbDialogOption;
  // 对话框内部组件类类型
  componentType!: Type<NzSafeAny>;
  // 对话框组件配置项
  params!: IKVPaire;
  // 模板组件对象
  @ViewChild('tpl', { read: ViewContainerRef }) tpl!: ViewContainerRef;

  constructor(
    private modalRef: NzModalRef,
    private cdr: ChangeDetectorRef,
    private injector: Injector
  ) {}

  ngOnInit() {
    const options: IYzbDialogOption = {
      title: '对话框',
      buttons: [
        {
          title: '确定',
          click: (component: IYzbDialogComponent, modalRef, $event) => {
            component.submit().subscribe(data => {
              modalRef.close(data);
            });
          }
        },
        {
          title: '关闭',
          click: (component: IYzbDialogComponent, modalRef, $event) => {
            // component.close().subscribe((data) => {
            modalRef.close();
            // });
          }
        }
      ]
    };
    this.options = null === this.options ? options : this.options;
    // this.options.title = null === this.options.title ? options.title : this.options.title;
    // this.options.buttons = null === this.options.buttons ? options.buttons : this.options.buttons;
  }
  /**
   * 按钮点击事件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-05
   * @param {Event} $event 按钮事件
   * @param {IYzbDialogButton} button 当前按钮对象
   */
  buttonClick($event: IEventEmitter, button: IYzbDialogButton): void {
    try {
      button.click(this.componentInstance, this.modalRef, $event);
    } finally {
      if (this.autoClose) {
        this.modalRef.close(this.componentInstance.close());
      }
    }
  }
  // 组件引用
  componentRef!: ComponentRef<NzSafeAny>;
  // 组件实例化对象
  componentInstance!: IYzbDialogComponent;
  // 组件再AfterViewInit后才可以被访问，所以需要在此生命周期执行
  ngAfterViewInit() {
    this.tpl.clear();
    // const factory = this.resolver.resolveComponentFactory(this.componentType);
    this.componentRef = this.tpl.createComponent<any>(this.componentType, {
      injector: this.injector
    });
    // 将得到的组件对象推断类型为IYzbDialogComponent，方便后续执行接口方法
    this.componentInstance = this.componentRef.instance as any as IYzbDialogComponent;
    // 初始化内部组件
    this.componentInstance.initDialog(this.params);
    this.cdr.detectChanges();
  }
  /**
   * 以对话框方式打开组件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-02-23
   * @static
   * @param {Injector} injector 注入器
   * @param {Type<any>} componentType 需要以对话框打开的组件类型
   * @param {IYzbDialogOption} [options] 对话框基础选项参数，标题和按钮
   * @param {IKVPaire} [params] 需要以对话框打开的组件所需要的参数
   * @param {IYzbDialogComponentOption} [componentOption] 对话框组件成员选项，如autoClose、enableClose
   * @param {('sm' | 'md' | 'lg' | 'xl' | '' | number)} [size] 对话框大小
   * @returns {*}  {Observable<any>} 返回观察者对象，使用订阅获取数据
   */
  static open(
    injector: Injector,
    componentType: Type<any>,
    options?: IYzbDialogOption,
    params?: IKVPaire,
    componentOption?: IYzbDialogComponentOption,
    size?: 'sm' | 'md' | 'lg' | 'xl' | '' | number
  ): Observable<any> {
    const modal = injector.get(ModalHelper);
    return modal.createStatic(
      YzbDialogComponent,
      {
        ...componentOption,
        componentType,
        options,
        params
      },
      {
        size: size || 'lg',
        modalOptions: componentOption?.modalOptions
      }
    );
  }
}
