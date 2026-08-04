/**
 * pi-gateway 会话上下文
 *
 * 管理单次任务会话，维护 agent 进程和消息序号，
 * 将 agent pi.dev RPC 事件映射为 WS 事件。
 *
 * 生命周期：
 *   1. 构造 → 2. start() 启动 agent + 发送 prompt 命令
 *   3. agent 产出 → onAgentEvent() → 映射 → push 回调
 *   4. 任务完成/超时/崩溃 → destroy()
 *
 * @module session-context
 */

import type {
  SubmitPayload,
  PiRpcMessage,
  PiRpcResponse,
  PiRpcEvent,
  MessageUpdateEvent,
  ToolExecStartEvent,
  ToolExecUpdateEvent,
  ToolExecEndEvent,
  AgentEndEvent,
  ExtensionErrorEvent,
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
 * - 将 agent pi.dev RPC 事件映射为 WS 消息
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
  private textAccumulator: string = "";
  private thinkingAccumulator: string = "";
  private activeToolCallIds: Set<string> = new Set();

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
   * 启动 agent 进程并提交 prompt 命令。
   *
   * @param payload 提交参数（prompt + model + thinking + provider）
   * @param env 额外环境变量
   */
  async start(
    payload: SubmitPayload,
    env: Record<string, string> = {}
  ): Promise<void> {
    // 注册 agent 事件回调
    this.agent.onEvent((msg) => this.onAgentEvent(msg));

    // 注册 agent 退出回调（崩溃检测）
    this.agent.onExit((code) => this.onAgentExit(code));

    // 启动 agent 进程
    await this.agent.start(env);

    // 如果指定了 model，先发送 set_model 命令
    if (payload.model) {
      // 使用 provider（默认 anthropic）和 model
      await this.agent.setModel(payload.provider ?? "anthropic", payload.model);
    }

    // 如果指定了 thinking，设置 thinking level
    if (payload.thinking) {
      await this.agent.setThinkingLevel(
        payload.thinking as "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max"
      );
    }

    // 发送 prompt 命令
    await this.agent.submit({ type: "prompt", message: payload.prompt });
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
   * 处理 agent PiRpcMessage，分派到 response 或 event 处理。
   *
   * 非 running 状态的 session 不接收事件（防御性检查）。
   *
   * @param msg PiRpcMessage（response 或 event）
   */
  private onAgentEvent(msg: PiRpcMessage): void {
    // 非 running 状态丢弃事件（防止 agent 退出前的残留消息）
    if (this.status !== "running") return;

    if ("command" in msg && msg.type === "response") {
      // PiRpcResponse
      const resp = msg as PiRpcResponse;
      if (!resp.success) {
        this.handleAgentError(resp);
        return;
      }
      this.handleAgentResponse(resp);
    } else {
      // PiRpcEvent
      this.handlePiEvent(msg as PiRpcEvent);
    }
  }

  /**
   * 处理 pi.dev RPC 事件，映射为 WS 消息。
   *
   * @param event PiRpcEvent
   */
  private handlePiEvent(event: PiRpcEvent): void {
    switch (event.type) {
      case "agent_start":
        this.emitWS("thinking", { status: "started" });
        break;

      case "agent_end": {
        const ae = event as AgentEndEvent;
        this.emitWS("done", {
          result: this.textAccumulator,
          usage: this.accumulatedUsage ?? {},
          willRetry: ae.willRetry,
        });
        this.status = "completed";
        break;
      }

      case "agent_settled":
        // 内部标记，无需映射
        break;

      case "turn_start":
        // 内部标记，无需映射
        break;

      case "turn_end":
        // 内部标记，无需映射
        break;

      case "message_start":
        // 初始化 accumulator
        this.textAccumulator = "";
        this.thinkingAccumulator = "";
        break;

      case "message_update":
        this.handleMessageUpdate(event as MessageUpdateEvent);
        break;

      case "message_end":
        // 内部标记，无需映射
        break;

      case "tool_execution_start": {
        const ts = event as ToolExecStartEvent;
        this.activeToolCallIds.add(ts.toolCallId);
        this.emitWS("tool_start", {
          tool: ts.toolName,
          toolCallId: ts.toolCallId,
          input: ts.args,
        });
        break;
      }

      case "tool_execution_update": {
        const tu = event as ToolExecUpdateEvent;
        this.emitWS("tool_progress", {
          tool: tu.toolName,
          toolCallId: tu.toolCallId,
          result: tu.partialResult,
        });
        break;
      }

      case "tool_execution_end": {
        const te = event as ToolExecEndEvent;
        this.activeToolCallIds.delete(te.toolCallId);
        this.emitWS("tool_result", {
          tool: te.toolName,
          toolCallId: te.toolCallId,
          output: typeof te.result === "string" ? te.result : JSON.stringify(te.result),
          success: !te.isError,
        });
        break;
      }

      case "extension_error": {
        const ee = event as ExtensionErrorEvent;
        this.emitWS("error", {
          code: "EXTENSION_ERROR",
          message: ee.error,
        });
        break;
      }

      case "compaction_start": {
        const cs = event as unknown as Record<string, unknown>;
        this.emitWS("compaction_event", { type: "start", reason: cs.reason });
        break;
      }

      case "compaction_end": {
        const ce = event as unknown as Record<string, unknown>;
        this.emitWS("compaction_event", { type: "end", reason: ce.reason });
        break;
      }

      case "auto_retry_start": {
        const ars = event as unknown as Record<string, unknown>;
        this.emitWS("retry_event", {
          type: "start",
          attempt: ars.attempt,
          maxAttempts: ars.maxAttempts,
        });
        break;
      }

      case "auto_retry_end": {
        const are = event as unknown as Record<string, unknown>;
        this.emitWS("retry_event", {
          type: "end",
          attempt: are.attempt,
          maxAttempts: are.maxAttempts,
        });
        break;
      }

      default:
        this.logger.debug("Unknown pi event", { type: event.type });
    }
  }

  /**
   * 处理 message_update 事件中的 assistantMessageEvent。
   *
   * @param event MessageUpdateEvent
   */
  private handleMessageUpdate(event: MessageUpdateEvent): void {
    const ame = event.assistantMessageEvent;

    switch (ame.type) {
      case "text_start":
        // 文本开始，可重置 accumulator
        break;

      case "text_delta":
        if (ame.delta) {
          this.textAccumulator += ame.delta;
          this.emitWS("chunk", { text: ame.delta });
        }
        break;

      case "text_end":
        // 文本结束，content 包含完整文本
        break;

      case "thinking_start":
        break;

      case "thinking_delta":
        if (ame.delta) {
          this.thinkingAccumulator += ame.delta;
          this.emitWS("thinking", { text: ame.delta });
        }
        break;

      case "thinking_end":
        break;

      case "toolcall_start":
        if (ame.toolCallId) {
          this.activeToolCallIds.add(ame.toolCallId);
        }
        break;

      case "toolcall_delta":
        break;

      case "toolcall_end":
        break;

      default:
        this.logger.debug("Unknown assistant message event", { type: ame.type });
    }
  }

  /**
   * 处理 agent 响应消息（任务完成）。
   *
   * @param resp PiRpcResponse
   */
  private handleAgentResponse(resp: PiRpcResponse): void {
    // 对于成功的 response，status 通常由 agent_end 事件设置
    this.logger.debug("Agent response", {
      command: resp.command,
      success: resp.success,
    });
  }

  /**
   * 处理 agent 错误���应。
   *
   * @param resp PiRpcResponse（success=false）
   */
  private handleAgentError(resp: PiRpcResponse): void {
    this.emitWS("error", {
      code: "AGENT_ERROR",
      message: resp.error ?? "Unknown agent error",
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
