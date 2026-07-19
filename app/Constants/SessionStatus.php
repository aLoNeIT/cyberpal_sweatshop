<?php

declare(strict_types=1);

namespace App\Constants;

/**
 * 会话状态常量
 *
 * 对应架构文档 §3.3 sessions.status 的枚举值。
 */
class SessionStatus
{
    /** 活跃中 */
    public const ACTIVE = 'active';

    /** 已归档 */
    public const ARCHIVED = 'archived';

    /** 已删除（软删除） */
    public const DELETED = 'deleted';

    /**
     * 所有有效状态列表
     *
     * @return string[]
     */
    public static function all(): array
    {
        return [
            self::ACTIVE,
            self::ARCHIVED,
            self::DELETED,
        ];
    }

    /**
     * 是否为有效状态值
     */
    public static function isValid(string $status): bool
    {
        return in_array($status, self::all(), true);
    }
}
