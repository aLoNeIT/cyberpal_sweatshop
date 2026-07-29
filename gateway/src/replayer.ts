/**
 * pi-gateway 断线补传器
 *
 * 服务重连后，从 SQLite 读取积压事件，异步推送给 Hyperf。
 *
 * 流程：
 *   1. 查询积压数量
 *   2. 0 → 发送 reconnected 事件
 *   3. >0 → 发送 replay_start → 逐条推送 → 标记已消费 → 发送 replay_done
 *   4. 补传过程中 WS 再次断开 → 发送 replay_aborted
 *   5. 补传完成后二次检查积压，递归补传（最多 3 轮）
 *
 * @module replayer
 */

import type { WSMessage, GatewayConfig } from "./types.ts";
import { Persistence } from "./persistence.ts";
import { ServiceContextImpl } from "./service-context.ts";
import { Logger } from "./logger.ts";

/**
 * 断线补传器。
 *
 * 服务重连后，检查 SQLite 积压，异步补传。
 */
export class Replayer {
  private persistence: Persistence;
  private config: GatewayConfig;
  private logger: Logger;

  /**
   * 创建补传器。
   *
   * @param config 网关配置
   * @param persistence 持久化层
   * @param logger 日志工具
   */
  constructor(
    config: GatewayConfig,
    persistence: Persistence,
    logger: Logger
  ) {
    this.config = config;
    this.persistence = persistence;
    this.logger = logger;
  }

  /**
   * 执行补传。
   *
   * 异步函数，不阻塞主 Event Loop。
   * 补传完成后递归检查新积��（最多 3 轮）。
   *
   * @param service 要补传的服务上下文
   * @param retries 当前递归轮次（内部使用）
   */
  async replay(service: ServiceContextImpl, retries: number = 0): Promise<void> {
    const backlogCount = this.persistence.getBacklogCount(service.service_id);

    if (backlogCount === 0) {
      // 无积压，直接恢复
      service.sendDirect(
        this.buildWSMessage(service.service_id, "reconnected", { backlog: 0 })
      );
      service.offline = false;
      this.logger.info("Reconnect: no backlog", {
        service_id: service.service_id,
      });
      return;
    }

    // 有积压，启动补传
    const total = Math.min(backlogCount, this.config.replay_max_total);
    service.sendDirect(
      this.buildWSMessage(service.service_id, "replay_start", { total })
    );

    this.logger.info("Replay started", {
      service_id: service.service_id,
      total,
    });

    const records = this.persistence.getBacklog(service.service_id, total);
    let sent = 0;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      // 检查 WS 是否仍可用（使用实时引用，不用缓存）
      if (!service.ws || service.ws.readyState !== WebSocket.OPEN) {
        // 中断补传
        const remaining = records.length - i;
        service.sendDirect(
          this.buildWSMessage(service.service_id, "replay_aborted", {
            sent,
            remaining,
          })
        );
        this.logger.warn("Replay aborted", {
          service_id: service.service_id,
          sent,
          remaining,
        });
        return;
      }

      // 推送积压消息
      try {
        service.ws.send(record.payload);
      } catch (_e) {
        // 发送失败，中断补传
        const remaining = records.length - i;
        service.sendDirect(
          this.buildWSMessage(service.service_id, "replay_aborted", {
            sent,
            remaining,
          })
        );
        this.logger.warn("Replay aborted (send failed)", {
          service_id: service.service_id,
          sent,
          remaining,
        });
        return;
      }

      this.persistence.markConsumed(record.id);
      sent++;

      // 每 batch_size 条 sleep 一下，让出 Event Loop
      if (sent % this.config.replay_batch_size === 0) {
        await Bun.sleep(this.config.replay_sleep_ms);
      }
    }

    // 补传完成，发送 replay_done
    service.sendDirect(
      this.buildWSMessage(service.service_id, "replay_done", { sent })
    );

    this.logger.info("Replay completed", {
      service_id: service.service_id,
      sent,
    });

    // 补传完成后二次检查积压，如有新积压递归补传（最多 3 轮）
    const newBacklog = this.persistence.getBacklogCount(service.service_id);
    if (newBacklog > 0 && retries < 3) {
      this.logger.info("New backlog detected after replay, retrying", {
        service_id: service.service_id,
        new_backlog: newBacklog,
        retries: retries + 1,
      });
      await this.replay(service, retries + 1);
    } else {
      service.offline = false;
      if (newBacklog > 0) {
        this.logger.warn("Replay max retries reached, remaining backlog", {
          service_id: service.service_id,
          remaining: newBacklog,
        });
      }
    }
  }

  /**
   * 构造 WS 控制消息（replay_start / replay_done / replay_aborted / reconnected）。
   *
   * @param serviceId 服务 ID
   * @param event 控制事件类型
   * @param payload 事件 payload
   * @returns 完整的 WS 消息
   */
  private buildWSMessage(
    serviceId: string,
    event: "replay_start" | "replay_done" | "replay_aborted" | "reconnected",
    payload: Record<string, unknown>
  ): WSMessage {
    return {
      type: "event",
      service_id: serviceId,
      session_id: "",
      seq: 0,
      event,
      payload: payload as WSMessage["payload"],
    };
  }
}
