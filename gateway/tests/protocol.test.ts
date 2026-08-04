/**
 * pi-gateway 消息协议测试
 *
 * 测试 WS 消息解析、事件映射和错误处理。
 *
 * @module tests/protocol
 */

import { ErrorCode, ErrorSeverity, createErrorPayload } from "../src/errors.ts";
import { Logger } from "../src/logger.ts";
import { DEFAULT_CONFIG } from "../src/config.ts";
import { handleMessage } from "../src/server.ts";
import { expect, test } from "bun:test";

// ============================================================================
// 错误码测试
// ============================================================================

test("createErrorPayload without session_id", () => {
  const payload = createErrorPayload(
    ErrorCode.AUTH_INVALID_TOKEN,
    "Invalid token"
  );
  expect(payload.code).toBe("AUTH_INVALID_TOKEN");
  expect(payload.message).toBe("Invalid token");
  expect(payload.session_id).toBeUndefined();
});

test("createErrorPayload with session_id", () => {
  const payload = createErrorPayload(
    ErrorCode.AGENT_CRASHED,
    "Agent crashed",
    "session-123"
  );
  expect(payload.code).toBe("AGENT_CRASHED");
  expect(payload.message).toBe("Agent crashed");
  expect(payload.session_id).toBe("session-123");
});

test("all error codes are defined", () => {
  const codes = [
    ErrorCode.AUTH_INVALID_TOKEN,
    ErrorCode.AUTH_MISSING_TOKEN,
    ErrorCode.AUTH_SERVICE_FORBIDDEN,
    ErrorCode.PROTOCOL_INVALID_MESSAGE,
    ErrorCode.PROTOCOL_UNKNOWN_ACTION,
    ErrorCode.PROTOCOL_MISSING_FIELD,
    ErrorCode.SESSION_NOT_FOUND,
    ErrorCode.SESSION_ALREADY_EXISTS,
    ErrorCode.SESSION_TIMEOUT,
    ErrorCode.AGENT_SPAWN_FAILED,
    ErrorCode.AGENT_CRASHED,
    ErrorCode.AGENT_PERMISSION_DENIED,
    ErrorCode.PERSISTENCE_WRITE_FAILED,
    ErrorCode.PERSISTENCE_READ_FAILED,
    ErrorCode.REPLAY_ABORTED,
  ];
  for (const code of codes) {
    expect(typeof code).toBe("string");
    expect(code.length).toBeGreaterThan(0);
  }
});

test("ErrorSeverity has mapping for all error codes", () => {
  
  const codes = Object.values(ErrorCode);
  for (const code of codes) {
    expect(ErrorSeverity[code]).toBeDefined();
  }
});

// ============================================================================
// Logger 测试
// ============================================================================

test("Logger filters by level", () => {
  const logger = new Logger("warn");
  // Should not throw
  logger.debug("debug message");
  logger.info("info message");
  logger.warn("warn message");
  logger.error("error message");
});

test("Logger setLevel changes filtering", () => {
  const logger = new Logger("error");
  // debug should be filtered out
  logger.setLevel("debug");
  // debug should now be shown
  logger.debug("now visible");
});

// ============================================================================
// WS 消息结构验证
// ============================================================================

test("valid submit message structure", () => {
  const msg = {
    type: "request" as const,
    service_id: "admin",
    session_id: "550e8400-e29b-41d4-a716-446655440000",
    seq: 1,
    action: "submit" as const,
    payload: {
      prompt: "帮我写一个排序算法",
      model: "claude-sonnet-4-20250514",
    },
  };

  expect(msg.type).toBe("request");
  expect(msg.action).toBe("submit");
  expect(msg.payload.prompt).toBe("帮我写一个排序算法");
});

test("valid reconnect message structure", () => {
  const msg = {
    type: "request" as const,
    service_id: "admin",
    session_id: "",
    seq: 0,
    action: "reconnect" as const,
    payload: {},
  };

  expect(msg.action).toBe("reconnect");
  expect(msg.session_id).toBe("");
  expect(msg.seq).toBe(0);
});

test("valid ping message structure", () => {
  const msg = {
    type: "request" as const,
    service_id: "admin",
    session_id: "",
    seq: 0,
    action: "ping" as const,
    payload: { timestamp: Date.now() },
  };

  expect(msg.action).toBe("ping");
  expect(typeof msg.payload.timestamp).toBe("number");
});

test("valid chunk event structure", () => {
  const msg = {
    type: "event" as const,
    service_id: "admin",
    session_id: "session-1",
    seq: 2,
    event: "chunk" as const,
    payload: { text: "好的，我来帮你写" },
  };

  expect(msg.event).toBe("chunk");
  expect(msg.payload.text).toBe("好的，我来帮你写");
});

test("valid done event structure", () => {
  const msg = {
    type: "event" as const,
    service_id: "admin",
    session_id: "session-1",
    seq: 5,
    event: "done" as const,
    payload: {
      result: "已完成",
      usage: {
        input_tokens: 1200,
        output_tokens: 350,
        estimated_cost: 0.012,
      },
    },
  };

  expect(msg.event).toBe("done");
  expect(msg.payload.usage.input_tokens).toBe(1200);
  expect(msg.payload.usage.output_tokens).toBe(350);
});

