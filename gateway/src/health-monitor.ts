/**
 * pi-gateway 健康监控器
 *
 * 定时执行心跳超时检测、会话超时清理、Agent 闲置回收和 SQLite 清理。
 *
 * 每次 tick 检查 4 项：
 *   1. 心跳超时 → 标记服务离线
 *   2. 会话超时清理（断线超过 session_timeout_ms 未重连）
 *   3. Agent 闲置回收（agent 空闲超过 agent_idle_timeout_ms）
 *   4. SQLite 清理（删除已消费且超过保留期的事件）
 *
 * @module health-monitor
 */

import type { GatewayConfig } from "./types.ts";
import { ServiceRegistry } from "./registry.ts";
import { Persistence } from "./persistence.ts";
import { Logger } from "./logger.ts";

/**
 * 健康监控器。
 *
 * 使用 setInterval 定时执行健康检查。
 * start() / stop() 均为幂等操作。
 */
export class HealthMonitor {
  private registry: ServiceRegistry;
  private persistence: Persistence;
  private config: GatewayConfig;
  private logger: Logger;
  private timer: ReturnType<typeof setInterval> | null = null;

  /**
   * 创建健康监控器。
   *
   * @param config 网关配置
   * @param registry 服务注册表
   * @param persistence 持久化层
   * @param logger 日志工具
   */
  constructor(
    config: GatewayConfig,
    registry: ServiceRegistry,
    persistence: Persistence,
    logger: Logger
  ) {
    this.config = config;
    this.registry = registry;
    this.persistence = persistence;
    this.logger = logger;
  }

  /**
   * 启动定时监控。
   *
   * 使用 setInterval，间隔 = heartbeat_interval_ms。
   * 幂等操作，多次调用安全。
   */
  start(): void {
    if (this.timer) return;
    this.timer = setInterval(
      () => this.tick(),
      this.config.heartbeat_interval_ms
    );
    this.logger.info("Health monitor started", {
      interval_ms: this.config.heartbeat_interval_ms,
    });
  }

  /**
   * 停止定时监控。
   *
   * 幂等操作，多次调用安全。
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.logger.info("Health monitor stopped");
    }
  }

  /**
   * 单次检查周期。
   *
   * 依次执行：心跳超时 → 会话超时 → Agent 闲置回收 → SQLite 清理
   */
  private tick(): void {
    for (const service of this.registry.getAll()) {
      // 1. 心跳超时检查
      if (
        service.ws &&
        service.isHeartbeatTimeout(this.config.heartbeat_timeout_ms)
      ) {
        this.logger.warn("Heartbeat timeout, marking service offline", {
          service_id: service.service_id,
          last_ping: service.last_ping,
        });
        service.unbindWS();
      }

      // 2. 会话超时清理（断线超过 session_timeout_ms 未重连）
      const timeoutCleaned = service.cleanupTimeoutSessions(
        this.config.session_timeout_ms
      );
      if (timeoutCleaned.length > 0) {
        this.logger.warn("Sessions cleaned up due to timeout", {
          service_id: service.service_id,
          count: timeoutCleaned.length,
          session_ids: timeoutCleaned,
        });
      }

      // 3. Agent 闲置回收（agent 空闲超过 agent_idle_timeout_ms）
      const idleCleaned = service.cleanupIdleSessions(
        this.config.agent_idle_timeout_ms
      );
      if (idleCleaned.length > 0) {
        this.logger.info("Agents recycled due to idle timeout", {
          service_id: service.service_id,
          count: idleCleaned.length,
          session_ids: idleCleaned,
        });
      }
    }

    // 4. SQLite 清理（删除已消费且超过保留期的事件）
    const deleted = this.persistence.cleanup(this.config.cleanup_retention_ms);
    if (deleted > 0) {
      this.logger.debug("SQLite cleanup", { deleted_rows: deleted });
    }
  }
}
