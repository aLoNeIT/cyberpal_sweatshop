/**
 * pi-gateway 入口 —— Bun.serve() WS Server + HTTP /health 端点
 *
 * 启动流程：
 *   1. loadConfig() — 从环境变量加载配置
 *   2. validateConfig() — 校验配置有效性
 *   3. Logger / Persistence / Auth / Registry / Replayer / HealthMonitor 初始化
 *   4. Bun.serve() 启动 WS + HTTP Server
 *   5. 注册 SIGINT 优雅退出
 *
 * WS 连接流程：
 *   1. 客户端连接 → 等待第一条消息（JWT token）
 *   2. 校验 JWT → 绑定 service_id → 创建/恢复 ServiceContext
 *   3. 后续消息按 action 路由（submit / reconnect / ping）
 *
 * @module server
 */

import { loadConfig } from "./config.ts";
import type { ServerWebSocket } from "bun";
import type { GatewayConfig, WSMessage, HealthStatus } from "./types.ts";
import { Logger } from "./logger.ts";
import { Persistence } from "./persistence.ts";
import { Auth } from "./auth.ts";
import { ServiceRegistry } from "./registry.ts";
import { Replayer } from "./replayer.ts";
import { HealthMonitor } from "./health-monitor.ts";
import { ErrorCode, createErrorPayload } from "./errors.ts";

// 网关启动时间戳（用于 /health 的 uptime_ms）
const startTime = Date.now();

/**
 * 校验网关配置。
 *
 * 在 loadConfig() 之后、初始化其他模块之前调用。
 * 校验失败时抛出错误，拒绝启动。
 *
 * @param config 网关配置
 * @throws 当配置无效时抛出错误
 */
function validateConfig(config: GatewayConfig): void {
  const errors: string[] = [];

  // 1. 必填项检查
  if (!config.jwt_secret || config.jwt_secret.length < 16) {
    errors.push("JWT_SECRET must be at least 16 characters");
  }

  if (!config.pi_binary) {
    errors.push("PI_BINARY must not be empty");
  }

  // 2. 数值范围检查
  if (config.port < 1 || config.port > 65535) {
    errors.push(
      `GATEWAY_PORT must be between 1 and 65535, got ${config.port}`
    );
  }

  if (config.heartbeat_interval_ms < 1000) {
    errors.push("HEARTBEAT_INTERVAL_MS must be >= 1000");
  }

  if (config.heartbeat_timeout_ms <= config.heartbeat_interval_ms) {
    errors.push("HEARTBEAT_TIMEOUT_MS must be > HEARTBEAT_INTERVAL_MS");
  }

  if (config.session_timeout_ms < 60000) {
    errors.push("SESSION_TIMEOUT_MS must be >= 60000 (1 minute)");
  }

  if (config.agent_idle_timeout_ms < 60000) {
    errors.push("AGENT_IDLE_TIMEOUT_MS must be >= 60000 (1 minute)");
  }

  if (config.replay_batch_size < 1) {
    errors.push("REPLAY_BATCH_SIZE must be >= 1");
  }

  if (config.replay_max_total < 100) {
    errors.push("REPLAY_MAX_TOTAL must be >= 100");
  }

  // 3. 路径检查
  if (config.sqlite_path !== ":memory:" && !config.sqlite_path) {
    errors.push("SQLITE_PATH must not be empty");
  }

  // 4. 枚举值检查
  const validAlgorithms = ["HS256", "HS384", "HS512"];
  if (!validAlgorithms.includes(config.jwt_algorithm)) {
    errors.push(
      `JWT_ALGORITHM must be one of ${validAlgorithms.join(", ")}`
    );
  }

  if (!config.pi_provider || config.pi_provider.length === 0) {
    errors.push("PI_PROVIDER must not be empty");
  }

  const validLogLevels = ["debug", "info", "warn", "error"];
  if (!validLogLevels.includes(config.log_level)) {
    errors.push(
      `LOG_LEVEL must be one of ${validLogLevels.join(", ")}`
    );
  }

  if (errors.length > 0) {
    throw new Error(
      "Configuration validation failed:\n  " + errors.join("\n  ")
    );
  }
}

/**
 * 构建健康状态响应。
 *
 * @param registry 服务注册表
 * @param persistence 持久化层（用于查询积压）
 * @param config 网关配置
 * @returns 健康状态对象
 */
function getHealthStatus(
  registry: ServiceRegistry,
  persistence: Persistence,
  config: GatewayConfig
): HealthStatus {
  const services = registry.getAll().map((svc) => ({
    service_id: svc.service_id,
    online: !svc.offline,
    sessions: svc.sessions.size,
    backlog: persistence.getBacklogCount(svc.service_id),
  }));

  const hasOfflineWithBacklog = services.some(
    (s) => !s.online && s.backlog > 0
  );

  return {
    status: hasOfflineWithBacklog ? "degraded" : "ok",
    uptime_ms: Date.now() - startTime,
    services,
    sqlite_path: config.sqlite_path,
    version: "0.1.0",
  };
}

