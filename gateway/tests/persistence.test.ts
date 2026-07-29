/**
 * pi-gateway 持久化层单元测试
 *
 * 测试 SQLite 写入/查询/标记/清理/服务隔离。
 *
 * @module tests/persistence
 */

import { Persistence } from "../src/persistence.ts";
import { DEFAULT_CONFIG } from "../src/config.ts";
import { Logger } from "../src/logger.ts";
import { expect, test, beforeEach, afterEach } from "bun:test";

let persistence: Persistence;

beforeEach(() => {
  persistence = new Persistence(
    { ...DEFAULT_CONFIG, sqlite_path: ":memory:" },
    new Logger("debug")
  );
});

afterEach(() => {
  persistence.close();
});

test("writeEvent and getBacklog", () => {
  persistence.writeEvent("admin", "session-1", 1, '{"test":1}');
  persistence.writeEvent("admin", "session-1", 2, '{"test":2}');

  const backlog = persistence.getBacklog("admin");
  expect(backlog.length).toBe(2);
  expect(backlog[0].seq).toBe(1);
  expect(backlog[0].consumed).toBe(0);
  expect(backlog[1].seq).toBe(2);
  expect(backlog[1].consumed).toBe(0);
});

test("markConsumed removes from backlog", () => {
  const id = persistence.writeEvent("admin", "session-1", 1, '{"test":1}');
  persistence.markConsumed(id);

  const backlog = persistence.getBacklog("admin");
  expect(backlog.length).toBe(0);
});

test("markConsumedBatch removes multiple from backlog", () => {
  const id1 = persistence.writeEvent("admin", "s1", 1, "{}");
  const id2 = persistence.writeEvent("admin", "s1", 2, "{}");
  const id3 = persistence.writeEvent("admin", "s2", 1, "{}");

  persistence.markConsumedBatch([id1, id2, id3]);
  const backlog = persistence.getBacklog("admin");
  expect(backlog.length).toBe(0);
});

test("getBacklogCount", () => {
  persistence.writeEvent("admin", "s1", 1, "{}");
  persistence.writeEvent("admin", "s2", 1, "{}");
  persistence.writeEvent("user", "s3", 1, "{}");

  expect(persistence.getBacklogCount("admin")).toBe(2);
  expect(persistence.getBacklogCount("user")).toBe(1);
  expect(persistence.getBacklogCount("nonexistent")).toBe(0);
});

test("cleanup removes old consumed records", () => {
  const id = persistence.writeEvent("admin", "s1", 1, "{}");
  persistence.markConsumed(id);

  // cleanup with 0 retention → 清理所有已消费记录
  const deleted = persistence.cleanup(0);
  expect(deleted).toBe(1);
});

test("cleanup does not remove unconsumed records", () => {
  persistence.writeEvent("admin", "s1", 1, "{}");
  persistence.writeEvent("admin", "s1", 2, "{}");

  const id = persistence.writeEvent("admin", "s2", 1, "{}");
  persistence.markConsumed(id);

  // cleanup 只删已消费的
  const deleted = persistence.cleanup(0);
  expect(deleted).toBe(1);

  // 未消费的还在
  expect(persistence.getBacklogCount("admin")).toBe(2);
});

test("service isolation", () => {
  persistence.writeEvent("admin", "s1", 1, "{}");
  persistence.writeEvent("user", "s2", 1, "{}");

  expect(persistence.getBacklog("admin").length).toBe(1);
  expect(persistence.getBacklog("user").length).toBe(1);

  // admin 的数据不影响 user
  expect(persistence.getBacklog("admin")[0].service_id).toBe("admin");
  expect(persistence.getBacklog("user")[0].service_id).toBe("user");
});

test("backlog ordering by session_id then seq", () => {
  persistence.writeEvent("admin", "b", 2, "{}");
  persistence.writeEvent("admin", "a", 2, "{}");
  persistence.writeEvent("admin", "a", 1, "{}");
  persistence.writeEvent("admin", "b", 1, "{}");

  const backlog = persistence.getBacklog("admin");
  expect(backlog.length).toBe(4);
  // 按 session_id ASC, seq ASC
  expect(backlog[0].session_id).toBe("a");
  expect(backlog[0].seq).toBe(1);
  expect(backlog[1].session_id).toBe("a");
  expect(backlog[1].seq).toBe(2);
  expect(backlog[2].session_id).toBe("b");
  expect(backlog[2].seq).toBe(1);
  expect(backlog[3].session_id).toBe("b");
  expect(backlog[3].seq).toBe(2);
});

test("writeEvent returns autoincrement id", () => {
  const id1 = persistence.writeEvent("admin", "s1", 1, "{}");
  const id2 = persistence.writeEvent("admin", "s1", 2, "{}");

  expect(id1).toBeGreaterThan(0);
  expect(id2).toBeGreaterThan(id1);
});
