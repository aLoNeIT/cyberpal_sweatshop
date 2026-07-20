import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseComponent } from '../../component/app/base.component';

@Component({
  selector: 'st-widget-right-tips',
  standalone: false,
  template: `
    <span class="mr-xs">{{ text }}</span>
    @if (textTooltip) {
      <span nz-icon nzType="question-circle" nz-tooltip [nzTooltipTitle]="textTooltip"> </span>
    }
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class STRightTipsWidget extends BaseComponent {
  static readonly KEY = 'right-tips';
  text: string = '';
  textTooltip: string = '';
}
