import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseComponent } from '../../component/app/base.component';

@Component({
  selector: 'st-widget-progress',
  standalone: false,
  template: `
    <div style="width:350px;">
      <nz-progress nzSize="small" [nzPercent]="Percent" [nzShowInfo]="false"></nz-progress>
      <span class="ml-xs" [title]="current + '/' + maxinum + '(' + unit + ')'">{{ current }}/{{ maxinum }}</span> <span>{{ unit }}</span>
    </div>

    <!-- <nz-progress style="width: 100px;" nzSize="small" [nzPercent]="Percent" [nzShowInfo]="false"></nz-progress>
    <span>{{ current }}/{{ maxinum }}</span> <span>{{ unit }}</span> -->
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class STProgressWidget extends BaseComponent {
  static readonly KEY = 'progress';
  current: number = 0;
  maxinum: number = 0;
  unit: string = '';
  Percent: number = 0;
}
