/**
 * pi-gateway 集成测试 — Mock pi-agent 子进程联调
 *
 * 通过启动 mock-pi-agent.ts 并附加到 AgentProcessImpl，
 * 验证 NDJSON/stdio 通信、事件分发、错误处理和崩溃检测。
 *
 * @module tests/integration
 */

import { expect, test, beforeAll } from "bun:test";
import { AgentProcessImpl } from "../src/agent-process.ts";
import { DEFAULT_CONFIG } from "../src/config.ts";
import { Logger } from "../src/logger.ts";
import type {
  AgentMessage,
  AgentEventMessage,
  AgentResponseMessage,
  AgentErrorMessage,
} from "../src/types.ts";

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
// 测试 1：正常 submit 流程
// ============================================================================

test("正常 submit 流程 — 验证 6 条 NDJSON 消息", async () => {
  const proc = Bun.spawn({
    cmd: ["bun", "run", MOCK_SCRIPT],
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  const agent = new AgentProcessImpl(DEFAULT_CONFIG, makeLogger());
  agent.attachProcess(proc);

  const messages: AgentMessage[] = [];
  agent.onEvent((msg) => messages.push(msg));

  await agent.submit({ prompt: "测试正常流程" }, "req-normal");

  // 等待 response 消息到达（最后一条）
  await waitFor(() => messages.some((m) => m.type === "response"));

  expect(messages.length).toBe(6);

  // 第 1 条：generation
  const m0 = messages[0] as AgentEventMessage;
  expect(m0.type).toBe("event");
  expect(m0.event).toBe("generation");
  expect((m0.data as { text: string }).text).toBe("Mock: 开始处理");

  // 第 2 条：generation
  const m1 = messages[1] as AgentEventMessage;
  expect(m1.type).toBe("event");
  expect(m1.event).toBe("generation");
  expect((m1.data as { text: string }).text).toBe("Mock: 正在分析...");

  // 第 3 条：tool:start
  const m2 = messages[2] as AgentEventMessage;
  expect(m2.type).toBe("event");
  expect(m2.event).toBe("tool:start");
  const toolStartData = m2.data as { tool: string; input: Record<string, unknown> };
  expect(toolStartData.tool).toBe("mock_tool");
  expect(toolStartData.input).toEqual({ arg: "test" });

  // 第 4 条：tool:end
  const m3 = messages[3] as AgentEventMessage;
  expect(m3.type).toBe("event");
  expect(m3.event).toBe("tool:end");
  const toolEndData = m3.data as { tool: string; output: string };
  expect(toolEndData.tool).toBe("mock_tool");
  expect(toolEndData.output).toBe("mock_result");

  // 第 5 条：done
  const m4 = messages[4] as AgentEventMessage;
  expect(m4.type).toBe("event");
  expect(m4.event).toBe("done");
  const doneData = m4.data as { usage: { input_tokens: number; output_tokens: number } };
  expect(doneData.usage.input_tokens).toBe(10);
  expect(doneData.usage.output_tokens).toBe(20);

  // 第 6 条：response
  const m5 = messages[5] as AgentResponseMessage;
  expect(m5.type).toBe("response");
  expect(m5.id).toBe("req-normal");
  expect(m5.result.status).toBe("completed");

  agent.kill();
});

// ============================================================================
// 测试 2：错误处理
// ============================================================================

test("错误处理 — 验证收到 error 事件", async () => {
  const proc = Bun.spawn({
    cmd: ["bun", "run", MOCK_SCRIPT, "error"],
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  const agent = new AgentProcessImpl(DEFAULT_CONFIG, makeLogger());
  agent.attachProcess(proc);

  const messages: AgentMessage[] = [];
  agent.onEvent((msg) => messages.push(msg));

  await agent.submit({ prompt: "测试错误流程" }, "req-error");

  // 等待 error 消息到达
  await waitFor(() => messages.some((m) => m.type === "error"));

  expect(messages.length).toBe(1);

  const errMsg = messages[0] as AgentErrorMessage;
  expect(errMsg.type).toBe("error");
  expect(errMsg.id).toBe("req-error");
  expect(errMsg.error.code).toBe("PERMISSION_DENIED");
  expect(errMsg.error.message).toBe("Mock error: 模拟错误响应");

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
    await agent.submit({ prompt: "测试崩溃" }, "req-crash");
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

test("并发 submit — 两个请求的响应 ID 正确对应", async () => {
  const proc = Bun.spawn({
    cmd: ["bun", "run", MOCK_SCRIPT],
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  const agent = new AgentProcessImpl(DEFAULT_CONFIG, makeLogger());
  agent.attachProcess(proc);

  const allMessages: AgentMessage[] = [];
  agent.onEvent((msg) => allMessages.push(msg));

  // 并发发送两个请求
  await Promise.all([
    agent.submit({ prompt: "并发测试 1" }, "req-concurrent-1"),
    agent.submit({ prompt: "并发测试 2" }, "req-concurrent-2"),
  ]);

  // 等待两个 response 消息
  await waitFor(
    () => allMessages.filter((m) => m.type === "response").length >= 2,
  );

  // 提取 response 消息
  const responses = allMessages.filter(
    (m) => m.type === "response",
  ) as AgentResponseMessage[];

  expect(responses.length).toBe(2);

  // 验证两个 response 的 ID 分别为 req-concurrent-1 和 req-concurrent-2
  const responseIds = responses.map((r) => r.id);
  expect(responseIds).toContain("req-concurrent-1");
  expect(responseIds).toContain("req-concurrent-2");

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
    agent.submit({ prompt: "test" }, "req-after-kill"),
  ).rejects.toThrow("AGENT_CRASHED");
});
