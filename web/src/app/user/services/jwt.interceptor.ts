import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserAuthService } from './user-auth.service';

/**
 * JWT HTTP 拦截器
 *
 * 自动为 /api/* 请求附加 Authorization: Bearer <token> 头。
 * 401 响应时自动清除登录态。
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: UserAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 只对 /api/ 路径附加 token
    if (!req.url.startsWith('/api/')) {
      return next.handle(req);
    }

    const token = this.authService.token;
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.forceLogout();
        }
        return throwError(() => error);
      })
    );
  }
}
