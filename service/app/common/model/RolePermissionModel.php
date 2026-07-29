<?php

declare(strict_types=1);

namespace app\common\model;

use Hyperf\Database\Model\Builder;

/**
 * 角色权限模型。
 *
 * @method static Builder byRolesAppType(array<int, int> $roleIds, int $appType) 按角色ID集合和应用类型筛选角色权限查询构造器
 */
class RolePermissionModel extends BaseModel
{
    /** @inheritDoc */
    protected ?string $table = 'role_permission';

    /** @inheritDoc */
    protected string $primaryKey = 'rp_id';

    /** @inheritDoc */
    protected string $prefix = 'rp_';

    /**
     * 按角色ID集合和应用类型筛选角色权限。
     *
     * @param Builder $query 查询构造器
     * @param array<int, int> $roleIds 角色ID集合
     * @param int $appType 应用类型
     * @return Builder 角色权限查询构造器
     */
    public function scopeByRolesAppType(Builder $query, array $roleIds, int $appType): Builder
    {
        return $query
            ->whereIn('rp_role', $roleIds)
            ->where('rp_app_type', $appType);
    }
}
