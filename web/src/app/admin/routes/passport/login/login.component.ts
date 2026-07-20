import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrivilegeService, UserLogic } from '@core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-passport-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class AdminPassportLoginComponent implements OnInit, OnDestroy {
  loading = false;
  src = '';
  private captchaUrl = '';
  private captchaSub?: Subscription;
  constructor(
    protected privilegeSrv: PrivilegeService,
    protected injector: Injector,
    public http: _HttpClient,
    private router: Router,
    fb: FormBuilder
  ) {
    this.form = fb.group({
      account: [null, [Validators.required]],
      password: [null, [Validators.required]],
      code: [null, [Validators.required]]
    });
  }

  get account(): AbstractControl {
    return this.form.controls['account'];
  }
  get password(): AbstractControl {
    return this.form.controls['password'];
  }
  get code(): AbstractControl {
    return this.form.controls['code'];
  }
  form: FormGroup;
  error = '';
  environment: any = {};
  ngOnInit(): void {
    this.getcode();
    this.environment = environment;
  }

  ngOnDestroy(): void {
    this.captchaSub?.unsubscribe();
    this.revokeCaptchaUrl();
  }

  submit() {
    this.error = '';
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }
    if (this.form.invalid) {
      return;
    }
    this.loading = true;

    UserLogic.getInstance(this.injector)
      .login(this.account.value, this.password.value, 1, this.code.value)
      .subscribe(() => {
        this.loading = false;
        this.getcode();
      });
    // this.router.navigateByUrl('hospital');
  }

  getcode(): void {
    this.captchaSub?.unsubscribe();
    this.captchaSub = UserLogic.getInstance(this.injector)
      .getCaptchaUrl(1)
      .subscribe(url => this.setCaptchaUrl(url));
  }

  private setCaptchaUrl(url: string): void {
    this.revokeCaptchaUrl();
    this.src = url;
    this.captchaUrl = url;
  }

  private revokeCaptchaUrl(): void {
    if (!this.captchaUrl) return;
    window.URL.revokeObjectURL(this.captchaUrl);
    this.captchaUrl = '';
  }
}
