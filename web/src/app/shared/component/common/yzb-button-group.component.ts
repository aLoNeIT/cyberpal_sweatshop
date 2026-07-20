import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { NzButtonType } from 'ng-zorro-antd/button';
import { InputBoolean } from 'ng-zorro-antd/core/util';

import { IEventEmitter } from '../../model/public-api';
import { SHARED_IMPORTS } from '@shared';

/**
 * @description 按钮属性
 * @author 王阮强 (wangruanqiang@youzhibo.cn)
 */
export interface IYzbButton {
  /**
   * @description 按钮标题
   */
  title: string;
  /**
   * @description 按钮功能编码
   */
  code: string;
  /**
   * @description 按钮类型，主要用于按钮样式展示
   */
  type?: NzButtonType;
  /**
   * @description 按钮样式，主要用于标记按钮展示位置(顶部、列、右键菜单)
   */
  style?: number;
  /**
   * @description 按钮排序
   */
  sort?: number;
  /**
   * @description 样式属性
   */
  class?: string;
  /**
   * @description 是否可用
   */
  enable?: boolean;
  /**
   * @description 条件表达式，用于限制按钮是否显示
   */
  iif?: (data: any) => boolean;
}

@Component({
  selector: 'yzb-button-group',
  imports: SHARED_IMPORTS,
  templateUrl: './yzb-button-group.component.html'
})
export class YzbButtonGroupComponent {
  /**
   * @description 按钮集合
   */
  @Input() buttons: IYzbButton[] = [];
  /**
   * @description 加载状态
   */
  @Input() @InputBoolean() loading: boolean = false;
  /**
   * @description 开启权限
   */
  @Input() @InputBoolean() enableAcl: boolean = true;

  /**
   * 按钮点击事件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2020-12-31
   */
  @Output() readonly buttonClickEvent = new EventEmitter<IEventEmitter>();
  /**
   * @description 按钮点击后执行函数
   * @author 王阮强 (wangruanqiang@youzhibo.cn)
   * @param code 功能编码
   */
  execute($event: IEventEmitter | any, code: string): void {
    // 将本次事件提交到父组件
    this.buttonClickEvent.emit({
      source: this,
      $event: $event,
      data: code
    });
  }
}
