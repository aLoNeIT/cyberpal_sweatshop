import { Component, Inject, OnInit, Injector } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { CookieService } from '@delon/util';

@Component({
  selector: 'app-hospital-layout-passport',
  standalone: false,
  templateUrl: './passport.component.html'
  // styleUrls: ['./passport.component.less']
})
export class AdminLayoutPassportComponent implements OnInit {
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private cookieSrv: CookieService
  ) {}

  ngOnInit(): void {
    this.tokenService.clear();
    this.cookieSrv.removeAll();
  }
}
