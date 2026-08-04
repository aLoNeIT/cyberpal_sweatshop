/**
 * pi-gateway 集成测试 — Mock pi-agent 子进程联调
 *
 * 通过启动 mock-pi-agent.ts 并附加到 AgentProcessImpl，
 * 验证 pi.dev RPC NDJSON/stdio 通信、事件分发、错误处理和崩溃检测。
 *
 * @module tests/integration
 */

import { expect, test, beforeAll } from "bun:test";
import { AgentProcessImpl } from "../src/agent-process.ts";
import { DEFAULT_CONFIG } from "../src/config.ts";
import { Logger } from "../src/logger.ts";
import type { PiRpcMessage, PiRpcResponse, PiRpcEvent } from "../src/types.ts";

// ============================================================================
// 工具函数
// ============================================================================

/** 轮询等待条件满足 */
function waitFor(
  condition: () => boolean,
  timeoutMs = 10000,
  intervalMs = 10,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = setInterval(() => {
      if (condition()) {
        clearInterval(check);
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(check);
        reject(new Error(`Timeout (${timeoutMs}ms) waiting for condition`));
      }
    }, intervalMs);
  });
}

/** 创建 Logger 实例 */
function makeLogger(): Logger {
  return new Logger("error");
}

/** mock-pi-agent 脚本路径 */
const MOCK_SCRIPT = "./tests/mock-pi-agent.ts";

// ============================================================================
// 测试前置
// ============================================================================

beforeAll(() => {
  // 确保 DEFAULT_CONFIG 可用
  expect(DEFAULT_CONFIG.jwt_secret).toBeTruthy();
});

// ============================================================================
// 测试 1：正常 prompt 流程
// ============================================================================

