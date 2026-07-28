import { CommonModule } from '@angular/common';
import { Injector, NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { PrivilegeService, ApplicationLogic } from '@core';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { AdminPassportLoginComponent } from './passport/login/login.component';
import { AdminUserComponent } from './user/user.component';
import { AdminRoleComponent } from './role/role.component';
import { AdminSkillComponent, AdminMcpTemplateComponent } from './skill/skill.component';
import { AdminAccountComponent } from './admin-account/admin-account.component';
import { AdminAgentComponent, AdminSessionComponent } from './agent/agent.component';
import { AdminBillingComponent, AdminConfigComponent, AdminAuditLogComponent } from './billing/billing.component';
import { AdminRoutingModule } from './admin-routing.module';

const COMPONENTS: any = [
  AdminDashboardComponent, AdminPassportLoginComponent,
  AdminUserComponent, AdminRoleComponent,
  AdminSkillComponent, AdminMcpTemplateComponent,
  AdminAccountComponent,
  AdminAgentComponent, AdminSessionComponent,
  AdminBillingComponent, AdminConfigComponent, AdminAuditLogComponent
];

@NgModule({
  imports: [CommonModule, SharedModule, AdminRoutingModule],
  declarations: [...COMPONENTS],
  providers: []
})
export class AdminRoutesModule {
  constructor(private privilegeSrv: PrivilegeService, private injector: Injector) {
    ApplicationLogic.getInstance(this.injector).init(1);
  }
}
