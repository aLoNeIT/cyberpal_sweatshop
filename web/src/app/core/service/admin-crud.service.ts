import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IJsonTable } from '@shared/model';
import { BaseService } from './base.service';

/**
 * Admin DictCrudController 通用 API 服务。
 */
@Injectable({ providedIn: 'root' })
export class AdminCrudService extends BaseService {
  private get http(): HttpClient {
    return this.injector.get(HttpClient);
  }

  constructor(injector: Injector) {
    super(injector);
  }

  // ============================================================
  // 通用 CRUD
  // ============================================================

  list(prefix: string, params?: any): Observable<IJsonTable> {
    let p = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => { if (params[k] != null) p = p.set(k, params[k]); });
    }
    return this.http.get<IJsonTable>(`admin/v1/${prefix}/index`, { params: p });
  }

  read(prefix: string, id: number | string): Observable<IJsonTable> {
    return this.http.get<IJsonTable>(`admin/v1/${prefix}/read/${id}`);
  }

  create(prefix: string, data: any): Observable<IJsonTable> {
    return this.http.post<IJsonTable>(`admin/v1/${prefix}/save`, data);
  }

  update(prefix: string, id: number | string, data: any): Observable<IJsonTable> {
    return this.http.post<IJsonTable>(`admin/v1/${prefix}/update/${id}`, data);
  }

  delete(prefix: string, id: number | string): Observable<IJsonTable> {
    return this.http.post<IJsonTable>(`admin/v1/${prefix}/delete/${id}`, {});
  }

  // ============================================================
  // 自定义 action
  // ============================================================

  toggleStatus(prefix: string, id: number, state: 0 | 1): Observable<IJsonTable> {
    return this.http.post<IJsonTable>(`admin/v1/${prefix}/toggleStatus/${id}`, { usr_state: state });
  }

  resetPassword(prefix: string, id: number, password: string): Observable<IJsonTable> {
    return this.http.post<IJsonTable>(`admin/v1/${prefix}/resetPassword/${id}`, { password });
  }
}
