import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '@shared';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// User 端需要的 NG-ZORRO 模块（部分未在 SharedModule 中启用）
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

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

const EXTRA_MODULES = [
  NzLayoutModule, NzMenuModule, NzAvatarModule, NzDropDownModule,
  NzCardModule, NzTableModule, NzTagModule, NzEmptyModule,
  NzSpaceModule, NzDescriptionsModule, NzStatisticModule
];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule, RouterModule, UserRoutingModule, HttpClientModule, ...EXTRA_MODULES],
  declarations: [...COMPONENTS],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ]
})
export class UserRoutesModule {}
