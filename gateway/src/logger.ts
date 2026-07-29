/**
 * pi-gateway 日志工具
 *
 * 统一日志格式，按级别过滤输出。
 * warn/error 输出到 stderr，debug/info 输出到 stdout。
 *
 * @module logger
 */

/** 日志级别 */
type LogLevel = "debug" | "info" | "warn" | "error";

/** 日志级别优先级（数值越大优先级越高） */
const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * 日志工具类。
 *
 * 使用方式：
 *   const logger = new Logger("info");
 *   logger.info("Server started", { port: 3002 });
 *   logger.error("Agent crashed", { pid: 1234, session_id: "..." });
 */
export class Logger {
  private level: LogLevel;
  private minPriority: number;

  /**
   * 创建 Logger 实例。
   *
   * @param level 最低输出级别，低于此级别的日志将被忽略
   */
  constructor(level: LogLevel = "info") {
    this.level = level;
    this.minPriority = LEVEL_PRIORITY[level];
  }

  /**
   * 设置日志级别（运行时动态调整）。
   *
   * @param level 新的日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
    this.minPriority = LEVEL_PRIORITY[level];
  }

  /** @returns 当前日志级别 */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Debug 级别日志 —— 详细事件流信息。
   *
   * @param msg 日志消息
   * @param ctx 上下文对象
   */
  debug(msg: string, ctx?: Record<string, unknown>): void {
    if (this.minPriority <= LEVEL_PRIORITY.debug) {
      this.write("DEBUG", msg, ctx);
    }
  }

  /**
   * Info 级别日志 —— 关键生命周期事件。
   *
   * @param msg 日志消息
   * @param ctx 上下文对象
   */
  info(msg: string, ctx?: Record<string, unknown>): void {
    if (this.minPriority <= LEVEL_PRIORITY.info) {
      this.write("INFO", msg, ctx);
    }
  }

  /**
   * Warn 级别日志 —— 可恢复的异常（断线、超时、权限拦截等）。
   *
   * @param msg 日志消息
   * @param ctx 上下文对象
   */
  warn(msg: string, ctx?: Record<string, unknown>): void {
    if (this.minPriority <= LEVEL_PRIORITY.warn) {
      this.write("WARN", msg, ctx);
    }
  }

  /**
   * Error 级别日志 —— 不可恢复的错误（agent 崩溃、SQLite 写入失败等）。
   *
   * @param msg 日志消息
   * @param ctx 上下文对象
   */
  error(msg: string, ctx?: Record<string, unknown>): void {
    if (this.minPriority <= LEVEL_PRIORITY.error) {
      this.write("ERROR", msg, ctx);
    }
  }

  /**
   * 写入日志（内部方法）。
   *
   * 格式：[ISO时间] [级别] 消息 {JSON上下文}
   * warn/error 输出到 stderr，debug/info 输出到 stdout。
   *
   * @param level 日志级别标签
   * @param msg 日志消息
   * @param ctx 上下文对象
   */
  private write(level: string, msg: string, ctx?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const line = ctx
      ? `[${timestamp}] [${level}] ${msg} ${JSON.stringify(ctx)}`
      : `[${timestamp}] [${level}] ${msg}`;
    if (level === "ERROR" || level === "WARN") {
      console.error(line);
    } else {
      console.log(line);
    }
  }
}
