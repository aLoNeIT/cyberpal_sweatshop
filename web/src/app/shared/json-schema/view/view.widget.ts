import { Component, OnInit } from '@angular/core';
import { ControlWidget, SFValue } from '@delon/form';

import { SFViewWidgetSchema } from './schema';

/**
 * 只读小部件
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-20
 * @export
 * @class ViewWidget
 * @extends {ControlWidget}
 * @implements {OnInit}
 */
@Component({
  selector: 'sf-view',
  standalone: false,
  templateUrl: './view.widget.html'
})
export class ViewWidget extends ControlWidget {
  /**
   * 小部件注册key
   */
  static readonly KEY = 'view';
  override ui!: SFViewWidgetSchema;

  displayText: string = '';

  override reset(value: SFValue) {
    // 这里要求动态表单不支持index为数组模式
    const arr = this.formProperty.path.split('/');
    const key = arr[arr.length - 1],
      data = this.formProperty.parent!.formData;
    this.displayText =
      typeof value == 'undefined' || null === value
        ? '-'
        : this.ui.formatText
          ? this.ui.formatText(value, this.formProperty, key, data, this)
          : value;
  }
}
