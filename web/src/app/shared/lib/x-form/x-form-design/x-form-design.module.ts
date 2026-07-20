import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgZorroAntdModule } from '../ng-zorro/ng-zorro-antd.module';
import { XFormRenderModule } from '../x-form-render/x-form-render.module';
import { XFormService } from '../x-form.service';
import { XFormDesignComponent } from './x-form-design.component';

@NgModule({
  providers: [XFormService],
  declarations: [XFormDesignComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgZorroAntdModule, XFormRenderModule],
  exports: [XFormDesignComponent, FormsModule, ReactiveFormsModule, NgZorroAntdModule]
})
export class XFormDesignModule {}
