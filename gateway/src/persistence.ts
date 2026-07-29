/**
 * pi-gateway SQLite 持久化层
 *
 * 封装所有 SQLite 操作：初始化表结构、写入事件、查询积压、标记已消费、清理。
 * 使用 bun:sqlite 内置模块，无需外部依赖。
 *
 * 线程安全：Bun 单线程 Event Loop，SQLite 操作天然串行，无需锁。
 *
 * @module persistence
 */

import { Database } from "bun:sqlite";
import type { SessionEventRecord, GatewayConfig } from "./types.ts";
import { Logger } from "./logger.ts";

/**
 * SQLite 持久化层。
 *
 * 职责：
 * - 初始化数据库和表结构
 * - 写入事件（agent 产出时）
 * - 查询积压事件（服务重连时）
 * - 标记已消费
 * - 清理已消费数据
 */
export class Persistence {
  private db: Database;
  private logger: Logger;

  /**
   * 初始化持久化层。
   *
   * @param config 网关配置（使用 config.sqlite_path）
   * @param logger 日志工具
   */
  constructor(config: GatewayConfig, logger: Logger) {
    this.logger = logger;
    this.db = new Database(config.sqlite_path, { create: true });
    this.initSchema();
  }

  /**
   * 初始化表结构。
   * 幂等操作，重复调用安全。
   */
  private initSchema(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS session_events (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id  TEXT NOT NULL,
        session_id  TEXT NOT NULL,
        seq         INTEGER NOT NULL,
        payload     TEXT NOT NULL,
        created_at  INTEGER NOT NULL,
        consumed    INTEGER DEFAULT 0
      )
    `);
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_service_consumed
        ON session_events(service_id, consumed, session_id, seq)
    `);
    this.logger.info("SQLite schema initialized");
  }

  /**
   * 写入一条事件记录。
   *
   * @param serviceId 服务 ID
   * @param sessionId 会话 ID
   * @param seq 消息序号
   * @param payload WS 消息 JSON 字符串
   * @returns 插入的自增 ID
   */
  writeEvent(
    serviceId: string,
    sessionId: string,
    seq: number,
    payload: string
  ): number {
    const createdAt = Date.now();
    const stmt = this.db.prepare(`
      INSERT INTO session_events (service_id, session_id, seq, payload, created_at, consumed)
      VALUES (?, ?, ?, ?, ?, 0)
    `);
    const result = stmt.run(serviceId, sessionId, seq, payload, createdAt);
    return Number(result.lastInsertRowid);
  }

  /**
   * 查询某服务的积压事件（consumed = 0），按 session_id, seq 排序。
   *
   * @param serviceId 服务 ID
   * @param limit 最大返回数量（默认 10000）
   * @returns 积压事件记录数组
   */
  getBacklog(serviceId: string, limit: number = 10000): SessionEventRecord[] {
    const stmt = this.db.prepare(`
      SELECT id, service_id, session_id, seq, payload, created_at, consumed
      FROM session_events
      WHERE service_id = ? AND consumed = 0
      ORDER BY session_id ASC, seq ASC
      LIMIT ?
    `);
    return stmt.all(serviceId, limit) as SessionEventRecord[];
  }

  /**
   * 查询某服务的积压数量。
   *
   * @param serviceId 服务 ID
   * @returns 积压数量
   */
  getBacklogCount(serviceId: string): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM session_events
      WHERE service_id = ? AND consumed = 0
    `);
    const row = stmt.get(serviceId) as { count: number };
    return row.count;
  }

  /**
   * 标记一条记录为已消费。
   *
   * @param id 记录 ID
   */
  markConsumed(id: number): void {
    const stmt = this.db.prepare(`
      UPDATE session_events SET consumed = 1 WHERE id = ?
    `);
    stmt.run(id);
  }

  /**
   * 批量标记已消费。
   *
   * @param ids 记录 ID 数组
   */
  markConsumedBatch(ids: number[]): void {
    if (ids.length === 0) return;
    const placeholders = ids.map(() => "?").join(",");
    const stmt = this.db.prepare(`
      UPDATE session_events SET consumed = 1 WHERE id IN (${placeholders})
    `);
    stmt.run(...ids);
  }

  /**
   * 清理已消费且超过保留期的事件。
   *
   * @param retentionMs 保留时长（毫秒），早于此时间戳的已消费记录将被删除
   * @returns 删除的行数
   */
  cleanup(retentionMs: number): number {
    const cutoff = Date.now() - retentionMs;
    const stmt = this.db.prepare(`
      DELETE FROM session_events WHERE consumed = 1 AND created_at <= ?
    `);
    const result = stmt.run(cutoff);
    return Number(result.changes);
  }

  /**
   * 关闭数据库连接。
   */
  close(): void {
    this.db.close();
    this.logger.info("SQLite database closed");
  }
}
