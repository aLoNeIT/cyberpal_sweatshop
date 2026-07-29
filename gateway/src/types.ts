/**
 * pi-gateway TypeScript 类型定义
 *
 * 所有模块的基础依赖，第一个实现的文件。
 * 纯类型声明，不引入任何外部 import。
 *
 * @module types
 */

// ============================================================================
// 2.1 消息类型枚举
// ============================================================================

/** WS 消息方向：请求 / 响应 / 事件 */
export type MessageType = "request" | "response" | "event";

/** Hyperf → Gateway 的 action 类型 */
export type ClientAction = "submit" | "reconnect" | "ping";

/** Gateway → Hyperf 的 event 类型 */
export type GatewayEvent =
  | "chunk"           // agent 产出文本片段
  | "tool_start"      // 工具调用开始
  | "tool_result"     // 工具调用结束
  | "done"            // 任务完成
  | "pong"            // 心跳响应
  | "replay_start"    // 补传开始
  | "replay_done"     // 补传完成
  | "replay_aborted"  // 补传中断
  | "reconnected"     // 重连成功（无积压）
  | "error";          // 错误信息

/** agent NDJSON 事件类型（pi-agent stdout 产出） */
export type AgentEvent =
  | "generation"      // 文本生成片段
  | "tool:start"      // 工具调用开始
  | "tool:result"     // 工具调用结果
  | "session"         // 会话状态（含 usage）
  | "done"            // 任务完成
  | "error";          // agent 错误

// ============================================================================
// 2.2 WS 消息结构
// ============================================================================

/** WS 消息基础结构（Gateway ↔ Hyperf 通信） */
export interface WSMessage {
  type: MessageType;
  service_id: string;
  session_id: string;
  seq: number;
  action?: ClientAction;
  event?: GatewayEvent;
  payload: WSPayload;
}

/** WS payload 联合类型 */
export type WSPayload =
  | SubmitPayload
  | ReconnectPayload
  | PingPayload
  | ChunkPayload
  | ToolStartPayload
  | ToolResultPayload
  | DonePayload
  | PongPayload
  | ReplayStartPayload
  | ReplayDonePayload
  | ReplayAbortedPayload
  | ReconnectedPayload
  | ErrorPayload;

/** submit 请求 payload */
export interface SubmitPayload {
  prompt: string;
  system_prompt?: string;
  append_system_prompt?: string;
  model?: string;
  thinking?: "low" | "medium" | "high";
  provider?: string;
  skills?: string[];
  mcp_config?: Record<string, unknown>;
  tools_whitelist?: string[];
  tools_blacklist?: string[];
}

/** reconnect 请求 payload */
export interface ReconnectPayload {
  // 无额外字段，service_id 在 WSMessage 顶层
}

/** ping 请求 payload */
export interface PingPayload {
  timestamp: number;
}

/** chunk 事件 payload */
export interface ChunkPayload {
  text: string;
}

/** tool_start 事件 payload */
export interface ToolStartPayload {
  tool: string;
  input: Record<string, unknown>;
}

/** tool_result 事件 payload */
export interface ToolResultPayload {
  tool: string;
  output: string;
  success: boolean;
}

/** done 事件 payload */
export interface DonePayload {
  result: string;
  usage: UsageData;
}

/** pong 事件 payload */
export interface PongPayload {
  timestamp: number;
}

/** replay_start 事件 payload */
export interface ReplayStartPayload {
  total: number;
}

/** replay_done 事件 payload */
export interface ReplayDonePayload {
  sent: number;
}

/** replay_aborted 事件 payload */
export interface ReplayAbortedPayload {
  sent: number;
  remaining: number;
}

/** reconnected 事件 payload */
export interface ReconnectedPayload {
  backlog: 0;
}

/** error 事件 payload */
export interface ErrorPayload {
  code: string;
  message: string;
  session_id?: string;
}

// ============================================================================
// 2.3 用量数据
// ============================================================================

/** token 用量数据 */
export interface UsageData {
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens?: number;
  cache_write_tokens?: number;
  estimated_cost?: number;
}

// ============================================================================
// 2.4 Agent NDJSON 消息结构
// ============================================================================

