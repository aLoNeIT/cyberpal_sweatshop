<?php

declare(strict_types=1);

namespace app\common\model;

use Hyperf\Database\Model\Builder;

/**
 * 用户权限模型。
 *
 * @method static Builder byUserAppType(int $userId, int $appType) 按用户和应用类型筛选用户权限查询构造器
 */
class UserPermissionModel extends BaseModel
{
    /** @inheritDoc */
    protected ?string $table = 'user_permission';

    /** @inheritDoc */
    protected string $primaryKey = 'up_id';

    /** @inheritDoc */
    protected string $prefix = 'up_';

    /**
     * 按用户和应用类型筛选用户权限。
     *
     * @param Builder $query 查询构造器
     * @param int $userId 用户ID
     * @param int $appType 应用类型
     * @return Builder 用户权限查询构造器
     */
    public function scopeByUserAppType(Builder $query, int $userId, int $appType): Builder
    {
        return $query
            ->where('up_user', $userId)
            ->where('up_app_type', $appType);
    }
}