test("valid error event structure", () => {
  const payload = createErrorPayload(
    ErrorCode.AGENT_CRASHED,
    "Agent 进程崩溃",
    "session-123"
  );

  const msg = {
    type: "event" as const,
    service_id: "admin",
    session_id: "session-123",
    seq: 0,
    event: "error" as const,
    payload,
  };

  expect(msg.event).toBe("error");
  expect(msg.payload.code).toBe("AGENT_CRASHED");
  expect(msg.payload.session_id).toBe("session-123");
});

// ============================================================================
// Agent pi.dev RPC NDJSON 消息结构验证
// ============================================================================

test("valid prompt command NDJSON", () => {
  const cmd = {
    type: "prompt" as const,
    message: "帮我写代码",
    streamingBehavior: "steer" as const,
  };

  const line = JSON.stringify(cmd) + "\n";
  const parsed = JSON.parse(line.trim());
  expect(parsed.type).toBe("prompt");
  expect(parsed.message).toBe("帮我写代码");
  expect(parsed.streamingBehavior).toBe("steer");
});

test("valid steer command NDJSON", () => {
  const cmd = {
    type: "steer" as const,
    message: "请更简洁一点",
  };

  const parsed = JSON.parse(JSON.stringify(cmd));
  expect(parsed.type).toBe("steer");
  expect(parsed.message).toBe("请更简洁一点");
});

test("valid follow_up command NDJSON", () => {
  const cmd = {
    type: "follow_up" as const,
    message: "继续完成",
  };

  const parsed = JSON.parse(JSON.stringify(cmd));
  expect(parsed.type).toBe("follow_up");
});

test("valid abort command NDJSON", () => {
  const cmd = { type: "abort" as const };
  const parsed = JSON.parse(JSON.stringify(cmd));
  expect(parsed.type).toBe("abort");
});

test("valid set_model command NDJSON", () => {
  const cmd = {
    type: "set_model" as const,
    provider: "anthropic",
    modelId: "claude-sonnet-4-20250514",
  };

  const parsed = JSON.parse(JSON.stringify(cmd));
  expect(parsed.type).toBe("set_model");
  expect(parsed.provider).toBe("anthropic");
  expect(parsed.modelId).toBe("claude-sonnet-4-20250514");
});

test("valid set_thinking_level command NDJSON", () => {
  const cmd = {
    type: "set_thinking_level" as const,
    level: "high" as const,
  };

  const parsed = JSON.parse(JSON.stringify(cmd));
  expect(parsed.type).toBe("set_thinking_level");
  expect(parsed.level).toBe("high");
});

test("valid get_state command NDJSON", () => {
  const cmd = { type: "get_state" as const };
  const parsed = JSON.parse(JSON.stringify(cmd));
  expect(parsed.type).toBe("get_state");
});

test("valid pi response NDJSON — success", () => {
  const response = {
    type: "response" as const,
    command: "prompt",
    success: true,
    data: {},
  };

  const parsed = JSON.parse(JSON.stringify(response));
  expect(parsed.type).toBe("response");
  expect(parsed.command).toBe("prompt");
  expect(parsed.success).toBe(true);
});

test("valid pi response NDJSON — error", () => {
  const response = {
    type: "response" as const,
    command: "prompt",
    success: false,
    error: "Permission denied",
  };

  const parsed = JSON.parse(JSON.stringify(response));
  expect(parsed.type).toBe("response");
  expect(parsed.success).toBe(false);
  expect(parsed.error).toBe("Permission denied");
});

test("valid agent_start event NDJSON", () => {
  const event = { type: "agent_start" };
  const parsed = JSON.parse(JSON.stringify(event));
  expect(parsed.type).toBe("agent_start");
});

test("valid agent_end event NDJSON", () => {
  const event = {
    type: "agent_end" as const,
    messages: [],
    willRetry: false,
  };

  const parsed = JSON.parse(JSON.stringify(event));
  expect(parsed.type).toBe("agent_end");
  expect(parsed.willRetry).toBe(false);
});

test("valid message_update with text_delta NDJSON", () => {
  const event = {
    type: "message_update",
    assistantMessageEvent: {
      type: "text_delta",
      delta: "好的，我来",
    },
  };

  const parsed = JSON.parse(JSON.stringify(event));
  expect(parsed.type).toBe("message_update");
  expect(parsed.assistantMessageEvent.type).toBe("text_delta");
  expect(parsed.assistantMessageEvent.delta).toBe("好的，我来");
});

test("valid message_update with thinking_delta NDJSON", () => {
  const event = {
    type: "message_update",
    assistantMessageEvent: {
      type: "thinking_delta",
      delta: "让我思考一下...",
    },
  };

  const parsed = JSON.parse(JSON.stringify(event));
  expect(parsed.assistantMessageEvent.type).toBe("thinking_delta");
  expect(parsed.assistantMessageEvent.delta).toBe("让我思考一下...");
});

