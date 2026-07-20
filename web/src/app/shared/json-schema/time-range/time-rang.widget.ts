import { Component, OnInit } from '@angular/core';
import { ControlWidget, SFValue } from '@delon/form';

@Component({
  selector: 'sf-time-rang',
  standalone: false,
  templateUrl: './time-rang.widget.html',
  styles: [
    `
      [nz-button] {
        padding: 0px;
        width: 37px;
      }
    `
  ]
})
export class TimeRangWidget extends ControlWidget {
  static KEY = 'time-rang';
  start: Date | null = null;
  end: Date | null = null;
  rangvalue: any = { start: null, end: null };
  override ui!: any;
  change(value: string, type: string): void {
    if (type == 'start') {
      this.rangvalue.start = value === null ? null : +value;
    } else if (type == 'end') {
      this.rangvalue.end = value === null ? null : +value;
    }
    this.setValue(this.rangvalue);
  }

  override reset(value: SFValue) {
    this.rangvalue = { start: null, end: null };
  }

  ngOnInit() {
    this.formProperty.valueChanges.subscribe(fvc => {
      if (null != fvc.path && null != fvc.value && '' != fvc.value) {
        this.start = fvc.value.start;
        this.end = fvc.value.end;
        setTimeout(() => {
          this.rangvalue = {
            start: fvc.value.start,
            end: fvc.value.end
          };
        }, 100);
      }
    });
  }
}
