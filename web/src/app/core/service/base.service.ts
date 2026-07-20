import { Injectable, Injector } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { CacheService } from '@delon/cache';
/**
 * 服务基类
 */
@Injectable()
export class BaseService {
  /**
   * 构造函数
   *
   * @param injector 注入器
   */
  constructor(protected injector: Injector) {
    this.initialize();
  }
  /**
   * 缓存服务
   */
  protected get cacheSrv(): CacheService {
    return this.injector.get(CacheService);
  }
  /**
   * token服务
   */
  protected get tokenSrv(): ITokenService {
    return this.injector.get<ITokenService>(DA_SERVICE_TOKEN);
  }

  /**
   * 初始化方法
   */
  protected initialize(): void {}
}
