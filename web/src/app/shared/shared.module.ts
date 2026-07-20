import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DelonACLModule } from '@delon/acl';
import { DelonFormModule } from '@delon/form';
import { AlainThemeModule } from '@delon/theme';
import { ClipboardModule } from 'ngx-clipboard';
// import { YzbFormComponent } from './component/base/curd/yzb-form.component';
// import { BaseIndexComponent } from './component/app/curd/base-index.component';
// import { BaseReadComponent } from './component/app/curd/base-read.component';
// import { BaseSaveComponent } from './component/app/curd/base-save.component';
// import { BaseUpdateComponent } from './component/app/curd/base-update.component';
// import { MiniCheckinComponent } from './component/app/mini-checkin/mini-checkin.component';
// import { YzbIndexComponent } from './component/base/curd/yzb-index.component';
// import { ComponentsException403Component } from './component/common/403.component';
// import { YzbButtonGroupComponent } from './component/common/yzb-button-group.component';
// import { YzbCCCComponent } from './component/common/yzb-ccc.component';
// import { YzbDialogComponent } from './component/common/yzb-dialog.component';
// import { YzbListMultiComponent } from './component/common/yzb-list-multi.component';
// import { YzbListSimpleComponent } from './component/common/yzb-list-simple.component';
// import { YzbListComponent } from './component/common/yzb-list.component';
// import { YzbMasterDetailComponent } from './component/common/yzb-master-detail.component';
import { XFormRenderModule } from './lib/x-form';
import { multiStrStatePipe } from './pipe/multi-str-state.pipe';
import { StrSplitPipe } from './pipe/str-split.pipe';
import { StrStatePipe } from './pipe/str-state.pipe';
import { SHARED_DELON_MODULES } from './shared-delon.module';
import { SHARED_ZORRO_MODULES } from './shared-zorro.module';
import { SharedEmptyPageComponent } from './component/common/empty-page.component';
// import { ComponentsPlatVideoComponent } from './component/common/play-video.component';
// import { MiniCheckinComponent } from './component/app/mini-checkin/mini-checkin.component';
// import { ComponentsWxworkComponent } from './component/common/yzb-wxwork-edit.component';
// import { ComponentsExamineComponent } from './component/common/yzb-examine.component';

// #region third libs

const THIRDMODULES: any[] = [XFormRenderModule];

// #endregion

// #region your componets & directives

const COMPONENTS: any[] = [
  SharedEmptyPageComponent
  // YzbFormComponent,
  // YzbIndexComponent,
  // YzbButtonGroupComponent,
  // YzbDialogComponent,
  // YzbListComponent,
  // YzbListMultiComponent,
  // YzbListSimpleComponent,
  // YzbMasterDetailComponent,
  // BaseIndexComponent,
  // BaseSaveComponent,
  // BaseUpdateComponent,
  // BaseReadComponent,
  // YzbCCCComponent,
  // ComponentsException403Component,
  // ComponentsPlatVideoComponent,
  // MiniCheckinComponent,
  // ComponentsWxworkComponent,
  // ComponentsExamineComponent
];
const DIRECTIVES = [StrSplitPipe, StrStatePipe, multiStrStatePipe];

// #endregion

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    AlainThemeModule.forChild(),
    DelonACLModule,
    DelonFormModule,
    ClipboardModule,
    ...SHARED_DELON_MODULES,
    ...SHARED_ZORRO_MODULES,
    // third libs
    ...THIRDMODULES
  ],
  declarations: [
    // your components
    ...COMPONENTS,
    ...DIRECTIVES
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AlainThemeModule,
    DelonACLModule,
    DelonFormModule,
    ...SHARED_DELON_MODULES,
    ...SHARED_ZORRO_MODULES,
    // third libs
    ...THIRDMODULES,
    // your components
    ...COMPONENTS,
    ...DIRECTIVES
  ]
})
export class SharedModule {}