test("正常 prompt 流程 — 验证 pi.dev 协议消息", async () => {
  const proc = Bun.spawn({
    cmd: ["bun", "run", MOCK_SCRIPT],
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  const agent = new AgentProcessImpl(DEFAULT_CONFIG, makeLogger());
  agent.attachProcess(proc);

  const messages: PiRpcMessage[] = [];
  agent.onEvent((msg) => messages.push(msg));

  await agent.submit({ type: "prompt", message: "测试正常流程" });

  // 等待 response 消息到达（最后一条）
  await waitFor(() => messages.some((m) => m.type === "response"));

  // 新协议有 12 条消息
  expect(messages.length).toBe(12);

  // 第 1 条：agent_start
  expect(messages[0].type).toBe("agent_start");

  // 第 2 条：message_start
  expect(messages[1].type).toBe("message_start");

  // 第 3 条：message_update (text_start)
  expect(messages[2].type).toBe("message_update");
  const mu0 = messages[2] as PiRpcEvent;
  expect((mu0 as Record<string, unknown>).assistantMessageEvent).toBeDefined();

  // 第 4 条：message_update (text_delta: "Mock: 开始处理")
  expect(messages[3].type).toBe("message_update");

  // 第 5 条：message_update (text_delta: "Mock: 正在分析...")
  expect(messages[4].type).toBe("message_update");

  // 第 6 条：message_update (text_end)
  expect(messages[5].type).toBe("message_update");

  // 第 7 条：message_end
  expect(messages[6].type).toBe("message_end");

  // 第 8 条：tool_execution_start
  expect(messages[7].type).toBe("tool_execution_start");
  const ts = messages[7] as PiRpcEvent;
  expect((ts as Record<string, unknown>).toolCallId).toBe("t1");
  expect((ts as Record<string, unknown>).toolName).toBe("mock_tool");

  // 第 9 条：tool_execution_end
  expect(messages[8].type).toBe("tool_execution_end");
  const te = messages[8] as PiRpcEvent;
  expect((te as Record<string, unknown>).toolCallId).toBe("t1");
  expect((te as Record<string, unknown>).isError).toBe(false);

  // 第 10 条：agent_end
  expect(messages[9].type).toBe("agent_end");

  // 第 11 条：agent_settled
  expect(messages[10].type).toBe("agent_settled");

  // 第 12 条：response (success)
  expect(messages[11].type).toBe("response");
  const resp = messages[11] as PiRpcResponse;
  expect(resp.command).toBe("prompt");
  expect(resp.success).toBe(true);

  agent.kill();
});

// ============================================================================
// 测试 2：错误处理
// ============================================================================

test("错误处理 — 验证 response.success=false", async () => {
  const proc = Bun.spawn({
    cmd: ["bun", "run", MOCK_SCRIPT, "error"],
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  const agent = new AgentProcessImpl(DEFAULT_CONFIG, makeLogger());
  agent.attachProcess(proc);

  const messages: PiRpcMessage[] = [];
  agent.onEvent((msg) => messages.push(msg));

  await agent.submit({ type: "prompt", message: "测试错误流程" });

  // 等待 response 消息
  await waitFor(() => messages.some((m) => m.type === "response"));

  expect(messages.length).toBe(1);

  const resp = messages[0] as PiRpcResponse;
  expect(resp.type).toBe("response");
  expect(resp.success).toBe(false);
  expect(resp.error).toBe("Mock: permission denied");

  agent.kill();
});

// ============================================================================
// 测试 3：崩溃检测
// ============================================================================

test("崩溃检测 — 验证 onExit 回调，exitCode !== 0", async () => {
  const proc = Bun.spawn({
    cmd: ["bun", "run", MOCK_SCRIPT, "crash"],
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  const agent = new AgentProcessImpl(DEFAULT_CONFIG, makeLogger());
  agent.attachProcess(proc);

  // 注册退出回调
  const exitCodePromise = new Promise<number | null>((resolve) => {
    agent.onExit((code) => resolve(code));
  });

  // 尝试 submit（可能因进程崩溃而失败）
  try {
    await agent.submit({ type: "prompt", message: "测试崩溃" });
  } catch {
    // 预期可能的写入失败
  }

  // 等待退出回调
  const exitCode = await exitCodePromise;
  expect(exitCode).not.toBe(0);

  // 进程不应被标记为主动 kill
  expect(agent.exited).toBe(true);
  expect(agent.alive).toBe(false);
});

// ============================================================================
// 测试 4：并发 submit
// ============================================================================

test("并发 submit — 两个请求的响应正确对应", async () => {
  const proc = Bun.spawn({
    cmd: ["bun", "run", MOCK_SCRIPT],
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  const agent = new AgentProcessImpl(DEFAULT_CONFIG, makeLogger());
  agent.attachProcess(proc);

  const allMessages: PiRpcMessage[] = [];
  agent.onEvent((msg) => allMessages.push(msg));

  // 并发发送两个请求
  await Promise.all([
    agent.submit({ type: "prompt", message: "并发测试 1" }),
    agent.submit({ type: "prompt", message: "并发测试 2" }),
  ]);

  // 等待两个 response 消息
  await waitFor(
    () => allMessages.filter((m) => m.type === "response").length >= 2,
  );

  // 提取 response 消息
  const responses = allMessages.filter(
    (m) => m.type === "response",
  ) as PiRpcResponse[];

  expect(responses.length).toBe(2);

  // 验证两个 response 都 success
  for (const r of responses) {
    expect(r.success).toBe(true);
  }

  agent.kill();
});

// ============================================================================
// 测试 5：destroy 清理
// ============================================================================

test("destroy 清理 — 验证进程被 kill", async () => {
  const proc = Bun.spawn({
    cmd: ["bun", "run", MOCK_SCRIPT],
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  const agent = new AgentProcessImpl(DEFAULT_CONFIG, makeLogger());
  agent.attachProcess(proc);

  // 确保进程已启动
  expect(agent.alive).toBe(true);
  expect(agent.pid).toBeGreaterThan(0);

  // 杀死进程
  agent.kill();

  expect(agent.alive).toBe(false);
  expect(agent.exited).toBe(true);
  expect(agent.pid).toBeNull();

  // 验证底层进程已退出（exitCode 不为 null 即表示已终止）
  const exitCode = await proc.exited;
  expect(exitCode).not.toBeNull();
});

// ============================================================================
// 测试 6：submit 到已退出的进程应报错
// ============================================================================

test("submit 到已退出进程 -> 抛出 AGENT_CRASHED 错误", async () => {
  const proc = Bun.spawn({
    cmd: ["bun", "run", MOCK_SCRIPT],
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  const agent = new AgentProcessImpl(DEFAULT_CONFIG, makeLogger());
  agent.attachProcess(proc);

  // 先杀死进程
  agent.kill();

  // 再尝试 submit 应该抛出
  await expect(
    agent.submit({ type: "prompt", message: "test" }),
  ).rejects.toThrow("AGENT_CRASHED");
});
