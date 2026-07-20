import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'st-widget-img',
  standalone: false,
  template: ` <img nz-tooltip nzTooltipTitle="点击预览" nz-image [nzSrc]="img" (click)="show()" class="img" style="cursor: pointer" /> `,
  host: {
    '(click)': 'show()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class STImgWidget {
  static readonly KEY = 'img';

  img!: string;

  constructor(private msg: NzMessageService) {}

  show(): void {
    // this.msg.info(`正在打开大图${this.img}……`);
  }
}
