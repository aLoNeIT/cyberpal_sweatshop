<?php

declare(strict_types=1);

namespace app\common\model;

use Hyperf\Database\Model\Builder;

/**
 * 用户角色关联模型。
 *
 * @method static Builder byUserAppType(int $userId, int $appType) 按用户和应用类型筛选关联查询构造器
 */
class RelationModel extends BaseModel
{
    /** @inheritDoc */
    protected ?string $table = 'relation';

    /** @inheritDoc */
    protected string $primaryKey = 'rel_id';

    /** @inheritDoc */
    protected string $prefix = 'rel_';

    /** @inheritDoc */
    public bool $timestamps = false;

    /**
     * 按用户和应用类型筛选角色关联。
     *
     * @param Builder $query 查询构造器
     * @param int $userId 用户ID
     * @param int $appType 应用类型
     * @return Builder 角色关联查询构造器
     */
    public function scopeByUserAppType(Builder $query, int $userId, int $appType): Builder
    {
        return $query
            ->where('rel_user', $userId)
            ->where('rel_app_type', $appType);
    }
}
