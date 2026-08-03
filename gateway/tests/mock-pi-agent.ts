/**
 * Mock pi-agent 脚本
 *
 * 模拟 pi-agent 子进程的 NDJSON/stdio 通信行为，用于集成测试。
 *
 * 使用方式：
 *   bun run tests/mock-pi-agent.ts          # 正常模式
 *   bun run tests/mock-pi-agent.ts error    # 错误模式
 *   bun run tests/mock-pi-agent.ts crash    # 崩溃模式
 *
 * 协议：
 *   - 从 stdin 逐行读取 NDJSON request
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
 * 处理收到的 request，按模式输出响应
 */
async function handleRequest(line: string): Promise<void> {
  // 跳过空行
  if (!line.trim()) return;

  let requestId = "unknown";
  try {
    const request = JSON.parse(line) as {
      type: string;
      id: string;
      method: string;
    };
    requestId = request.id;
  } catch {
    // malformed JSON, ignore
    return;
  }

  if (mode === "error") {
    // 错误模式：直接返回 error 消息
    const errorMsg = JSON.stringify({
      type: "error",
      id: requestId,
      error: {
        code: "PERMISSION_DENIED",
        message: "Mock error: 模拟错误响应",
      },
    });
    await Bun.write(Bun.stdout, errorMsg + "\n");
    return;
  }

  if (mode === "crash") {
    // 崩溃模式：稍等片刻后退出
    await sleep(MOCK_DELAY_MS);
    // 写入一些 stderr 模拟崩溃日志
    await Bun.write(Bun.stderr, "Mock: crash simulation\n");
    process.exit(1);
  }

  // 正常模式：依次输出完整 NDJSON 序列
  await sleep(MOCK_DELAY_MS);

  await Bun.write(
    Bun.stdout,
    JSON.stringify({
      type: "event",
      event: "generation",
      data: { text: "Mock: 开始处理" },
    }) + "\n"
  );

  await sleep(MOCK_DELAY_MS);

  await Bun.write(
    Bun.stdout,
    JSON.stringify({
      type: "event",
      event: "generation",
      data: { text: "Mock: 正在分析..." },
    }) + "\n"
  );

  await sleep(MOCK_DELAY_MS);

  await Bun.write(
    Bun.stdout,
    JSON.stringify({
      type: "event",
      event: "tool:start",
      data: { tool: "mock_tool", input: { arg: "test" } },
    }) + "\n"
  );

  await sleep(MOCK_DELAY_MS);

  await Bun.write(
    Bun.stdout,
    JSON.stringify({
      type: "event",
      event: "tool:end",
      data: { tool: "mock_tool", output: "mock_result" },
    }) + "\n"
  );

  await sleep(MOCK_DELAY_MS);

  await Bun.write(
    Bun.stdout,
    JSON.stringify({
      type: "event",
      event: "done",
      data: { usage: { input_tokens: 10, output_tokens: 20 } },
    }) + "\n"
  );

  await sleep(MOCK_DELAY_MS);

  await Bun.write(
    Bun.stdout,
    JSON.stringify({
      type: "response",
      id: requestId,
      result: { status: "completed" },
    }) + "\n"
  );
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
  await handleRequest(line);
}

// 正常退出
process.exit(0);
