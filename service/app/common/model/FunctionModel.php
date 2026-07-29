<?php

declare(strict_types=1);

namespace app\common\model;

use Hyperf\Database\Model\Builder;

/**
 * 功能权限模型。
 *
 * @method static Builder enabledByAppType(int $appType) 按应用类型筛选启用功能查询构造器
 * @method static Builder enabledByMenuAppType(string $menuCode, int $appType) 按菜单编码和应用类型筛选启用功能查询构造器
 * @method static Builder enabledByCodesAppType(array<int, string> $functionCodes, int $appType) 按功能编码集合和应用类型筛选启用功能查询构造器
 */
class FunctionModel extends BaseModel
{
    /** @inheritDoc */
    protected ?string $table = 'function';

    /** @inheritDoc */
    protected string $primaryKey = 'fn_id';

    /** @inheritDoc */
    protected string $prefix = 'fn_';

    /** @inheritDoc */
    public bool $timestamps = false;

    /**
     * 按应用类型筛选启用功能。
     *
     * @param Builder $query 查询构造器
     * @param int $appType 应用类型
     * @return Builder 功能查询构造器
     */
    public function scopeEnabledByAppType(Builder $query, int $appType): Builder
    {
        return $query
            ->where('fn_app_type', $appType)
            ->where('fn_state', 1);
    }

    /**
     * 按菜单编码和应用类型筛选启用功能。
     *
     * @param Builder $query 查询构造器
     * @param string $menuCode 菜单编码
     * @param int $appType 应用类型
     * @return Builder 功能查询构造器
     */
    public function scopeEnabledByMenuAppType(Builder $query, string $menuCode, int $appType): Builder
    {
        return $this->scopeEnabledByAppType($query, $appType)
            ->where('fn_menu_code', $menuCode);
    }

    /**
     * 按功能编码集合和应用类型筛选启用功能。
     *
     * @param Builder $query 查询构造器
     * @param array<int, string> $functionCodes 功能编码集合
     * @param int $appType 应用类型
     * @return Builder 功能查询构造器
     */
    public function scopeEnabledByCodesAppType(Builder $query, array $functionCodes, int $appType): Builder
    {
        return $this->scopeEnabledByAppType($query, $appType)
            ->whereIn('fn_code', $functionCodes);
    }
}
