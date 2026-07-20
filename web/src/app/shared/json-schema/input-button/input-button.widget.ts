import { Component, OnInit } from '@angular/core';
import { ControlWidget, SFValue } from '@delon/form';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

import { SFInputButtonWidgetSchema } from './schema';
import { IEventEmitter } from '../../model/public-api';

@Component({
  selector: 'sf-input-button',
  standalone: false,
  templateUrl: './input-button.widget.html',
  styles: [
    `
      [nz-button] {
        padding: 0px;
        width: 37px;
      }
    `
  ]
})
export class InputButtonWidget extends ControlWidget implements OnInit {
  static KEY = 'input-button';

  displayText: string = '';

  override ui!: SFInputButtonWidgetSchema;

  change(value: string): void {
    this.setValue(value);
  }

  override reset(value: SFValue) {
    // console.log(value);
  }

  keydown = false;

  onKeyDown($event: NzSafeAny) {
    this.keydown = true;
  }

  onKeyUp($event: NzSafeAny) {
    this.keydown = false;
  }

  onDblClick($event: NzSafeAny) {
    this.setValue('');
  }

  ngOnInit() {
    this.formProperty.valueChanges.subscribe(fvc => {
      if (this.ui.formatText && 'function' == typeof this.ui.formatText && null != fvc.path && null != fvc.value && '' != fvc.value) {
        // 这里要求动态表单不支持index为数组模式
        const arr = fvc.path.split('/'),
          key = arr[arr.length - 1],
          data = this.formProperty.parent!.formData;
        this.displayText = this.ui.formatText(fvc.value, this.formProperty, key, data, this);
      } else {
        this.displayText = fvc.value || '';
      }
    });
  }
  /**
   * 按钮点击事件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-21
   * @param {Event} $event
   */
  click($event: IEventEmitter) {
    if (this.ui.click && 'function' == typeof this.ui.click) {
      // 这里要求动态表单不支持index为数组模式
      const arr = this.formProperty.path.split('/');
      const key = arr[arr.length - 1],
        data = this.formProperty.parent!.formData;
      this.ui.click($event, this.formProperty, key, data);
    }
  }
}
