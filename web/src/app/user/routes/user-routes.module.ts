import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '@shared';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { UserLayoutPassportComponent } from '../layout/passport/passport.component';
import { UserLayoutBasicComponent } from '../layout/basic/basic.component';
import { UserLoginComponent } from './passport/login/login.component';
import { UserRegisterComponent } from './passport/register/register.component';
import { UserDashboardComponent } from './dashboard/dashboard.component';
import { UserAgentsComponent } from './agents/agents.component';
import { UserSessionsComponent } from './sessions/sessions.component';
import { UserChatComponent } from './chat/chat.component';
import { UserBillingComponent } from './billing/billing.component';
import { UserSettingsComponent } from './settings/settings.component';
import { UserRoutingModule } from '../user-routing.module';
import { JwtInterceptor } from '../services/jwt.interceptor';

const COMPONENTS = [
  UserLayoutPassportComponent, UserLayoutBasicComponent,
  UserLoginComponent, UserRegisterComponent,
  UserDashboardComponent, UserAgentsComponent,
  UserSessionsComponent, UserChatComponent,
  UserBillingComponent, UserSettingsComponent
];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule, UserRoutingModule, HttpClientModule],
  declarations: [...COMPONENTS],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ]
})
export class UserRoutesModule {}
