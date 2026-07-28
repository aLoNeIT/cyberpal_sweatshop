/**
 * 用户端数据模型定义
 */

/** 用户信息 */
export interface UserInfo {
  id: number;
  email: string;
  display_name: string;
  theme_pref: 'light' | 'dark' | 'system';
  auto_archive_enabled: boolean;
  auto_archive_days: number;
  created_at: number;
  updated_at: number;
}

/** 注册请求 */
export interface RegisterRequest {
  email: string;
  password: string;
  display_name?: string;
}

/** 登录请求 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 登录/注册响应 */
export interface AuthResponse {
  token: string;
  user: UserInfo;
}

/** 更新 Profile 请求 */
export interface UpdateProfileRequest {
  display_name?: string;
  theme_pref?: 'light' | 'dark' | 'system';
  auto_archive_enabled?: boolean;
  auto_archive_days?: number;
}

/** Agent */
export interface Agent {
  id: number;
  name: string;
  description: string;
  model: string;
  provider: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  status: 'running' | 'stopped' | 'error';
  created_at: string;
  updated_at: string;
}

/** 创建 Agent 请求 */
export interface CreateAgentRequest {
  name: string;
  description?: string;
  model: string;
  provider?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
}

/** Agent 列表响应 */
export interface AgentListResponse {
  items: Agent[];
  total: number;
  page: number;
  per_page: number;
}

/** 会话 */
export interface Session {
  id: number;
  agent_id: number;
  agent_name: string;
  title: string;
  status: 'active' | 'archived' | 'completed';
  message_count: number;
  created_at: string;
  updated_at: string;
}

/** 会话列表响应 */
export interface SessionListResponse {
  items: Session[];
  total: number;
  page: number;
  per_page: number;
}

/** 消息 */
export interface Message {
  id: number;
  session_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

/** 会话详情响应 */
export interface SessionDetailResponse {
  session: Session;
  messages: Message[];
}

/** 计费摘要 */
export interface BillingSummary {
  period: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  cost_estimate_usd: number;
  by_model: { model: string; tokens: number; cost: number }[];
}

/** 计费记录 */
export interface BillingRecord {
  id: number;
  session_id: number;
  model: string;
  provider: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  cost_estimate: number;
  created_at: string;
}

/** Skill */
export interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  created_at: string;
}

/** 通用 API 响应 */
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}
