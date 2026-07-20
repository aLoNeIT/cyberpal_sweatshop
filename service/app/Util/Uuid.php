<?php

declare(strict_types=1);

namespace App\Util;

/**
 * UUID 生成工具
 *
 * 提供 v4 UUID 生成，避免引入 ramsey/uuid 额外依赖。
 */
class Uuid
{
    /**
     * 生成 v4 UUID
     */
    public static function v4(): string
    {
        $data = random_bytes(16);

        // 设置版本位 (version 4)
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        // 设置变体位 (variant 1)
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
