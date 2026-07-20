import { BaseLogic } from './base.logic';

export class CacheLogic extends BaseLogic {
  // 清空缓存
  public clear(): void {
    const rember_cache = this.cacheSrv.get('rember_cache', {
      mode: 'none'
    });
    const storage_orgInfo = this.cacheSrv.get('storage_orgInfo', {
      mode: 'none'
    });
    this.cacheSrv.clear();
    // 保留记住密码1天
    if (rember_cache) {
      this.cacheSrv.set('rember_cache', rember_cache, {
        expire: 24 * 60 * 60
      });
    }
    // 保留登录的机构信息
    if (storage_orgInfo) {
      this.cacheSrv.set('storage_orgInfo', storage_orgInfo);
    }
  }
}
