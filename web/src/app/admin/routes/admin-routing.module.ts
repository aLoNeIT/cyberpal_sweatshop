import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutBasicComponent } from 'src/app/admin/layout/basic/basic.component';

import { AdminLayoutPassportComponent } from '../layout/passport/passport.component';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { AdminPassportLoginComponent } from './passport/login/login.component';

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
      { path: '**', redirectTo: '/admin/passport/login', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
