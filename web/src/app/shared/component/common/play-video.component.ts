import { Component, Input } from '@angular/core';
import { SHARED_IMPORTS } from '@shared';

@Component({
  selector: 'hospital-components-play-videp',
  imports: SHARED_IMPORTS,
  template: `
    <div class="p-md">
      <media [options]="options" #media [source]="mp4"></media>
    </div>
  `
})
export class ComponentsPlatVideoComponent {
  @Input() mp4: string = '';
  options = {
    i18n: {
      speed: '速度',
      normal: '正常'
    },
    speed: { selected: 1, options: [0.5, 1, 1.5, 2] }
  }; //播放插件的国际化设置
}
