import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiResponse, PaginatedResponse, UserInfo, UpdateProfileRequest,
  Agent, CreateAgentRequest, AgentListResponse,
  Session, SessionListResponse, SessionDetailResponse,
  BillingSummary, BillingRecord,
  Skill
} from '../models/user.model';

/**
 * 用户端 API 服务
 *
 * 封装所有用户端后端 API 调用。
 */
@Injectable({ providedIn: 'root' })
export class UserApiService {
  constructor(private http: HttpClient) {}

  // ============================================================
  // Profile
  // ============================================================

  getProfile(): Observable<UserInfo> {
    return this.http.get<ApiResponse<{ user: UserInfo }>>('/api/profile').pipe(
      map(res => res.data.user)
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<UserInfo> {
    return this.http.put<ApiResponse<{ user: UserInfo }>>('/api/profile', data).pipe(
      map(res => res.data.user)
    );
  }

  // ============================================================
  // Agents
  // ============================================================

  getAgents(page: number = 1, perPage: number = 20): Observable<AgentListResponse> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);
    return this.http.get<ApiResponse<AgentListResponse>>('/api/agents', { params }).pipe(
      map(res => res.data)
    );
  }

  getAgent(id: number): Observable<Agent> {
    return this.http.get<ApiResponse<Agent>>(`/api/agents/${id}`).pipe(
      map(res => res.data)
    );
  }

  createAgent(data: CreateAgentRequest): Observable<Agent> {
    return this.http.post<ApiResponse<Agent>>('/api/agents', data).pipe(
      map(res => res.data)
    );
  }

  updateAgent(id: number, data: Partial<CreateAgentRequest>): Observable<Agent> {
    return this.http.put<ApiResponse<Agent>>(`/api/agents/${id}`, data).pipe(
      map(res => res.data)
    );
  }

  deleteAgent(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`/api/agents/${id}`).pipe(map(() => undefined));
  }

  // ============================================================
  // Sessions
  // ============================================================

  getSessions(page: number = 1, perPage: number = 20): Observable<SessionListResponse> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);
    return this.http.get<ApiResponse<SessionListResponse>>('/api/sessions', { params }).pipe(
      map(res => res.data)
    );
  }

  getSessionHistory(page: number = 1, perPage: number = 20): Observable<SessionListResponse> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);
    return this.http.get<ApiResponse<SessionListResponse>>('/api/sessions/history', { params }).pipe(
      map(res => res.data)
    );
  }

  getSessionDetail(id: number): Observable<SessionDetailResponse> {
    return this.http.get<ApiResponse<SessionDetailResponse>>(`/api/sessions/${id}/detail`).pipe(
      map(res => res.data)
    );
  }

  createSession(agentId: number, title?: string): Observable<Session> {
    return this.http.post<ApiResponse<Session>>('/api/sessions', { agent_id: agentId, title }).pipe(
      map(res => res.data)
    );
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`/api/sessions/${id}`).pipe(map(() => undefined));
  }

  archiveSession(id: number): Observable<void> {
    return this.http.post<ApiResponse<null>>(`/api/sessions/${id}/archive`, {}).pipe(map(() => undefined));
  }

  // ============================================================
  // Billing
  // ============================================================

  getBillingSummary(): Observable<BillingSummary> {
    return this.http.get<ApiResponse<BillingSummary>>('/api/billing/summary').pipe(
      map(res => res.data)
    );
  }

  getBillingRecords(page: number = 1, perPage: number = 20): Observable<PaginatedResponse<BillingRecord>> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);
    return this.http.get<ApiResponse<PaginatedResponse<BillingRecord>>>('/api/billing/records', { params }).pipe(
      map(res => res.data)
    );
  }

  // ============================================================
  // Skills
  // ============================================================

  getSkills(page: number = 1, perPage: number = 20): Observable<PaginatedResponse<Skill>> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);
    return this.http.get<ApiResponse<PaginatedResponse<Skill>>>('/api/skills', { params }).pipe(
      map(res => res.data)
    );
  }
}
