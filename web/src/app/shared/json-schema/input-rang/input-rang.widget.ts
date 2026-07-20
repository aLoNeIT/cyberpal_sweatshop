import { Component, OnInit } from '@angular/core';
import { ControlWidget, SFValue } from '@delon/form';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

// import { SFInputButtonWidgetSchema } from './schema';

@Component({
  selector: 'sf-input-rang',
  standalone: false,
  templateUrl: './input-rang.widget.html',
  styles: [
    `
      [nz-button] {
        padding: 0px;
        width: 37px;
      }
    `
  ]
})
export class InputRangWidget extends ControlWidget {
  static KEY = 'input-rang';

  rangvalue = { start: '', end: '' };
  override ui!: any;
  change(value: string, type: string): void {
    if (type == 'start') {
      this.rangvalue.start = value;
    } else if (type == 'end') {
      this.rangvalue.end = value;
    }
    this.setValue(this.rangvalue);
  }

  override reset(value: SFValue) {
    console.log(value);
    this.rangvalue = { start: '', end: '' };
    // console.log(value);
  }
}
