<?php

declare(strict_types=1);

namespace app\common\traits;

use function Hyperf\Support\make;

/**
 * 基于容器实例化
 */
trait InstanceTrait
{
    /**
     * 获取实例
     *
     * @param bool $newInstance 是否创建新实例
     * @param array $args 构造函数参数
     * @return static 实例对象
     */
    public static function instance(bool $newInstance = false, array $args = [])
    {
        return $newInstance
            ? new static(...array_values($args))
            : make(static::class, $args);
    }
}
