import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgZorroAntdModule } from '../ng-zorro/ng-zorro-antd.module';
import { XFormService } from '../x-form.service';
import { XFormRenderComponent } from './x-form-render.component';

@NgModule({
  providers: [XFormService],
  declarations: [XFormRenderComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgZorroAntdModule],
  exports: [XFormRenderComponent, FormsModule, ReactiveFormsModule, NgZorroAntdModule]
})
export class XFormRenderModule {}
