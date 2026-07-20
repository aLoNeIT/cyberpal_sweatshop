import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'st-widget-patient_describe',
  standalone: false,
  template: `
    @if (describe) {
      <span nz-tooltip [nzTooltipTitle]="TooltipTitleValue" style="cursor: pointer;color:#D96A09">
        {{ name }}
      </span>
    } @else {
      <span>{{ name }}</span>
    }
  `,

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class STdescribeWidget {
  static readonly KEY = 'patient_describe';
  describe!: any;
  name!: string;
  TooltipTitleValue = '当前患者存在未开始或正在进行的随访计划';
}
