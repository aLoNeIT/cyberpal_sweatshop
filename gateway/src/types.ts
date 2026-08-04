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
export type ClientAction = "submit" | "reconnect" | "ping" | "steer" | "follow_up" | "abort";

/** Gateway → Hyperf 的 event 类型 */
export type GatewayEvent =
  | "chunk"           // agent 产出文本片段
  | "tool_start"      // 工具调用开始
  | "tool_result"     // 工具调用结束
  | "tool_progress"   // 工具调用进度
  | "thinking"        // 思考过程片段
  | "done"            // 任务完成
  | "pong"            // 心跳响应
  | "replay_start"    // 补传开始
  | "replay_done"     // 补传完成
  | "replay_aborted"  // 补传中断
  | "reconnected"     // 重连成功（无积压）
  | "steer_ack"       // steer 命令确认
  | "compaction_event" // 上下文压缩事件
  | "retry_event"     // 自动重试事件
  | "error";          // 错误信息

// ============================================================================
// pi.dev RPC 协议类型（stdin/stdout）
// ============================================================================

/** stdin 命令类型 */
export type PiCommandType = "prompt" | "steer" | "follow_up" | "abort" | "set_model" | "set_thinking_level" | "get_state";

/** 流式行为 */
export type StreamingBehavior = "steer" | "replace" | "append";

/** 思考级别 */
export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

/** prompt 命令 */
export interface PromptCmd {
  type: "prompt";
  message: string;
  images?: string[];
  streamingBehavior?: StreamingBehavior;
}

/** steer 命令 */
export interface SteerCmd {
  type: "steer";
  message: string;
}

/** follow_up 命令 */
export interface FollowUpCmd {
  type: "follow_up";
  message: string;
}

/** abort 命令 */
export interface AbortCmd {
  type: "abort";
}

/** set_model 命令 */
export interface SetModelCmd {
  type: "set_model";
  provider: string;
  modelId: string;
}

/** set_thinking_level 命令 */
export interface SetThinkingCmd {
  type: "set_thinking_level";
  level: ThinkingLevel;
}

/** get_state 命令 */
export interface GetStateCmd {
  type: "get_state";
}

/** pi RPC 命令联合类型 */
export type PiRpcCommand = PromptCmd | SteerCmd | FollowUpCmd | AbortCmd | SetModelCmd | SetThinkingCmd | GetStateCmd;

// ============================================================================
// stdout 响应
// ============================================================================

/** pi RPC 响应消息 */
export interface PiRpcResponse {
  type: "response";
  id?: string;
  command: string;
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

// ============================================================================
// stdout 事件（每类独立结构）
// ============================================================================

export interface AgentStartEvent {
  type: "agent_start";
}

export interface AgentEndEvent {
  type: "agent_end";
  messages: unknown[];
  willRetry: boolean;
}

export interface AgentSettledEvent {
  type: "agent_settled";
}

export interface TurnStartEvent {
  type: "turn_start";
}

export interface TurnEndEvent {
  type: "turn_end";
  message: unknown;
  toolResults: unknown[];
}

export interface MessageStartEvent {
  type: "message_start";
  message: unknown;
}

export interface MessageEndEvent {
  type: "message_end";
  message: unknown;
}

export interface AssistantMessageEvent {
  type: "text_start" | "text_delta" | "text_end"
    | "thinking_start" | "thinking_delta" | "thinking_end"
    | "toolcall_start" | "toolcall_delta" | "toolcall_end";
  contentIndex?: number;
  delta?: string;
  content?: string;
  toolCallId?: string;
  toolName?: string;
  args?: Record<string, unknown>;
  toolCall?: unknown;
}

export interface MessageUpdateEvent {
  type: "message_update";
  assistantMessageEvent: AssistantMessageEvent;
}

export interface ToolExecStartEvent {
  type: "tool_execution_start";
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

export interface ToolExecUpdateEvent {
  type: "tool_execution_update";
  toolCallId: string;
  toolName: string;
  args?: Record<string, unknown>;
  partialResult: unknown;
}

export interface ToolExecEndEvent {
  type: "tool_execution_end";
  toolCallId: string;
  toolName: string;
  result: unknown;
  isError: boolean;
}

export interface BashExecUpdateEvent {
  type: "bash_execution_update";
  id: string;
  delta: string;
}

export interface CompactionStartEvent {
  type: "compaction_start";
}

export interface CompactionEndEvent {
  type: "compaction_end";
}

export interface AutoRetryStartEvent {
  type: "auto_retry_start";
}

export interface AutoRetryEndEvent {
  type: "auto_retry_end";
}

export interface ExtensionErrorEvent {
  type: "extension_error";
  error: string;
}

export interface QueueUpdateEvent {
  type: "queue_update";
  queue?: unknown;
}

/** pi RPC 事件联合类型 */
export type PiRpcEvent = AgentStartEvent | AgentEndEvent | AgentSettledEvent
  | TurnStartEvent | TurnEndEvent
  | MessageStartEvent | MessageUpdateEvent | MessageEndEvent
  | ToolExecStartEvent | ToolExecUpdateEvent | ToolExecEndEvent
  | BashExecUpdateEvent | CompactionStartEvent | CompactionEndEvent
  | AutoRetryStartEvent | AutoRetryEndEvent | ExtensionErrorEvent
  | QueueUpdateEvent | Record<string, unknown>; // 兜底

/** pi RPC 消息联合类型 */
export type PiRpcMessage = PiRpcResponse | PiRpcEvent;

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
  model?: string;
  thinking?: string;
  provider?: string;
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
  toolCallId?: string;
  input: Record<string, unknown>;
}

/** tool_result 事件 payload */
export interface ToolResultPayload {
  tool: string;
  toolCallId?: string;
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
// 2.4 上下文类型
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
  /** 发送 RPC 命令 */
  submit(command: PiRpcCommand): Promise<void>;
  /** 注册事件回调 */
  onEvent(callback: (msg: PiRpcMessage) => void): void;
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
  pi_provider: string;
  pi_model: string;
  pi_session_dir: string;
  pi_no_session: boolean;
  pi_session_name: string;
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
