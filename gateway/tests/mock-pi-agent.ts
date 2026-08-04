/**
 * Mock pi-agent 脚本
 *
 * 模拟 pi-agent 子进程的 pi.dev RPC NDJSON/stdio 通信行为，用于集成测试。
 *
 * 使用方式：
 *   bun run tests/mock-pi-agent.ts          # 正常模式
 *   bun run tests/mock-pi-agent.ts error    # 错误模式
 *   bun run tests/mock-pi-agent.ts crash    # 崩溃模式
 *
 * 协议：
 *   - 从 stdin 逐行读取 NDJSON 命令
 *   - 将 NDJSON 消息写入 stdout
 *   - 错误日志写入 stderr
 *
 * @module tests/mock-pi-agent
 */

import { createInterface } from "readline";

const mode = (Bun.argv[2] ?? "normal") as "normal" | "error" | "crash";

/** 模拟延迟（毫秒），让测试能捕获到所有事件 */
const MOCK_DELAY_MS = 10;

/**
 * 处理收到的命令，按模式输出响应
 */
async function handleCommand(line: string): Promise<void> {
  // 跳过空行
  if (!line.trim()) return;

  let commandType = "prompt";
  try {
    const cmd = JSON.parse(line) as { type: string };
    commandType = cmd.type;
  } catch {
    // malformed JSON, ignore
    return;
  }

  if (mode === "error") {
    // 错误模式：直接返回 error response
    const errorMsg = JSON.stringify({
      type: "response",
      command: commandType,
      success: false,
      error: "Mock: permission denied",
    });
    await Bun.write(Bun.stdout, errorMsg + "\n");
    return;
  }

  if (mode === "crash") {
    // 崩溃模式：稍等片刻后退出
    await sleep(MOCK_DELAY_MS);
    // 写入一些 stderr 模拟崩溃日志
    await Bun.write(Bun.stderr, "Mock: agent crashed\n");
    process.exit(1);
  }

  // 正常模式：输出 pi.dev 真实协议序列
  await sleep(MOCK_DELAY_MS);

  // agent_start
  await Bun.write(Bun.stdout, JSON.stringify({ type: "agent_start" }) + "\n");

  await sleep(MOCK_DELAY_MS);

  // message_start
  await Bun.write(Bun.stdout, JSON.stringify({
    type: "message_start",
    message: { role: "assistant", content: [] },
  }) + "\n");

  await sleep(MOCK_DELAY_MS);

  // message_update: text_start
  await Bun.write(Bun.stdout, JSON.stringify({
    type: "message_update",
    assistantMessageEvent: { type: "text_start", contentIndex: 0 },
  }) + "\n");

  await sleep(MOCK_DELAY_MS);

  // message_update: text_delta 1
  await Bun.write(Bun.stdout, JSON.stringify({
    type: "message_update",
    assistantMessageEvent: { type: "text_delta", delta: "Mock: 开始处理" },
  }) + "\n");

  await sleep(MOCK_DELAY_MS);

  // message_update: text_delta 2
  await Bun.write(Bun.stdout, JSON.stringify({
    type: "message_update",
    assistantMessageEvent: { type: "text_delta", delta: "Mock: 正在分析..." },
  }) + "\n");

  await sleep(MOCK_DELAY_MS);

  // message_update: text_end
  await Bun.write(Bun.stdout, JSON.stringify({
    type: "message_update",
    assistantMessageEvent: {
      type: "text_end",
      contentIndex: 0,
      content: "Mock: 开始处理Mock: 正在分析...",
    },
  }) + "\n");

  await sleep(MOCK_DELAY_MS);

  // message_end
  await Bun.write(Bun.stdout, JSON.stringify({
    type: "message_end",
    message: {
      role: "assistant",
      content: [{ type: "text", text: "Mock: 开始处理Mock: 正在分析..." }],
    },
  }) + "\n");

  await sleep(MOCK_DELAY_MS);

  // tool_execution_start
  await Bun.write(Bun.stdout, JSON.stringify({
    type: "tool_execution_start",
    toolCallId: "t1",
    toolName: "mock_tool",
    args: { arg: "test" },
  }) + "\n");

  await sleep(MOCK_DELAY_MS);

  // tool_execution_end
  await Bun.write(Bun.stdout, JSON.stringify({
    type: "tool_execution_end",
    toolCallId: "t1",
    toolName: "mock_tool",
    result: { content: "mock_result" },
    isError: false,
  }) + "\n");

  await sleep(MOCK_DELAY_MS);

  // agent_end
  await Bun.write(Bun.stdout, JSON.stringify({
    type: "agent_end",
    messages: [],
    willRetry: false,
  }) + "\n");

  await sleep(MOCK_DELAY_MS);

  // agent_settled
  await Bun.write(Bun.stdout, JSON.stringify({ type: "agent_settled" }) + "\n");

  await sleep(MOCK_DELAY_MS);

  // response
  await Bun.write(Bun.stdout, JSON.stringify({
    type: "response",
    command: commandType,
    success: true,
    data: {},
  }) + "\n");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// 主循环：读取 stdin 的 NDJSON 行
// ============================================================================

const rl = createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

// 逐行处理
for await (const line of rl) {
  await handleCommand(line);
}

// 正常退出
process.exit(0);
