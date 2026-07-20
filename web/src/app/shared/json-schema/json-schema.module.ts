import { NgModule } from '@angular/core';
import { DelonFormModule, provideSFConfig, WidgetRegistry } from '@delon/form';
import { TinymceComponent, provideTinymce } from 'ngx-tinymce';

import { InputButtonWidget } from './input-button/input-button.widget';
import { ViewWidget } from './view/view.widget';
import { SharedModule } from '../shared.module';
import { InputRangWidget } from './input-rang/input-rang.widget';
import { TimeRangWidget } from './time-range/time-rang.widget';
import { TinymceWidget } from './tinymce/tinymce.widget';
import { AutoCompleteWidgetModule } from '@delon/form/widgets/autocomplete';
import { CascaderWidgetModule } from '@delon/form/widgets/cascader';
import { MentionWidgetModule } from '@delon/form/widgets/mention';
import { RateWidgetModule } from '@delon/form/widgets/rate';
import { SliderWidgetModule } from '@delon/form/widgets/slider';
import { TagWidgetModule } from '@delon/form/widgets/tag';
import { TimeWidgetModule } from '@delon/form/widgets/time';
import { TransferWidgetModule } from '@delon/form/widgets/transfer';
import { TreeSelectWidgetModule } from '@delon/form/widgets/tree-select';
import { UploadWidgetModule } from '@delon/form/widgets/upload';
import { inputSelectWidget } from './input-select/index.component';

export const SCHEMA_THIRDS_COMPONENTS = [ViewWidget, InputButtonWidget, InputRangWidget, TimeRangWidget];

@NgModule({
  declarations: SCHEMA_THIRDS_COMPONENTS,
  providers: [
    provideSFConfig({
      widgets: [inputSelectWidget()]
    }),
    provideTinymce({
      baseURL: './assets/tinymce/',
      config: {}
    })
  ],
  imports: [
    SharedModule,
    DelonFormModule.forRoot(),
    TinymceComponent,
    TinymceWidget,
    AutoCompleteWidgetModule,
    CascaderWidgetModule,
    MentionWidgetModule,
    RateWidgetModule,
    SliderWidgetModule,
    TagWidgetModule,
    TimeWidgetModule,
    TransferWidgetModule,
    TreeSelectWidgetModule,
    UploadWidgetModule
  ],
  exports: SCHEMA_THIRDS_COMPONENTS
})
export class JsonSchemaModule {
  constructor(widgetRegistry: WidgetRegistry) {
    // widgetRegistry.register(TestWidget.KEY, TestWidget);
    widgetRegistry.register(ViewWidget.KEY, ViewWidget);
    widgetRegistry.register(InputButtonWidget.KEY, InputButtonWidget);
    widgetRegistry.register(InputRangWidget.KEY, InputRangWidget);
    widgetRegistry.register(TimeRangWidget.KEY, TimeRangWidget);
    widgetRegistry.register(TinymceWidget.KEY, TinymceWidget);
  }
}