/**
 * WS 消息认证状态：每个 WS 连接在认证前 service_id 为 null。
 * 使用 WeakMap 存储连接级状态，连接断开时自动回收。
 */
const wsState = new WeakMap<
    ServerWebSocket<undefined>,
    { authenticated: boolean; service_id: string | null }
  >();

/**
 * 处理 WS 消息。
 *
 * 消息路由逻辑：
 *   1. 未认证 → 第一条消息视为 JWT token，校验后标记已认证
 *   2. 已认证 → 按 action 路由（submit / reconnect / ping）
 *
 * @param ws WebSocket 连接
 * @param text 消息文本
 * @param config 网关配置
 * @param auth JWT 认证器
 * @param registry 服务注册表
 * @param replayer 补传器
 * @param logger 日志工具
 */
export async function handleMessage(
  ws: ServerWebSocket<undefined>,
  text: string,
  config: GatewayConfig,
  auth: Auth,
  registry: ServiceRegistry,
  replayer: Replayer,
  logger: Logger
): Promise<void> {
  // 获取或初始化连接状态
  let state = wsState.get(ws);
  if (!state) {
    state = { authenticated: false, service_id: null };
    wsState.set(ws, state);
  }

  // 未认证：第一条消息是 JWT token
  if (!state.authenticated) {
    const result = await auth.verify(text);
    if (!result.valid || !result.service_id) {
      const errorMsg: WSMessage = {
        type: "event",
        service_id: "",
        session_id: "",
        seq: 0,
        event: "error",
        payload: createErrorPayload(
          result.error ?? ErrorCode.AUTH_INVALID_TOKEN,
          "Authentication failed"
        ),
      };
      ws.send(JSON.stringify(errorMsg));
      ws.close(4001, "Authentication failed");
      return;
    }

    state.authenticated = true;
    state.service_id = result.service_id;

    // 注册服务并绑定 WS
    const service = registry.getOrCreate(result.service_id);
    service.bindWS(ws);

    logger.info("Client authenticated", { service_id: result.service_id });
    return;
  }

  // 已认证：解析 JSON 消息
  let msg: WSMessage;
  try {
    msg = JSON.parse(text);
  } catch {
    const errorMsg: WSMessage = {
      type: "event",
      service_id: state.service_id ?? "",
      session_id: "",
      seq: 0,
      event: "error",
      payload: createErrorPayload(
        ErrorCode.PROTOCOL_INVALID_MESSAGE,
        "Invalid JSON"
      ),
    };
    ws.send(JSON.stringify(errorMsg));
    return;
  }

  // 校验 service_id 匹配
  if (msg.service_id !== state.service_id) {
    const errorMsg: WSMessage = {
      type: "event",
      service_id: state.service_id ?? "",
      session_id: msg.session_id ?? "",
      seq: 0,
      event: "error",
      payload: createErrorPayload(
        ErrorCode.AUTH_SERVICE_FORBIDDEN,
        "service_id mismatch"
      ),
    };
    ws.send(JSON.stringify(errorMsg));
    return;
  }

  // 按 action 路由
  const service = registry.get(msg.service_id);
  if (!service) {
    logger.error("Service not found after auth", {
      service_id: msg.service_id,
    });
    return;
  }

  switch (msg.action) {
    case "submit":
      await handleSubmit(service, msg, config, logger);
      break;
    case "reconnect":
      await handleReconnect(service, replayer, logger);
      break;
    case "ping":
      handlePing(service, ws, msg);
      break;
    default:
      const errorMsg: WSMessage = {
        type: "event",
        service_id: msg.service_id,
        session_id: msg.session_id,
        seq: 0,
        event: "error",
        payload: createErrorPayload(
          ErrorCode.PROTOCOL_UNKNOWN_ACTION,
          `Unknown action: ${msg.action}`
        ),
      };
      ws.send(JSON.stringify(errorMsg));
  }
}

/**
 * 处理 submit 请求：创建 session + 启动 agent。
 *
 * @param service 服务上下文
 * @param msg WS 消息
 * @param config 网关配置
 * @param logger 日志工具
 */
async function handleSubmit(
  service: import("./service-context.ts").ServiceContextImpl,
  msg: WSMessage,
  config: GatewayConfig,
  logger: Logger
): Promise<void> {
  try {
    const payload = msg.payload as Record<string, unknown>;

    // 校验必填字段
    if (!payload.prompt) {
      const errorMsg: WSMessage = {
        type: "event",
        service_id: msg.service_id,
        session_id: msg.session_id,
        seq: 0,
        event: "error",
        payload: createErrorPayload(
          ErrorCode.PROTOCOL_MISSING_FIELD,
          "Missing required field: prompt",
          msg.session_id
        ),
      };
      service.push(errorMsg);
      return;
    }

    const session = service.createSession(msg.session_id);

    await session.start({
      prompt: payload.prompt as string,
      model: payload.model as string | undefined,
      thinking: payload.thinking as string | undefined,
      provider: payload.provider as string | undefined,
    });

    logger.info("Task submitted", {
      service_id: msg.service_id,
      session_id: msg.session_id,
    });
  } catch (e) {
    const errorCode = String(e).includes("SESSION_ALREADY_EXISTS")
      ? ErrorCode.SESSION_ALREADY_EXISTS
      : ErrorCode.AGENT_SPAWN_FAILED;

    const errorMsg: WSMessage = {
      type: "event",
      service_id: msg.service_id,
      session_id: msg.session_id,
      seq: 0,
      event: "error",
      payload: createErrorPayload(errorCode, String(e), msg.session_id),
    };
    service.push(errorMsg);
  }
}