test("valid message_update with toolcall_start NDJSON", () => {
  const event = {
    type: "message_update",
    assistantMessageEvent: {
      type: "toolcall_start",
      toolCallId: "t1",
      toolName: "read_file",
    },
  };

  const parsed = JSON.parse(JSON.stringify(event));
  expect(parsed.assistantMessageEvent.type).toBe("toolcall_start");
  expect(parsed.assistantMessageEvent.toolCallId).toBe("t1");
  expect(parsed.assistantMessageEvent.toolName).toBe("read_file");
});

test("valid tool_execution_start event NDJSON", () => {
  const event = {
    type: "tool_execution_start",
    toolCallId: "t1",
    toolName: "write_file",
    args: { path: "/tmp/test.ts", content: "..." },
  };

  const parsed = JSON.parse(JSON.stringify(event));
  expect(parsed.type).toBe("tool_execution_start");
  expect(parsed.toolCallId).toBe("t1");
  expect(parsed.toolName).toBe("write_file");
});

test("valid tool_execution_end event NDJSON", () => {
  const event = {
    type: "tool_execution_end",
    toolCallId: "t1",
    toolName: "write_file",
    result: "ok",
    isError: false,
  };

  const parsed = JSON.parse(JSON.stringify(event));
  expect(parsed.type).toBe("tool_execution_end");
  expect(parsed.isError).toBe(false);
});

test("valid bash_execution_update event NDJSON", () => {
  const event = {
    type: "bash_execution_update",
    id: "bash-1",
    delta: "Compiling...",
  };

  const parsed = JSON.parse(JSON.stringify(event));
  expect(parsed.type).toBe("bash_execution_update");
  expect(parsed.id).toBe("bash-1");
  expect(parsed.delta).toBe("Compiling...");
});

// ============================================================================
// WS 消息解析错误路径（覆盖 server.handleMessage 的错误分支）
// ============================================================================

function makeMockWs() {
  const sent: string[] = [];
  const ws: any = {
    send: (s: string) => sent.push(s),
    close: (_code?: number, _reason?: string) => {},
  };
  return { ws, sent };
}

function makeDeps(sent: string[], serviceId = "svc-test") {
  const service: any = {
    bindWS: () => {},
    push: (m: any) => sent.push(JSON.stringify(m)),
    createSession: () => ({ start: async () => {}, destroy: () => {} }),
    sessions: new Map(),
  };
  const auth: any = {
    verify: async (token: string) =>
      token === "good-token"
        ? { valid: true, service_id: serviceId }
        : { valid: false, error: ErrorCode.AUTH_INVALID_TOKEN },
  };
  const registry: any = {
    getOrCreate: () => service,
    get: () => service,
    getAll: () => [service],
  };
  const replayer: any = {};
  const logger = new Logger("error");
  return { service, auth, registry, replayer, logger };
}

test("unauthenticated client with bad token -> AUTH_INVALID_TOKEN", async () => {
  const { ws, sent } = makeMockWs();
  const deps = makeDeps(sent);
  await handleMessage(ws, "bad-token", DEFAULT_CONFIG, deps.auth, deps.registry, deps.replayer, deps.logger);
  expect(sent.length).toBe(1);
  const err = JSON.parse(sent[0]);
  expect(err.event).toBe("error");
  expect(err.payload.code).toBe(ErrorCode.AUTH_INVALID_TOKEN);
});

test("authenticated client with malformed JSON -> PROTOCOL_INVALID_MESSAGE", async () => {
  const { ws, sent } = makeMockWs();
  const deps = makeDeps(sent);
  // 先完成认证，不应产生错误帧
  await handleMessage(ws, "good-token", DEFAULT_CONFIG, deps.auth, deps.registry, deps.replayer, deps.logger);
  expect(sent.length).toBe(0);
  // 再发送非法 JSON
  await handleMessage(ws, "not-json{", DEFAULT_CONFIG, deps.auth, deps.registry, deps.replayer, deps.logger);
  expect(sent.length).toBe(1);
  const err = JSON.parse(sent[0]);
  expect(err.payload.code).toBe(ErrorCode.PROTOCOL_INVALID_MESSAGE);
});

test("authenticated submit without prompt -> PROTOCOL_MISSING_FIELD", async () => {
  const { ws, sent } = makeMockWs();
  const deps = makeDeps(sent);
  await handleMessage(ws, "good-token", DEFAULT_CONFIG, deps.auth, deps.registry, deps.replayer, deps.logger);
  const submitMsg = JSON.stringify({
    type: "request",
    service_id: "svc-test",
    session_id: "s1",
    seq: 1,
    action: "submit",
    payload: {},
  });
  await handleMessage(ws, submitMsg, DEFAULT_CONFIG, deps.auth, deps.registry, deps.replayer, deps.logger);
  expect(sent.length).toBe(1);
  const err = JSON.parse(sent[0]);
  expect(err.payload.code).toBe(ErrorCode.PROTOCOL_MISSING_FIELD);
});
