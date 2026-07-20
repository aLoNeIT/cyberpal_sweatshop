import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseComponent } from '../../component/app/base.component';

import { ComponentsPlatVideoComponent } from '../../component/common/play-video.component';

@Component({
  selector: 'st-widget-imgs',
  standalone: false,
  template: `
    <nz-image-group>
      @for (img of threeimgs; track img; let i = $index) {
        <div style="position: relative;display: inline-block;" class="mr-sm">
          @if (img.type === '1') {
            <img nz-tooltip nzTooltipTitle="点击预览" class="patient-img" width="60px" height="60px" nz-image [nzSrc]="img.path" alt="" />
          }
          @if (img.type === '2') {
            <img
              nz-tooltip
              nzTooltipTitle="点击预览"
              class="patient-img"
              width="60px"
              height="60px"
              src="/assets/img/视频.png"
              alt=""
              (click)="playVideo(img)"
            />
          }
          @if (img.type === '3') {
            <img
              nz-tooltip
              nzTooltipTitle="点击下载"
              class="patient-img"
              width="60px"
              height="60px"
              src="/assets/img/文件.png"
              alt=""
              (click)="download(img)"
            />
          }
          <!-- 超出3个img显示查看全部，给最后一个图片加上蒙层-->
          @if (imgs.length > 3 && i === 2) {
            <span class="point" [ngClass]="{ 'patient-img-lastimg': imgs.length > 3 && i === 2 }" (click)="show()">查看全部</span>
          }
        </div>
      }
    </nz-image-group>
  `,
  styles: [
    `
      .patient-img {
        max-width: 60px;
        max-height: 60px;
        object-fit: cover;
      }
      .patient-img-lastimg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        line-height: 58px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class STImgsWidget extends BaseComponent {
  static readonly KEY = 'imgs';

  imgs!: any[];
  get threeimgs() {
    if (this.imgs?.length > 3) {
      let item = this.imgs.slice(0, 3);
      return item;
    } else {
      return this.imgs;
    }
  }
  show() {}
  playVideo(mp4: any) {
    this.modal.createStatic(ComponentsPlatVideoComponent, { mp4: mp4.path }, { size: 400 }).subscribe(res => {});
  }
  download(item: any) {
    window.open(item.path);
  }
  // constructor(private msg: NzMessageService) { }
}
