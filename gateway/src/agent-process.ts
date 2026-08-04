/**
 * pi-gateway Agent 进程封装
 *
 * 封装 `pi --mode rpc` 子进程的启动、NDJSON/stdio 通信、
 * 事件分发、崩溃检测和终止。
 *
 * 生命周期：
 *   1. 构造 → 2. start() spawn 子进程 → 3. submit() 发送命令
 *   4. onEvent() 接收产出 → 5. kill() 或进程自行退出
 *
 * @module agent-process
 */

import type { FileSink } from "bun";
import type { PiRpcCommand, PiRpcMessage, PiRpcResponse, PiRpcEvent } from "./types.ts";
import type { GatewayConfig } from "./types.ts";
import { Logger } from "./logger.ts";
import { ErrorCode } from "./errors.ts";

/**
 * pi-agent 子进程封装。
 *
 * 通过 Bun.spawn() 启动 `pi --mode rpc` 子进程，
 * 通过 stdin/stdout 进行 NDJSON 通信。
 */
export class AgentProcessImpl {
  private proc: ReturnType<typeof Bun.spawn> | null = null;
  private logger: Logger;
  private config: GatewayConfig;
  private callbacks: Array<(msg: PiRpcMessage) => void> = [];
  private exitCallbacks: Array<(code: number | null) => void> = [];
  private buffer: string = "";
  private _alive: boolean = false;
  private _exited: boolean = false;
  private _exitCode: number | null = null;
  private _lastActivity: number = 0;
  private _killedByGateway: boolean = false;
  private pendingIds: Map<string, { resolve: (resp: PiRpcResponse) => void; reject: (err: Error) => void }> = new Map();

  /** @returns 子进程 PID（未启动时为 null） */
  get pid(): number | null {
    return this.proc?.pid ?? null;
  }

  /** @returns 子进程是否存活 */
  get alive(): boolean {
    return this._alive;
  }

  /** @returns 子进程是否已退出 */
  get exited(): boolean {
    return this._exited;
  }

  /** @returns 子进程退出码（未退出时为 null） */
  get exitCode(): number | null {
    return this._exitCode;
  }

  /** @returns 最后一次活动时间（Unix ms），用于闲置超时判定 */
  get lastActivity(): number {
    return this._lastActivity;
  }

