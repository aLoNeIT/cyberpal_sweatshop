/**
 * pi-gateway 错误码定义
 *
 * 定义所有错误码常量、严重级别映射和错误 payload 工厂函数。
 * 零外部依赖，第二个实现的文件。
 *
 * @module errors
 */

/** 错误码枚举 */
export const ErrorCode = {
  // 鉴权类 (1xxx)
  AUTH_INVALID_TOKEN: "AUTH_INVALID_TOKEN",
  AUTH_MISSING_TOKEN: "AUTH_MISSING_TOKEN",
  AUTH_SERVICE_FORBIDDEN: "AUTH_SERVICE_FORBIDDEN",

  // 协议类 (2xxx)
  PROTOCOL_INVALID_MESSAGE: "PROTOCOL_INVALID_MESSAGE",
  PROTOCOL_UNKNOWN_ACTION: "PROTOCOL_UNKNOWN_ACTION",
  PROTOCOL_MISSING_FIELD: "PROTOCOL_MISSING_FIELD",

  // 会话类 (3xxx)
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  SESSION_ALREADY_EXISTS: "SESSION_ALREADY_EXISTS",
  SESSION_TIMEOUT: "SESSION_TIMEOUT",

  // Agent 类 (4xxx)
  AGENT_SPAWN_FAILED: "AGENT_SPAWN_FAILED",
  AGENT_CRASHED: "AGENT_CRASHED",
  AGENT_PERMISSION_DENIED: "AGENT_PERMISSION_DENIED",

  // 持久化类 (5xxx)
  PERSISTENCE_WRITE_FAILED: "PERSISTENCE_WRITE_FAILED",
  PERSISTENCE_READ_FAILED: "PERSISTENCE_READ_FAILED",

  // 补传类 (6xxx)
  REPLAY_ABORTED: "REPLAY_ABORTED",
} as const;

/** 错误码类型 */
export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/** 错误码 → 日志级别映射 */
export const ErrorSeverity: Record<string, "warn" | "error"> = {
  AUTH_INVALID_TOKEN: "warn",
  AUTH_MISSING_TOKEN: "warn",
  AUTH_SERVICE_FORBIDDEN: "error",
  PROTOCOL_INVALID_MESSAGE: "warn",
  PROTOCOL_UNKNOWN_ACTION: "warn",
  PROTOCOL_MISSING_FIELD: "warn",
  SESSION_NOT_FOUND: "warn",
  SESSION_ALREADY_EXISTS: "warn",
  SESSION_TIMEOUT: "warn",
  AGENT_SPAWN_FAILED: "error",
  AGENT_CRASHED: "error",
  AGENT_PERMISSION_DENIED: "warn",
  PERSISTENCE_WRITE_FAILED: "error",
  PERSISTENCE_READ_FAILED: "error",
  REPLAY_ABORTED: "warn",
};

/**
 * 创建错误 payload。
 *
 * @param code 错误码（来自 ErrorCode 常量）
 * @param message 人类可读的错误描述
 * @param sessionId 关联的会话 ID（可选）
 * @returns 标准格式的错误 payload 对象
 */
export function createErrorPayload(
  code: string,
  message: string,
  sessionId?: string
): { code: string; message: string; session_id?: string } {
  return {
    code,
    message,
    ...(sessionId !== undefined ? { session_id: sessionId } : {}),
  };
}
