import { NgModule } from '@angular/core';
import { STWidgetRegistry } from '@delon/abc/st';
import { DelonFormModule } from '@delon/form';

import { STdescribeWidget } from './describe/describe.widget';
import { STImgWidget } from './img/img.widget';
import { STTagsWidget } from './tags/tags.widget';
import { SharedModule } from '../shared.module';
import { STImgsWidget } from './imgs/imgs.widget';
import { STRightTipsWidget } from './right-tips/right-tips.widget';
import { STProgressWidget } from './progress/progress.widget';

export const STWIDGET_COMPONENTS = [STTagsWidget, STImgWidget, STdescribeWidget, STImgsWidget, STRightTipsWidget, STProgressWidget];

@NgModule({
  declarations: STWIDGET_COMPONENTS,
  imports: [SharedModule, DelonFormModule.forRoot()],
  exports: [...STWIDGET_COMPONENTS]
})
export class STWidgetModule {
  constructor(widgetRegistry: STWidgetRegistry) {
    widgetRegistry.register(STTagsWidget.KEY, STTagsWidget);
    widgetRegistry.register(STImgWidget.KEY, STImgWidget);
    widgetRegistry.register(STImgsWidget.KEY, STImgsWidget);
    widgetRegistry.register(STdescribeWidget.KEY, STdescribeWidget);
    widgetRegistry.register(STRightTipsWidget.KEY, STRightTipsWidget);
    widgetRegistry.register(STProgressWidget.KEY, STProgressWidget);
  }
}
