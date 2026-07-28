import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared';
import { UserRoutesModule } from './routes/user-routes.module';

@NgModule({
  imports: [CommonModule, SharedModule, UserRoutesModule],
  exports: [UserRoutesModule]
})
export class UserModule {}
