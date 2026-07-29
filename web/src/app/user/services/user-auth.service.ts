import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  LoginRequest, RegisterRequest, AuthResponse, UserInfo
} from '../models/user.model';

const TOKEN_KEY = 'cp_user_token';
const USER_KEY = 'cp_user_info';

/**
 * 用户端认证服务
 *
 * 使用原生 fetch() 避免 @delon/auth 的 authSimpleInterceptor 干扰。
 * 管理 JWT token 的存储、读取和清除，以及登录/注册/登出逻辑。
 */
@Injectable({ providedIn: 'root' })
export class UserAuthService {
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.loadUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private async api<T>(url: string, body?: any): Promise<T> {
    const opts: RequestInit = {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const json = await res.json();
    if (json.code !== 0) throw new Error(json.message || '请求失败');
    return json.data as T;
  }

  /** 获取当前存储的 token */
  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** 是否已登录 */
  get isLoggedIn(): boolean {
    return !!this.token;
  }

  /** 当前用户信息 */
  get currentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  /** 注册 */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return from(this.api<AuthResponse>('/api/auth/register', data)).pipe(
      tap(res => this.setSession(res))
    );
  }

  /** 登录 */
  login(data: LoginRequest): Observable<AuthResponse> {
    return from(this.api<AuthResponse>('/api/auth/login', data)).pipe(
      tap(res => this.setSession(res))
    );
  }

  /** 登出 */
  logout(): Observable<void> {
    return from(this.api<null>('/api/auth/logout', {})).pipe(
      map(() => this.clearSession())
    );
  }

  /** 强制清除会话 */
  forceLogout(): void {
    this.clearSession();
  }

  /** 刷新用户信息 */
  fetchCurrentUser(): Observable<UserInfo> {
    const token = this.token;
    return from(
      (async () => {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message);
        return json.data.user as UserInfo;
      })()
    ).pipe(
      tap(user => {
        this.saveUser(user);
        this.currentUserSubject.next(user);
      })
    );
  }

  private setSession(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.token);
    this.saveUser(auth.user);
    this.currentUserSubject.next(auth.user);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  private saveUser(user: UserInfo): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private loadUser(): UserInfo | null {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || ''); } catch { return null; }
  }
}
