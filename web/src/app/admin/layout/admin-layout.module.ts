/* eslint-disable import/order */
import { NgModule } from '@angular/core';
import { LayoutDefaultModule } from '@delon/theme/layout-default';
import { SharedModule } from '@shared';

import { AdminLayoutBasicComponent } from './basic/basic.component';
import { AdminHeaderUserComponent } from './basic/widgets/user.component';

const COMPONENTS = [AdminLayoutBasicComponent];

const HEADERCOMPONENTS = [AdminHeaderUserComponent, AdminpasswordComponent];

// passport
import { AdminLayoutPassportComponent } from './passport/passport.component';
import { AdminpasswordComponent } from './basic/widgets/password.components';

const PASSPORT = [AdminLayoutPassportComponent];

@NgModule({
  imports: [SharedModule, LayoutDefaultModule],
  declarations: [...COMPONENTS, ...HEADERCOMPONENTS, ...PASSPORT],
  exports: [...COMPONENTS, ...HEADERCOMPONENTS, ...PASSPORT]
})
export class AdminLayoutModule {}
