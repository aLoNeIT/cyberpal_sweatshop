/**
 * pi-gateway 会话上下文
 *
 * 管理单次任务会话，维护 agent 进程和消息序号，
 * 将 agent NDJSON 事件映射为 WS 事件。
 *
 * 生命周期：
 *   1. 构造 → 2. start() 启动 agent + 提交任务
 *   3. agent 产出 → onAgentEvent() → 映射 → push 回调
 *   4. 任务完成/超时/崩溃 → destroy()
 *
 * @module session-context
 */

import type {
  AgentTaskParams,
  AgentMessage,
  UsageData,
  GatewayEvent,
  WSMessage,
  SessionContext,
  SessionStatus,
} from "./types.ts";
import { AgentProcessImpl } from "./agent-process.ts";
import type { GatewayConfig } from "./types.ts";
import { Logger } from "./logger.ts";
import { ErrorCode } from "./errors.ts";

/**
 * 单会话上下文。
 *
 * 职责：
 * - 持有 agent 子进程
 * - 维护递增 seqId
 * - 将 agent NDJSON 事件映射为 WS 消息
 * - 通过 push 回调将 WS 消息推送给上层（ServiceContext）
 */
export class SessionContextImpl implements SessionContext {
  readonly session_id: string;
  readonly service_id: string;
  agent: AgentProcessImpl;
  seqId: number = 0;
  private createdAt: number;
  private status: "running" | "completed" | "error" | "timeout" = "running";
  private logger: Logger;
  private config: GatewayConfig;
  private accumulatedUsage: UsageData | null = null;

  /** push 回调：上层（ServiceContext）注册，用于推送或缓冲 WS 消息 */
  private pushCallback: ((msg: WSMessage) => void) | null = null;

  /** @returns 会话创建时间（Unix ms） */
  get created_at(): number {
    return this.createdAt;
  }

  /** @returns 会话状态 */
  get session_status(): SessionStatus {
    return this.status;
  }

  /** @returns agent 最后活动时间（Unix ms），用于闲置超时判定 */
  get lastActivity(): number {
    return this.agent.lastActivity;
  }

  /**
   * 判断会话是否闲置超时。
   *
   * @param timeoutMs 闲置超时阈值（毫秒）
   * @returns 是否闲置超时（仅对 running 状态生效）
   */
  isIdleTimeout(timeoutMs: number): boolean {
    if (this.status !== "running") return false;
    return Date.now() - this.agent.lastActivity > timeoutMs;
  }

  /**
   * 创建会话上下文。
   *
   * @param sessionId 会话 ID（UUID）
   * @param serviceId 服务 ID
   * @param config 网关配置
   * @param logger 日志工具
   */
  constructor(
    sessionId: string,
    serviceId: string,
    config: GatewayConfig,
    logger: Logger
  ) {
    this.session_id = sessionId;
    this.service_id = serviceId;
    this.config = config;
    this.logger = logger;
    this.createdAt = Date.now();
    this.agent = new AgentProcessImpl(config, logger);
  }

  /**
   * 设置 push 回调。
   * 必须在 start() 之前调用。
   *
   * @param callback WS 消息推送回调
   */
  onPush(callback: (msg: WSMessage) => void): void {
    this.pushCallback = callback;
  }

  /**
   * 启动 agent 进程并提交任务。
   *
   * @param params 任务参数
   * @param workDir agent 工作目录
   * @param env 额外环境变量
   */
  async start(
    params: AgentTaskParams,
    workDir: string,
    env: Record<string, string> = {}
  ): Promise<void> {
    // 注册 agent 事件回调
    this.agent.onEvent((msg) => this.onAgentEvent(msg));

    // 注册 agent 退出回调（崩溃检测）
    this.agent.onExit((code) => this.onAgentExit(code));

    // 启动 agent 进程
    await this.agent.start(workDir, env);

    // 提交任务
    await this.agent.submit(params);
  }

  /**
   * 终止会话（kill agent 进程）。
   *
   * @param reason 终止原因（默认 "completed"）
   */
  destroy(reason: "completed" | "error" | "timeout" = "completed"): void {
    this.agent.kill();
    this.status = reason;
    this.logger.info("Session destroyed", {
      session_id: this.session_id,
      reason,
    });
  }

