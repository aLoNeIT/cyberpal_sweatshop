import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLayoutPassportComponent } from './layout/passport/passport.component';
import { UserLayoutBasicComponent } from './layout/basic/basic.component';
import { UserLoginComponent } from './routes/passport/login/login.component';
import { UserRegisterComponent } from './routes/passport/register/register.component';
import { UserDashboardComponent } from './routes/dashboard/dashboard.component';
import { UserAgentsComponent } from './routes/agents/agents.component';
import { UserAgentConfigComponent } from './routes/agent-config/agent-config.component';
import { UserSessionsComponent } from './routes/sessions/sessions.component';
import { UserChatComponent } from './routes/chat/chat.component';
import { UserBillingComponent } from './routes/billing/billing.component';
import { UserSettingsComponent } from './routes/settings/settings.component';
import { UserTeamComponent } from './routes/team/team.component';
import { AuthGuard, NoAuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: UserLayoutPassportComponent,
    children: [
      { path: 'login', component: UserLoginComponent, canActivate: [NoAuthGuard], data: { title: '登录' } },
      { path: 'register', component: UserRegisterComponent, canActivate: [NoAuthGuard], data: { title: '注册' } }
    ]
  },
  {
    path: '',
    component: UserLayoutBasicComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: UserDashboardComponent, data: { title: '控制台' } },
      { path: 'agents', component: UserAgentsComponent, data: { title: 'Agent 管理' } },
      { path: 'sessions', component: UserSessionsComponent, data: { title: '会话历史' } },
      { path: 'chat', component: UserChatComponent, data: { title: '对话' } },
      { path: 'chat/:id', component: UserChatComponent, data: { title: '会话详情' } },
      { path: 'agent-config', component: UserAgentConfigComponent, data: { title: '创建 Agent' } },
      { path: 'agent-config/:id', component: UserAgentConfigComponent, data: { title: '编辑 Agent' } },
      { path: 'billing', component: UserBillingComponent, data: { title: '消费明细' } },
      { path: 'team', component: UserTeamComponent, data: { title: '团队协作' } },
      { path: 'settings', component: UserSettingsComponent, data: { title: '设置' } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