/**
 * 处理 reconnect 请求：触发补传。
 *
 * @param service 服务上下文
 * @param replayer 补传器
 * @param logger 日志工具
 */
async function handleReconnect(
  service: import("./service-context.ts").ServiceContextImpl,
  replayer: Replayer,
  logger: Logger
): Promise<void> {
  logger.info("Reconnect request", { service_id: service.service_id });
  await replayer.replay(service);
}

/**
 * 处理 ping 请求：更新心跳 + 回复 pong。
 *
 * @param service 服务上下文
 * @param ws WebSocket 连接
 * @param msg WS 消息
 */
function handlePing(
  service: import("./service-context.ts").ServiceContextImpl,
  ws: ServerWebSocket<undefined>,
  msg: WSMessage
): void {
  service.updatePing();

  const pong: WSMessage = {
    type: "event",
    service_id: msg.service_id,
    session_id: "",
    seq: 0,
    event: "pong",
    payload: { timestamp: Date.now() },
  };
  ws.send(JSON.stringify(pong));
}

/**
 * 处理 WS 关闭：标记服务离线。
 *
 * 注意：不终止 session/agent，agent 继续运行，产出写入 SQLite。
 *
 * @param ws WebSocket 连接
 * @param registry 服务注册表
 * @param logger 日志工具
 */
function handleClose(
  ws: ServerWebSocket<undefined>,
  registry: ServiceRegistry,
  logger: Logger
): void {
  const state = wsState.get(ws);
  if (state?.service_id) {
    const service = registry.get(state.service_id);
    if (service) {
      service.unbindWS();
    }
  }
  wsState.delete(ws);
  logger.debug("WS connection closed");
}

/**
 * 网关入口 —— 启动函数。
 */
async function main(): Promise<void> {
  // 1. 加载配置
  const config = loadConfig();

  // 2. 校验配置
  validateConfig(config);

  // 3. 初始化模块
  const logger = new Logger(config.log_level);
  const persistence = new Persistence(config, logger);
  const auth = new Auth(config, logger);
  const registry = new ServiceRegistry(config, persistence, logger);
  const replayer = new Replayer(config, persistence, logger);
  const healthMonitor = new HealthMonitor(
    config,
    registry,
    persistence,
    logger
  );

  // 4. 启动健康监控
  healthMonitor.start();

  // 5. 启动 WS + HTTP Server
  const server = Bun.serve({
    port: config.port,
    // HTTP 请求处理（健康检查）
    fetch(req: Request): Response {
      const url = new URL(req.url);
      if (url.pathname === "/health") {
        const health = getHealthStatus(registry, persistence, config);
        return new Response(JSON.stringify(health), {
          headers: { "Content-Type": "application/json" },
          status: health.status === "ok" ? 200 : 503,
        });
      }
      return new Response("Not Found", { status: 404 });
    },
    websocket: {
      // 连接建立（此时还不知道 service_id，等第一条消息认证）
      open(_ws: ServerWebSocket<undefined>): void {
        logger.debug("WS connection opened");
      },

      // 消息处理
      async message(
        ws: ServerWebSocket<undefined>,
        message: string | Buffer
      ): Promise<void> {
        const text =
          typeof message === "string" ? message : message.toString();
        await handleMessage(
          ws,
          text,
          config,
          auth,
          registry,
          replayer,
          logger
        );
      },

      // 连接关闭
      close(ws: ServerWebSocket<undefined>, _code: number, _reason: string): void {
        handleClose(ws, registry, logger);
      },
    },
  });

  logger.info("pi-gateway started", { port: config.port });
  console.log(`pi-gateway listening on ws://localhost:${config.port}`);

  // 6. 优雅退出
  process.on("SIGINT", () => {
    logger.info("Shutting down...");
    // 停止健康监控
    healthMonitor.stop();
    // 终止所有 agent 进程
    for (const svc of registry.getAll()) {
      for (const session of svc.sessions.values()) {
        session.destroy();
      }
    }
    // 关闭 SQLite
    persistence.close();
    // 停止 WebSocket Server
    server.stop();
    process.exit(0);
  });
}

// 启动（仅当作为入口直接运行时启动；被测试 import 时不自动启动）
if (import.meta.main) {
  main().catch((e) => {
    console.error("Failed to start pi-gateway:", e);
    process.exit(1);
  });
}