  /**
   * Agent 进程退出回调（崩溃检测）。
   *
   * 触发条件：
   * - 进程正常退出（code=0）且 status 已是 completed → 无操作
   * - 进程崩溃（code≠0）或被信号终止（code=null）→ 发送 error 事件
   *
   * @param code 退出码
   */
  private onAgentExit(code: number | null): void {
    // 如果已经是 completed 状态，说明是正常结束后的退出，忽略
    if (this.status === "completed") return;

    // 进程异常退出
    this.status = "error";
    const errorMsg =
      code === null
        ? "Agent 进程被信号终止"
        : `Agent 进程崩溃（退出码 ${code}）`;

    this.logger.error("Agent process crashed", {
      session_id: this.session_id,
      service_id: this.service_id,
      exit_code: code,
    });

    this.emitWS("error", {
      code: ErrorCode.AGENT_CRASHED,
      message: errorMsg,
      session_id: this.session_id,
    });
  }

  /**
   * 处理 agent NDJSON 事件，映射为 WS 消息。
   *
   * 非 running 状态的 session 不接收事件（防御性检查）。
   * 映射规则见 §3.2.4 事件映射表。
   *
   * @param msg Agent NDJSON 消息
   */
  private onAgentEvent(msg: AgentMessage): void {
    // 非 running 状态丢弃事件（防止 agent 退出前的残留消息）
    if (this.status !== "running") return;

    if (msg.type === "event") {
      this.handleAgentEvent(msg.event, msg.data);
    } else if (msg.type === "response") {
      this.handleAgentResponse(msg.result.result, msg.result.usage);
    } else if (msg.type === "error") {
      this.handleAgentError(msg.error.code, msg.error.message);
    }
  }

  /**
   * 处理 agent 事件消息，映射为 WS 事件。
   *
   * @param event Agent 事件类型
   * @param data Agent 事件数据
   */
  private handleAgentEvent(
    event: string,
    data: Record<string, unknown>
  ): void {
    switch (event) {
      case "generation":
        this.emitWS("chunk", { text: data.text as string });
        break;
      case "tool:start":
        this.emitWS("tool_start", {
          tool: data.tool as string,
          input: data.input as Record<string, unknown>,
        });
        break;
      case "tool:result":
        this.emitWS("tool_result", {
          tool: data.tool as string,
          output: data.output as string,
          success: data.success as boolean,
        });
        break;
      case "session":
        // 累积 usage，不直接转发
        if (data.usage) {
          this.accumulatedUsage = data.usage as UsageData;
        }
        break;
      case "done":
        // agent "done" event（非 response 类型）→ 也映射为 done
        this.emitWS("done", {
          result: (data as Record<string, unknown>).result ?? "done",
          usage: this.accumulatedUsage ?? {},
        });
        this.status = "completed";
        break;
      case "error":
        this.handleAgentError(
          (data.code as string) ?? ErrorCode.AGENT_CRASHED,
          (data.message as string) ?? "Unknown agent error"
        );
        break;
      default:
        this.logger.debug("Unknown agent event", { event, data });
    }
  }

  /**
   * 处理 agent 响应消息（任务完成），发射 done 事件。
   *
   * @param result 任务结果文本
   * @param usage Token 用量数据
   */
  private handleAgentResponse(result: string, usage: UsageData): void {
    this.emitWS("done", {
      result,
      usage: this.accumulatedUsage ?? usage,
    });
    this.status = "completed";
  }

  /**
   * 处理 agent 错误消息，发射 error 事件。
   *
   * @param code agent 错误码
   * @param message agent 错误描述
   */
  private handleAgentError(code: string, message: string): void {
    this.emitWS("error", {
      code:
        code === "PERMISSION_DENIED"
          ? ErrorCode.AGENT_PERMISSION_DENIED
          : code,
      message,
      session_id: this.session_id,
    });
    this.status = "error";
  }

  /**
   * 构造并推送 WS 消息。
   *
   * @param event Gateway WS 事件类型
   * @param payload 事件 payload
   */
  private emitWS(
    event: GatewayEvent,
    payload: Record<string, unknown>
  ): void {
    this.seqId++;
    const msg: WSMessage = {
      type: "event",
      service_id: this.service_id,
      session_id: this.session_id,
      seq: this.seqId,
      event,
      payload: payload as WSMessage["payload"],
    };

    if (this.pushCallback) {
      this.pushCallback(msg);
    } else {
      this.logger.warn("No push callback set, message dropped", {
        event,
        seq: this.seqId,
      });
    }
  }
}
