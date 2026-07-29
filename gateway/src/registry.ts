/**
 * pi-gateway 服务注册表
 *
 * 管理所有 ServiceContext，按 service_id 索引。
 * 是 gateway 的核心数据结构，所有服务操作通过 Registry 进行。
 *
 * @module registry
 */

import type { GatewayConfig } from "./types.ts";
import { ServiceContextImpl } from "./service-context.ts";
import { Persistence } from "./persistence.ts";
import { Logger } from "./logger.ts";

/**
 * 服务注册��。
 *
 * 管理所有 ServiceContext，按 service_id 索引。
 * 是 gateway 的核心数据结构，所有服务操作通过 Registry 进行。
 */
export class ServiceRegistry {
  private services: Map<string, ServiceContextImpl> = new Map();
  private persistence: Persistence;
  private config: GatewayConfig;
  private logger: Logger;

  /**
   * 创建服务注册表。
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
   * 注册服务（如果不存在则创建）。
   * 幂等操作，重复调用安全。
   *
   * @param serviceId 服务 ID
   * @returns 服务上下文
   */
  getOrCreate(serviceId: string): ServiceContextImpl {
    let svc = this.services.get(serviceId);
    if (!svc) {
      svc = new ServiceContextImpl(
        serviceId,
        this.config,
        this.persistence,
        this.logger
      );
      this.services.set(serviceId, svc);
      this.logger.info("Service registered", { service_id: serviceId });
    }
    return svc;
  }

  /**
   * 获取服务。
   *
   * @param serviceId 服务 ID
   * @returns 服务上下文或 undefined
   */
  get(serviceId: string): ServiceContextImpl | undefined {
    return this.services.get(serviceId);
  }

  /**
   * 获取所有已注册服务。
   *
   * @returns 所有服务上下文数组
   */
  getAll(): ServiceContextImpl[] {
    return Array.from(this.services.values());
  }

  /**
   * 移除服务（清理所有会话）。
   *
   * @param serviceId 服务 ID
   */
  remove(serviceId: string): void {
    const svc = this.services.get(serviceId);
    if (svc) {
      // 终止所有会话
      for (const session of svc.sessions.values()) {
        session.destroy();
      }
      this.services.delete(serviceId);
      this.logger.info("Service removed", { service_id: serviceId });
    }
  }
}
