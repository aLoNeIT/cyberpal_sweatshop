import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * st单元格标签组数据格式
 */
export interface ISTTags {
  title?: string;
  color?: string;
}

/**
 * st表格tags组件
 */
@Component({
  selector: 'st-widget-tags',
  standalone: false,
  template: `
    <div style="max-height:43px;overflow:hidden;">
      @for (tag of twotags; track tag) {
        <nz-tag
          [ngStyle]="{
            width: tag.title ? '' : '60px',
            height: '20px',
            borderRadius: '2px',
            overflow: 'hidden',
            'max-width.px': 80,
            'text-overflow': 'ellipsis'
          }"
          [nzColor]="tag.color || '#2db7f5'"
          style="cursor: pointer"
          [title]="tag.title"
        >
          {{ tag.title }}
        </nz-tag>
      }
      @if (tags.length > 2) {
        <span
          nz-icon
          style="color:#40a9ff;cursor: pointer;font-size:24px"
          nzType="ellipsis"
          nzSize="small"
          nz-tooltip
          nzTooltipOverlayClassName="itag"
          [nzTooltipTitle]="tagTemplate"
          nzTooltipColor="#fff"
        ></span>
      }
      <!-- <a nz-button *ngIf="tags.length > 2" nzSize="small" nz-tooltip [nzTooltipTitle]="tagTemplate" nzTooltipColor="#fff" nzType="link"
      >...</a
      > -->
    </div>

    <ng-template #tagTemplate let-thing>
      @for (tag of tags; track tag) {
        <nz-tag
          [ngStyle]="{
            width: tag.title ? '' : '60px',
            height: '20px',
            borderRadius: '2px',
            overflow: 'hidden',
            'max-width.px': 180,
            'text-overflow': 'ellipsis'
          }"
          [nzColor]="tag.color || '#2db7f5'"
          style="cursor: pointer"
          [title]="tag.title"
        >
          {{ tag.title }}
        </nz-tag>
      }
    </ng-template>
  `,
  styles: [
    `
      ::ng-deep .itag .ant-tooltip-arrow-content {
        --antd-arrow-background-color: none;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class STTagsWidget {
  more_showing: boolean = false;
  static readonly KEY = 'tags';
  tags: ISTTags[] = [];

  get twotags() {
    if (this.tags.length > 2) {
      let item = this.tags.slice(0, 2);
      return item;
    } else {
      return this.tags;
    }
  }
}