  /**
   * 创建 AgentProcessImpl 实例（不启动进程，需调用 start()）。
   *
   * @param config 网关配置
   * @param logger 日志工具
   */
  constructor(config: GatewayConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * 启动 pi-agent 子进程。
   *
   * @param env 额外环境变量（如模型 API key）
   * @throws 当进程启动失败时抛出 AGENT_SPAWN_FAILED 错误
   */
  async start(env: Record<string, string> = {}): Promise<void> {
    const args = ["--mode", this.config.pi_mode];

    if (this.config.pi_provider) {
      args.push("--provider", this.config.pi_provider);
    }
    if (this.config.pi_model) {
      args.push("--model", this.config.pi_model);
    }
    if (this.config.pi_no_session) {
      args.push("--no-session");
    }
    if (this.config.pi_session_dir) {
      args.push("--session-dir", this.config.pi_session_dir);
    }
    if (this.config.pi_session_name) {
      args.push("--name", this.config.pi_session_name);
    }

    this.logger.info("Starting pi-agent process", {
      binary: this.config.pi_binary,
      args,
    });

    try {
      this.proc = Bun.spawn({
        cmd: [this.config.pi_binary, ...args],
        stdin: "pipe",
        stdout: "pipe",
        stderr: "pipe",
        env: { ...process.env, ...env },
      });
      this._alive = true;
      this._lastActivity = Date.now();

      // 启动 stdout 读取循环（NDJSON 解析）
      this.readStdout();

      // 启动 stderr 读取（仅日志）
      this.readStderr();

      // 启动退出监听（崩溃检测）
      this.watchExit();

      this.logger.info("pi-agent process started", { pid: this.pid });
    } catch (e) {
      this._alive = false;
      this.logger.error("Failed to start pi-agent", { error: String(e) });
      throw new Error(`${ErrorCode.AGENT_SPAWN_FAILED}: ${String(e)}`);
    }
  }

  /**
   * 附加外部进程（仅供测试使用）。
   *
   * 允许测试代码将已 spawn 的 mock 进程注入到 AgentProcessImpl 实例中，
   * 绕过 start() 的正常二进制启动路径。调用后会自动启动 stdout/stderr 读取
   * 和退出监听。
   *
   * @param proc 已 spawn 的子进程（通过 Bun.spawn 创建）
   */
  attachProcess(proc: ReturnType<typeof Bun.spawn>): void {
    this.proc = proc;
    this._alive = true;
    this._lastActivity = Date.now();
    this._killedByGateway = false;
    this._exited = false;
    this._exitCode = null;

    this.readStdout();
    this.readStderr();
    this.watchExit();

    this.logger.debug("Attached to external process", { pid: this.pid });
  }

  /**
   * 发送 RPC 命令到 agent stdin（NDJSON 格式）。
   *
   * @param command RPC 命令
   * @throws 当 agent 进程未启动或已退出时抛出 AGENT_CRASHED 错误
   */
  async submit(command: PiRpcCommand): Promise<void> {
    if (!this.proc || !this._alive) {
      throw new Error(`${ErrorCode.AGENT_CRASHED}: agent process not running`);
    }

    const line = JSON.stringify(command) + "\n";
    (this.proc.stdin as FileSink).write(new TextEncoder().encode(line));
  }

  /**
   * 发送 steer 命令。
   */
  steer(message: string): Promise<void> {
    return this.submit({ type: "steer", message });
  }

  /**
   * 发送 follow_up 命令。
   */
  followUp(message: string): Promise<void> {
    return this.submit({ type: "follow_up", message });
  }

  /**
   * 发送 abort 命令。
   */
  abort(): Promise<void> {
    return this.submit({ type: "abort" });
  }

  /**
   * 发送 set_model 命令。
   */
  setModel(provider: string, modelId: string): Promise<void> {
    return this.submit({ type: "set_model", provider, modelId });
  }

  /**
   * 发送 set_thinking_level 命令。
   */
  setThinkingLevel(level: "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max"): Promise<void> {
    return this.submit({ type: "set_thinking_level", level });
  }

  /**
   * 发送 get_state 命令。
   */
  getState(): Promise<void> {
    return this.submit({ type: "get_state" });
  }

  /**
   * 注册事件回调。
   *
   * @param callback 回调函数，接收 PiRpcMessage（每次 agent stdout 产出时调用）
   */
  onEvent(callback: (msg: PiRpcMessage) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * 注册进程退出回调（崩溃检测）。
   *
   * 当 agent 进程退出时（正常或崩溃），调用所有注册的回调。
   * 回调参数为退出码：null 表示被信号终止，0 表示正常退出，非 0 表示崩溃。
   * 注意：主动 kill() 不触发 exitCallbacks。
   *
   * @param callback 回调函数，接收退出码
   */
  onExit(callback: (code: number | null) => void): void {
    this.exitCallbacks.push(callback);
  }

  /**
   * 终止 agent 进程。
   *
   * 幂等操作，多次调用安全。
   * 主动 kill 不触发 exitCallbacks（区别于崩溃退出）。
   * 通过 _killedByGateway 区分主动 kill 和自然退出。
   */
  kill(): void {
    if (!this.proc) return;
    this._alive = false;
    this._exited = true;
    this._killedByGateway = true;
    try {
      this.proc.kill();
      this.logger.info("pi-agent process killed", { pid: this.pid });
    } catch (e) {
      this.logger.warn("Failed to kill pi-agent process", {
        pid: this.pid,
        error: String(e),
      });
    }
    this.proc = null;
  }

  /**
   * 监听子进程退出。
   *
   * 内部方法，start() 时自动调用。
   * 使用 Bun.spawn 返回的 Subprocess.exited Promise。
   * 主动 kill 时不触发回调（通过 _killedByGateway 检查）。
   */
  private watchExit(): void {
    if (!this.proc) return;
    const proc = this.proc;

    proc.exited.then((code: number) => {
      this._alive = false;
      this._exited = true;
      this._exitCode = code;

      const reason = code === 0 ? "normal exit" : "crash";
      if (code !== 0) {
        this.logger.warn("pi-agent process exited", {
          pid: proc.pid,
          exit_code: code,
          reason,
        });
      } else {
        this.logger.info("pi-agent process exited normally", {
          pid: proc.pid,
          exit_code: code,
        });
      }

      // 主动 kill 不触发 exitCallbacks（_killedByGateway 在 kill() 中已设为 true）
      if (!this._killedByGateway) {
        for (const cb of this.exitCallbacks) {
          cb(code);
        }
      }
    }).catch((e: unknown) => {
      this._alive = false;
      this._exited = true;
      this._exitCode = null;
      this.logger.error("pi-agent process exited with error", {
        pid: proc.pid,
        error: String(e),
      });

      if (!this._killedByGateway) {
        for (const cb of this.exitCallbacks) {
          cb(null);
        }
      }
    });
  }

  /**
   * 读取 stdout，解析 NDJSON，分发事件。
   *
   * 内部方法，start() 时自动调用。
   * 使用 ReadableStream reader + TextDecoder 按行解析。
   * 每次收到有效消息时更新 lastActivity 时间戳。
   */
  private readStdout(): void {
    if (!this.proc) return;
    const reader = (this.proc.stdout as ReadableStream<Uint8Array>).getReader();
    const decoder = new TextDecoder();

    const readLoop = async (): Promise<void> => {
      try {
        while (this._alive) {
          const { done, value } = await reader.read();
          if (done) break;
          this.buffer += decoder.decode(value, { stream: true });

          // 按行分割（NDJSON）
          let newlineIdx: number;
          while ((newlineIdx = this.buffer.indexOf("\n")) !== -1) {
            const line = this.buffer.slice(0, newlineIdx).trim();
            this.buffer = this.buffer.slice(newlineIdx + 1);
            if (line) {
              this.parseAndDispatch(line);
            }
          }
        }
      } catch (e) {
        if (this._alive) {
          this.logger.error("Error reading agent stdout", { error: String(e) });
        }
      }
    };

    // 不 await，让读取在后台持续进行
    readLoop();
  }

  /**
   * 解析 NDJSON 行并分发给回调。
   * 每次收到有效消息时更新 lastActivity 时间戳。
   *
   * @param line 单行 JSON 字符串
   */
  private parseAndDispatch(line: string): void {
    try {
      const parsed = JSON.parse(line);
      this._lastActivity = Date.now();

      if (parsed.type === "response") {
        // PiRpcResponse
        this.logger.debug("Agent response received", {
          command: parsed.command,
          success: parsed.success,
        });
        for (const cb of this.callbacks) {
          cb(parsed as PiRpcResponse);
        }
      } else {
        // PiRpcEvent
        this.logger.debug("Agent event received", {
          type: parsed.type,
        });
        for (const cb of this.callbacks) {
          cb(parsed as PiRpcEvent);
        }
      }
    } catch (e) {
      this.logger.warn("Failed to parse agent NDJSON line", {
        line: line.slice(0, 200),
        error: String(e),
      });
    }
  }

  /**
   * 读取 stderr，仅记录日志（不阻塞主流程）。
   */
  private readStderr(): void {
    if (!this.proc) return;
    const reader = (this.proc.stderr as ReadableStream<Uint8Array>).getReader();
    const decoder = new TextDecoder();

    const readLoop = async (): Promise<void> => {
      try {
        while (this._alive) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          if (text.trim()) {
            this.logger.warn("pi-agent stderr", { text: text.trim() });
          }
        }
      } catch (_e) {
        // stderr 读取失败不影响主流程
      }
    };

    readLoop();
  }
}
