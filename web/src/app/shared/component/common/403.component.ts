import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '@shared';

@Component({
  selector: 'hospital-components-exception-404',
  imports: SHARED_IMPORTS,
  template: ` <exception [type]="404" [img]="'/assets/img/404.png'">
    <button nz-button nzType="primary" (click)="back()">返回上一步</button></exception
  >`
})
export class ComponentsException403Component {
  back() {
    history.back();
  }
}
