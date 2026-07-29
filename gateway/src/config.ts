/**
 * pi-gateway 配置加载
 *
 * 从环境变量加载所有网关配置，提供合理的默认值。
 * JWT_SECRET 为必填项，缺失时抛出错误。
 *
 * @module config
 */

import type { GatewayConfig } from "./types.ts";

/**
 * 从环境变量加载网关配置。
 *
 * 环境变量列表：
 *   GATEWAY_PORT              - WS 监听端口（默认 3002）
 *   SQLITE_PATH               - SQLite 文件路径（默认 /data/gateway.db）
 *   JWT_SECRET                - JWT 签名密钥（必填，无默认值）
 *   JWT_ALGORITHM             - JWT 算法（默认 HS256）
 *   HEARTBEAT_INTERVAL_MS     - 心跳间隔（默认 10000）
 *   HEARTBEAT_TIMEOUT_MS      - 断线判定（默认 30000）
 *   SESSION_TIMEOUT_MS        - 会话超时（默认 1800000 = 30min）
 *   AGENT_IDLE_TIMEOUT_MS     - agent 闲置回收（默认 600000 = 10min）
 *   REPLAY_BATCH_SIZE         - 补传批量（默认 100）
 *   REPLAY_SLEEP_MS           - 补传间隔（默认 10）
 *   REPLAY_MAX_TOTAL          - 补传总量上限（默认 10000）
 *   CLEANUP_INTERVAL_MS       - 清理间隔（默认 3600000 = 1h）
 *   CLEANUP_RETENTION_MS      - 清理保留（默认 3600000 = 1h）
 *   PI_BINARY                 - pi-agent 路径（默认 "pi"）
 *   PI_MODE                   - pi 运行模式（默认 "rpc"）
 *   PI_SANDBOX                - 沙箱类型（默认 "none"）
 *   PI_PERMISSION_CONFIG      - 权限配置路径
 *   LOG_LEVEL                 - 日志级别（默认 "info"）
 *
 * @returns 完整的 GatewayConfig 对象
 * @throws 当 JWT_SECRET 未设置时抛出错误
 */
export function loadConfig(): GatewayConfig {
  const jwtSecret = process.env.JWT_SECRET ?? "";
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  return {
    port: parseInt(process.env.GATEWAY_PORT ?? "3002", 10),
    sqlite_path: process.env.SQLITE_PATH ?? "/data/gateway.db",
    jwt_secret: jwtSecret,
    jwt_algorithm: (process.env.JWT_ALGORITHM ?? "HS256") as "HS256" | "HS384" | "HS512",
    heartbeat_interval_ms: parseInt(process.env.HEARTBEAT_INTERVAL_MS ?? "10000", 10),
    heartbeat_timeout_ms: parseInt(process.env.HEARTBEAT_TIMEOUT_MS ?? "30000", 10),
    session_timeout_ms: parseInt(process.env.SESSION_TIMEOUT_MS ?? "1800000", 10),
    agent_idle_timeout_ms: parseInt(process.env.AGENT_IDLE_TIMEOUT_MS ?? "600000", 10),
    replay_batch_size: parseInt(process.env.REPLAY_BATCH_SIZE ?? "100", 10),
    replay_sleep_ms: parseInt(process.env.REPLAY_SLEEP_MS ?? "10", 10),
    replay_max_total: parseInt(process.env.REPLAY_MAX_TOTAL ?? "10000", 10),
    cleanup_interval_ms: parseInt(process.env.CLEANUP_INTERVAL_MS ?? "3600000", 10),
    cleanup_retention_ms: parseInt(process.env.CLEANUP_RETENTION_MS ?? "3600000", 10),
    pi_binary: process.env.PI_BINARY ?? "pi",
    pi_mode: process.env.PI_MODE ?? "rpc",
    pi_sandbox: process.env.PI_SANDBOX ?? "none",
    pi_permission_config: process.env.PI_PERMISSION_CONFIG ?? "",
    log_level: (process.env.LOG_LEVEL ?? "info") as "debug" | "info" | "warn" | "error",
  };
}

/** 默认配置常量（测试用，使用内存 SQLite 和测试密钥） */
export const DEFAULT_CONFIG: GatewayConfig = {
  port: 3002,
  sqlite_path: ":memory:",
  jwt_secret: "test-secret-key-for-testing",
  jwt_algorithm: "HS256",
  heartbeat_interval_ms: 10000,
  heartbeat_timeout_ms: 30000,
  session_timeout_ms: 1800000,
  agent_idle_timeout_ms: 600000,
  replay_batch_size: 100,
  replay_sleep_ms: 10,
  replay_max_total: 10000,
  cleanup_interval_ms: 3600000,
  cleanup_retention_ms: 3600000,
  pi_binary: "pi",
  pi_mode: "rpc",
  pi_sandbox: "none",
  pi_permission_config: "",
  log_level: "info",
};
