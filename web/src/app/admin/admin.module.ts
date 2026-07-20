import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { AdminRoutesModule } from 'src/app/admin/routes/admin-routes.module';

import { AdminLayoutModule } from './layout/admin-layout.module';

// 通用组件
const COMPONENTS: any = [];

const COMPONENTS_NOROUNT: any = [];

@NgModule({
  imports: [CommonModule, SharedModule, AdminLayoutModule, AdminRoutesModule],
  exports: [AdminRoutesModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT]
  // providers: [CCCService],
  // entryComponents: COMPONENTS_NOROUNT
})
export class AdminModule {}
