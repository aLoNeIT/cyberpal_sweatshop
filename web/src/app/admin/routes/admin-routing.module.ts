import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutBasicComponent } from 'src/app/admin/layout/basic/basic.component';
import { AdminLayoutPassportComponent } from '../layout/passport/passport.component';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { AdminPassportLoginComponent } from './passport/login/login.component';
import { AdminUserComponent } from './user/user.component';
import { AdminRoleComponent } from './role/role.component';
import { AdminSkillComponent } from './skill/skill.component';
import { AdminMcpTemplateComponent } from './skill/skill.component';
import { AdminAccountComponent } from './admin-account/admin-account.component';
import { AdminAgentComponent } from './agent/agent.component';
import { AdminSessionComponent } from './agent/agent.component';
import { AdminBillingComponent } from './billing/billing.component';
import { AdminConfigComponent } from './billing/billing.component';
import { AdminAuditLogComponent } from './billing/billing.component';

const routes: Routes = [
  {
    path: 'passport',
    component: AdminLayoutPassportComponent,
    children: [{ path: 'login', component: AdminPassportLoginComponent, data: { title: '登录' } }]
  },
  {
    path: '',
    component: AdminLayoutBasicComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent, data: { title: '首页' } },
      { path: 'user', component: AdminUserComponent, data: { title: '用户管理' } },
      { path: 'role', component: AdminRoleComponent, data: { title: '角色管理' } },
      { path: 'skill', component: AdminSkillComponent, data: { title: 'Skill 库' } },
      { path: 'mcp-template', component: AdminMcpTemplateComponent, data: { title: 'MCP 模板' } },
      { path: 'admin-account', component: AdminAccountComponent, data: { title: '管理员管理' } },
      { path: 'agent', component: AdminAgentComponent, data: { title: 'Agent 管理' } },
      { path: 'session', component: AdminSessionComponent, data: { title: '会话管理' } },
      { path: 'billing', component: AdminBillingComponent, data: { title: '计费大盘' } },
      { path: 'config', component: AdminConfigComponent, data: { title: '全局配置' } },
      { path: 'audit-log', component: AdminAuditLogComponent, data: { title: '审计日志' } },
      { path: '**', redirectTo: '/admin/passport/login', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
