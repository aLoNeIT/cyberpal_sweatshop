/**
 * pi-gateway 服务上下文
 *
 * 管理单个 Hyperf 服务的连接状态和会话集合，
 * 实现断线标记和 push 逻辑（在线直推，离线写 SQLite）。
 *
 * 状态流转：
 *   online（ws !== null, offline = false）
 *     ↓ WS 断开
 *   offline（ws = null, offline = true）→ agent 产出写入 SQLite
 *     ↓ reconnect
 *   online → 补传积压 → 恢复实时推送
 *
 * @module service-context
 */

import type { WSMessage, GatewayConfig } from "./types.ts";
import type { ServerWebSocket } from "bun";
import { SessionContextImpl } from "./session-context.ts";
import { Persistence } from "./persistence.ts";
import { Logger } from "./logger.ts";

/**
 * 单服务上下文。
 *
 * 职责：
 * - 维护 WS 连接和离线标记
 * - 管理该服务下所有 SessionContext
 * - push() 逻辑：在线直推，离线写 SQLite
 */
export class ServiceContextImpl {
  readonly service_id: string;
  offline: boolean = true;
  ws: ServerWebSocket<undefined> | null = null;
  last_ping: number;
  sessions: Map<string, SessionContextImpl> = new Map();
  private persistence: Persistence;
  private logger: Logger;
  private config: GatewayConfig;

  /**
   * 创建服务上下文。
   *
   * @param serviceId 服务 ID（来自 JWT token）
   * @param config 网关配置
   * @param persistence 持久化层
   * @param logger 日志工具
   */
  constructor(
    serviceId: string,
    config: GatewayConfig,
    persistence: Persistence,
    logger: Logger
  ) {
    this.service_id = serviceId;
    this.config = config;
    this.persistence = persistence;
    this.logger = logger;
    this.last_ping = Date.now();
  }

  /**
   * 绑定 WS 连接，标记为在线。
   *
   * @param ws WebSocket 连接
   */
  bindWS(ws: ServerWebSocket<undefined>): void {
    this.ws = ws;
    this.offline = false;
    this.last_ping = Date.now();
    this.logger.info("Service bound to WS", { service_id: this.service_id });
  }

  /**
   * 解绑 WS 连接，标记为离线。
   *
   * 该服务下所有 session 的 agent 继续执行，产出自动走 SQLite。
   */
  unbindWS(): void {
    this.ws = null;
    this.offline = true;
    this.logger.info("Service unbound from WS (offline)", {
      service_id: this.service_id,
    });
  }

  /**
   * 更新最后 ping 时间。
   */
  updatePing(): void {
    this.last_ping = Date.now();
  }

  /**
   * 判断是否心跳超时。
   *
   * @param timeoutMs 超时阈值（毫秒）
   * @returns 是否超时
   */
  isHeartbeatTimeout(timeoutMs: number): boolean {
    return Date.now() - this.last_ping > timeoutMs;
  }

  /**
   * 创建新会话。
   *
   * @param sessionId 会话 ID（UUID）
   * @returns 会话上下文
   * @throws 当会话已存在时抛出 SESSION_ALREADY_EXISTS 错误
   */
  createSession(sessionId: string): SessionContextImpl {
    if (this.sessions.has(sessionId)) {
      throw new Error(`SESSION_ALREADY_EXISTS: ${sessionId}`);
    }
    const session = new SessionContextImpl(
      sessionId,
      this.service_id,
      this.config,
      this.logger
    );
    // 注册 push 回调：所有会话产出通过 service.push() 路由
    session.onPush((msg) => this.push(msg));
    this.sessions.set(sessionId, session);
    this.logger.info("Session created", {
      service_id: this.service_id,
      session_id: sessionId,
    });
    return session;
  }

  /**
   * 获取会话。
   *
   * @param sessionId 会话 ID
   * @returns 会话上下文或 undefined
   */
  getSession(sessionId: string): SessionContextImpl | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 移除会话（agent 已终止）。
   *
   * @param sessionId 会话 ID
   */
  removeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.destroy();
      this.sessions.delete(sessionId);
      this.logger.info("Session removed", {
        service_id: this.service_id,
        session_id: sessionId,
      });
    }
  }

  /**
   * 推送 WS 消息给 Hyperf 服务。
   *
   * 核心逻辑：
   * - 在线（ws !== null && readyState === OPEN）→ 直接 ws.send()
   * - 离线 → 写入 SQLite 缓冲
   *
   * @param msg WS 消息
   */
  push(msg: WSMessage): void {
    const payloadStr = JSON.stringify(msg);

    if (this.ws && this.ws.readyState === 1) {
      // 在线：直接推送
      try {
        this.ws.send(payloadStr);
      } catch (_e) {
        // 发送失败，降级写入 SQLite
        this.offline = true;
        this.persistence.writeEvent(
          this.service_id,
          msg.session_id,
          msg.seq,
          payloadStr
        );
      }
    } else {
      // 离线：写入 SQLite
      if (!this.offline) {
        this.offline = true;
      }
      this.persistence.writeEvent(
        this.service_id,
        msg.session_id,
        msg.seq,
        payloadStr
      );
    }
  }

  /**
   * 通过 WS 发送消息（不受离线标记影响，用于补传和控制消息）。
   *
   * @param msg WS 消息
   * @returns 是否发送成功
   */
  sendDirect(msg: WSMessage): boolean {
    if (this.ws && this.ws.readyState === 1) {
      try {
        this.ws.send(JSON.stringify(msg));
        return true;
      } catch (_e) {
        return false;
      }
    }
    return false;
  }

  /**
   * 获取该服务下所有活跃会话。
   *
   * @returns running 状态的会话列表
   */
  getActiveSessions(): SessionContextImpl[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.session_status === "running"
    );
  }

  /**
   * 清理超时会话（创建超过 timeoutMs 的会话直接终止）。
   *
   * @param timeoutMs 会话超时阈值（毫秒）
   * @returns 被清理的会话 ID 列表
   */
  cleanupTimeoutSessions(timeoutMs: number): string[] {
    const now = Date.now();
    const cleaned: string[] = [];
    for (const [sid, session] of this.sessions) {
      if (now - session.created_at > timeoutMs) {
        session.destroy("timeout");
        this.sessions.delete(sid);
        cleaned.push(sid);
        this.logger.warn("Session timeout, cleaned up", {
          service_id: this.service_id,
          session_id: sid,
        });
      }
    }
    return cleaned;
  }

  /**
   * 清理闲置会话（agent 空闲超过阈值）。
   *
   * 仅清理 status="running" 且 agent 最后活动时间超过阈值的会话。
   * 已完成的会话不在 running 状态，不会被误清理。
   *
   * @param idleMs 闲置超时阈值（毫秒）
   * @returns 被清理的会话 ID 列表
   */
  cleanupIdleSessions(idleMs: number): string[] {
    const cleaned: string[] = [];
    for (const [sid, session] of this.sessions) {
      if (session.isIdleTimeout(idleMs)) {
        session.destroy("timeout");
        this.sessions.delete(sid);
        cleaned.push(sid);
        this.logger.info("Agent idle timeout, recycled", {
          service_id: this.service_id,
          session_id: sid,
          last_activity: session.lastActivity,
        });
      }
    }
    return cleaned;
  }
}
