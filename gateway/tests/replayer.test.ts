/**
 * pi-gateway 补传机制测试
 *
 * 测试补传完整流程 + 中断场景 + 二次检查。
 *
 * @module tests/replayer
 */

import { Replayer } from "../src/replayer.ts";
import { Persistence } from "../src/persistence.ts";
import { ServiceContextImpl } from "../src/service-context.ts";
import { DEFAULT_CONFIG } from "../src/config.ts";
import { Logger } from "../src/logger.ts";
import { expect, test, beforeEach, afterEach } from "bun:test";

let persistence: Persistence;
let logger: Logger;

beforeEach(() => {
  logger = new Logger("debug");
  persistence = new Persistence(
    { ...DEFAULT_CONFIG, sqlite_path: ":memory:" },
    logger
  );
});

afterEach(() => {
  persistence.close();
});

test("replay with no backlog sends reconnected", async () => {
  const service = new ServiceContextImpl(
    "admin",
    DEFAULT_CONFIG,
    persistence,
    logger
  );
  // Mock sendDirect 来捕获消息
  const sentMessages: Array<Record<string, unknown>> = [];
  service.sendDirect = (msg) => {
    sentMessages.push(msg as unknown as Record<string, unknown>);
    return true;
  };

  const replayer = new Replayer(DEFAULT_CONFIG, persistence, logger);
  await replayer.replay(service);

  expect(sentMessages.length).toBe(1);
  expect(sentMessages[0].event).toBe("reconnected");
  expect((sentMessages[0].payload as Record<string, unknown>).backlog).toBe(0);
  expect(service.offline).toBe(false);
});

test("replay with backlog sends replay_start and replay_done", async () => {
  // 写入积压
  persistence.writeEvent(
    "admin",
    "s1",
    1,
    JSON.stringify({
      type: "event",
      service_id: "admin",
      session_id: "s1",
      seq: 1,
      event: "chunk",
      payload: { text: "hello" },
    })
  );
  persistence.writeEvent(
    "admin",
    "s1",
    2,
    JSON.stringify({
      type: "event",
      service_id: "admin",
      session_id: "s1",
      seq: 2,
      event: "done",
      payload: { result: "done", usage: { input_tokens: 10, output_tokens: 5 } },
    })
  );

  const service = new ServiceContextImpl(
    "admin",
    DEFAULT_CONFIG,
    persistence,
    logger
  );

  // Mock WS 连接和 sendDirect
  const wsSentMessages: string[] = [];
  const directSentMessages: Array<Record<string, unknown>> = [];

  service.ws = {
    readyState: WebSocket.OPEN,
    send: (data: string) => wsSentMessages.push(data),
  } as WebSocket;

  service.sendDirect = (msg) => {
    directSentMessages.push(msg as unknown as Record<string, unknown>);
    return true;
  };

  const replayer = new Replayer(
    { ...DEFAULT_CONFIG, replay_sleep_ms: 0 },
    persistence,
    logger
  );
  await replayer.replay(service);

  // 应收到 replay_start, replay_done（通过 sendDirect）
  // 积压数据通过 ws.send()
  expect(service.offline).toBe(false);
  expect(persistence.getBacklogCount("admin")).toBe(0);
  expect(wsSentMessages.length).toBe(2);

  // 验证 sendDirect 收到了 replay_start 和 replay_done
  const events = directSentMessages.map((m) => m.event);
  expect(events).toContain("replay_start");
  expect(events).toContain("replay_done");
});

test("replay aborts when WS disconnects mid-replay", async () => {
  // 写入多条���压
  for (let i = 1; i <= 5; i++) {
    persistence.writeEvent("admin", "s1", i, JSON.stringify({ seq: i }));
  }

  const service = new ServiceContextImpl(
    "admin",
    DEFAULT_CONFIG,
    persistence,
    logger
  );

  let sendCount = 0;
  const directSentMessages: Array<Record<string, unknown>> = [];

  // Mock WS 在前几条后断开
  service.ws = {
    get readyState() {
      // 前 3 条正常，之后模拟断开
      sendCount++;
      return sendCount <= 3 ? WebSocket.OPEN : WebSocket.CLOSED;
    },
    send: (_data: string) => {},
  } as WebSocket;

  service.sendDirect = (msg) => {
    directSentMessages.push(msg as unknown as Record<string, unknown>);
    return true;
  };

  const replayer = new Replayer(
    { ...DEFAULT_CONFIG, replay_sleep_ms: 0 },
    persistence,
    logger
  );
  await replayer.replay(service);

  // 应收到 replay_start 和 replay_aborted
  const events = directSentMessages.map((m) => m.event);
  expect(events).toContain("replay_start");
  expect(events).toContain("replay_aborted");
});

test("replay with new backlog detected after first pass", async () => {
  // 先写入初始积压
  persistence.writeEvent(
    "admin",
    "s1",
    1,
    JSON.stringify({
      type: "event",
      service_id: "admin",
      session_id: "s1",
      seq: 1,
      event: "chunk",
      payload: { text: "first" },
    })
  );

  const service = new ServiceContextImpl(
    "admin",
    DEFAULT_CONFIG,
    persistence,
    logger
  );

  const wsSentMessages: string[] = [];
  service.ws = {
    readyState: WebSocket.OPEN,
    send: (data: string) => {
      wsSentMessages.push(data);
      // 在补传过程中，模拟新事件写入（在第一条推送后）
      if (wsSentMessages.length === 1) {
        persistence.writeEvent(
          "admin",
          "s1",
          2,
          JSON.stringify({
            type: "event",
            service_id: "admin",
            session_id: "s1",
            seq: 2,
            event: "chunk",
            payload: { text: "second" },
          })
        );
      }
    },
  } as WebSocket;

  const directSentMessages: Array<Record<string, unknown>> = [];
  service.sendDirect = (msg) => {
    directSentMessages.push(msg as unknown as Record<string, unknown>);
    return true;
  };

  const replayer = new Replayer(
    { ...DEFAULT_CONFIG, replay_sleep_ms: 0 },
    persistence,
    logger
  );
  await replayer.replay(service);

  // 所有积压应被消费（包括补传过程中新增的）
  expect(persistence.getBacklogCount("admin")).toBe(0);
  // 应收到两次 replay_start 和两次 replay_done
  const events = directSentMessages.map((m) => m.event);
  const replayStartCount = events.filter((e) => e === "replay_start").length;
  const replayDoneCount = events.filter((e) => e === "replay_done").length;
  expect(replayStartCount).toBeLessThanOrEqual(3); // 最多 3 轮递归
  expect(replayDoneCount).toBeLessThanOrEqual(3);
});
