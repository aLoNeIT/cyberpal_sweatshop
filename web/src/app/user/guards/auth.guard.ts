import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UserAuthService } from '../services/user-auth.service';

/**
 * 认证守卫
 *
 * 未登录用户访问受保护页面时重定向到登录页。
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: UserAuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isLoggedIn) {
      return true;
    }
    return this.router.createUrlTree(['/user/login'], {
      queryParams: { redirect: this.router.url }
    });
  }
}

/**
 * 未登录守卫
 *
 * 已登录用户访问登录/注册页时重定向到仪表盘。
 */
@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  constructor(private authService: UserAuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.isLoggedIn) {
      return true;
    }
    return this.router.createUrlTree(['/user/dashboard']);
  }
}
