import { CommonModule } from '@angular/common';
import { Injector, NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { PrivilegeService, ApplicationLogic } from '@core';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { AdminPassportLoginComponent } from './passport/login/login.component';

// 通用组件
const COMPONENTS: any = [AdminDashboardComponent, AdminPassportLoginComponent];

const COMPONENTS_NOROUNT: any = [];

@NgModule({
  imports: [CommonModule, SharedModule, AdminRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  providers: []
  // entryComponents: COMPONENTS_NOROUNT
})
export class AdminRoutesModule {
  constructor(
    private privilegeSrv: PrivilegeService,
    private injector: Injector
  ) {
    // 应用初始化
    ApplicationLogic.getInstance(this.injector).init(1);
  }
}