/** Gateway → Agent 的 NDJSON 请求（写入 stdin） */
export interface AgentRequest {
  type: "request";
  id: string;             // UUID，用于匹配响应
  method: "task.submit";
  params: AgentTaskParams;
}

/** Agent 任务参数 */
export interface AgentTaskParams {
  prompt: string;
  system_prompt?: string;
  append_system_prompt?: string;
  model?: string;
  thinking?: "low" | "medium" | "high";
  provider?: string;
  skills?: string[];
  mcp_config?: Record<string, unknown>;
  tools_whitelist?: string[];
  tools_blacklist?: string[];
  session_id?: string;     // 用于 resume
}

/** Agent → Gateway 的 NDJSON 消息（读取 stdout） */
export type AgentMessage =
  | AgentEventMessage
  | AgentResponseMessage
  | AgentErrorMessage;

/** Agent 事件消息 */
export interface AgentEventMessage {
  type: "event";
  event: AgentEvent;
  data: AgentEventData;
}

/** Agent 响应消息（任务完成） */
export interface AgentResponseMessage {
  type: "response";
  id: string;
  result: {
    status: "done";
    result: string;
    usage: UsageData;
  };
}

/** Agent 错误消息 */
export interface AgentErrorMessage {
  type: "error";
  id?: string;
  error: {
    code: string;
    message: string;
  };
}

/** Agent 事件数据联合类型 */
export type AgentEventData =
  | { text: string }                                    // generation
  | { tool: string; input: Record<string, unknown> }   // tool:start
  | { tool: string; output: string; success: boolean }  // tool:result
  | { usage: UsageData }                                 // session
  | Record<string, unknown>;                             // 其他

// ============================================================================
// 2.5 上下文类型
// ============================================================================

/** 服务上下文 */
export interface ServiceContext {
  service_id: string;
  offline: boolean;
  ws: WebSocket | null;
  last_ping: number;      // Unix ms，最后一次收到 ping 的时间
  sessions: Map<string, SessionContext>;
}

/** 会话上下文 */
export interface SessionContext {
  session_id: string;
  service_id: string;
  agent: AgentProcess | null;
  seqId: number;
  created_at: number;     // Unix ms
  session_status: SessionStatus;
}

/** 会话状态 */
export type SessionStatus = "running" | "completed" | "error" | "timeout";

/** Agent 进程接口（agent-process.ts 实现此接口） */
export interface AgentProcess {
  readonly pid: number | null;
  readonly alive: boolean;
  /** 发送任务请求 */
  submit(params: AgentTaskParams): Promise<void>;
  /** 注册事件回调 */
  onEvent(callback: (event: AgentMessage) => void): void;
  /** 终止进程 */
  kill(): void;
}

/** SQLite 事件记录 */
export interface SessionEventRecord {
  id: number;
  service_id: string;
  session_id: string;
  seq: number;
  payload: string;        // JSON string
  created_at: number;     // Unix ms
  consumed: number;       // 0=待补传, 1=已消费
}

// ============================================================================
// 2.6 配置类型
// ============================================================================

/** 网关配置 */
export interface GatewayConfig {
  port: number;
  sqlite_path: string;
  jwt_secret: string;
  jwt_algorithm: "HS256" | "HS384" | "HS512";
  heartbeat_interval_ms: number;
  heartbeat_timeout_ms: number;
  session_timeout_ms: number;
  agent_idle_timeout_ms: number;
  replay_batch_size: number;
  replay_sleep_ms: number;
  replay_max_total: number;
  cleanup_interval_ms: number;
  cleanup_retention_ms: number;
  pi_binary: string;
  pi_mode: string;
  pi_sandbox: string;
  pi_permission_config: string;
  log_level: "debug" | "info" | "warn" | "error";
}

// ============================================================================
// 2.7 健康状态类型
// ============================================================================

/** 单个服务健康状态 */
export interface ServiceHealthStatus {
  service_id: string;
  online: boolean;
  sessions: number;
  backlog: number;
}

/** 网关整体健康状态 */
export interface HealthStatus {
  status: "ok" | "degraded";
  uptime_ms: number;
  services: ServiceHealthStatus[];
  sqlite_path: string;
  version: string;
}
