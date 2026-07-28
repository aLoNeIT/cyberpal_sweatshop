import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  LoginRequest, RegisterRequest, AuthResponse, UserInfo, ApiResponse
} from '../models/user.model';

const TOKEN_KEY = 'cp_user_token';
const USER_KEY = 'cp_user_info';

/**
 * 用户端认证服务
 *
 * 管理 JWT token 的存储、读取和清除，以及登录/注册/登出逻辑。
 */
@Injectable({ providedIn: 'root' })
export class UserAuthService {
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.loadUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

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
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/register', data).pipe(
      map(res => {
        if (res.code !== 0) throw new Error(res.message);
        return res.data;
      }),
      tap(res => this.setSession(res))
    );
  }

  /** 登录 */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/login', data).pipe(
      map(res => {
        if (res.code !== 0) throw new Error(res.message);
        return res.data;
      }),
      tap(res => this.setSession(res))
    );
  }

  /** 登出 */
  logout(): Observable<void> {
    return this.http.post<ApiResponse<null>>('/api/auth/logout', {}).pipe(
      map(() => {
        this.clearSession();
      })
    );
  }

  /** 强制清除会话（不调用后端） */
  forceLogout(): void {
    this.clearSession();
  }

  /** 获取当前用户信息（从后端刷新） */
  fetchCurrentUser(): Observable<UserInfo> {
    return this.http.get<ApiResponse<{ user: UserInfo }>>('/api/auth/me').pipe(
      map(res => {
        if (res.code !== 0) throw new Error(res.message);
        return res.data.user;
      }),
      tap(user => {
        this.saveUser(user);
        this.currentUserSubject.next(user);
      })
    );
  }

  /** 保存登录态 */
  private setSession(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.token);
    this.saveUser(auth.user);
    this.currentUserSubject.next(auth.user);
  }

  /** 清除登录态 */
  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  /** 持久化用户信息 */
  private saveUser(user: UserInfo): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /** 从 localStorage 恢复用户信息 */
  private loadUser(): UserInfo | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
