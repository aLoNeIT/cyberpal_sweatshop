<?php

declare(strict_types=1);

namespace app\common\model;

use Hyperf\Database\Model\Builder;

/**
 * 菜单模型。
 *
 * @method static Builder enabledByAppType(int $appType) 按应用类型筛选启用菜单查询构造器
 * @method static Builder enabledByCodesAppType(array<int, string> $menuCodes, int $appType) 按菜单编码集合和应用类型筛选启用菜单查询构造器
 */
class MenuModel extends BaseModel
{
    /** @inheritDoc */
    protected ?string $table = 'menu';

    /** @inheritDoc */
    protected string $primaryKey = 'mn_id';

    /** @inheritDoc */
    protected string $prefix = 'mn_';

    /** @inheritDoc */
    public bool $timestamps = false;

    /**
     * 按应用类型筛选启用菜单。
     *
     * @param Builder $query 查询构造器
     * @param int $appType 应用类型
     * @return Builder 菜单查询构造器
     */
    public function scopeEnabledByAppType(Builder $query, int $appType): Builder
    {
        return $query
            ->where('mn_app_type', $appType)
            ->where('mn_state', 1);
    }

    /**
     * 按菜单编码集合和应用类型筛选启用菜单。
     *
     * @param Builder $query 查询构造器
     * @param array<int, string> $menuCodes 菜单编码集合
     * @param int $appType 应用类型
     * @return Builder 菜单查询构造器
     */
    public function scopeEnabledByCodesAppType(Builder $query, array $menuCodes, int $appType): Builder
    {
        return $this->scopeEnabledByAppType($query, $appType)
            ->whereIn('mn_code', $menuCodes);
    }
}
