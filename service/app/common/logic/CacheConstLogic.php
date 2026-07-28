<?php

declare(strict_types=1);

namespace app\common\logic;

use app\common\constants\CommonConst;

/**
 * 缓存 Key 常量逻辑 — 统一生成缓存 key。
 *
 * 对应 hongshan_cloudscript 框架同名类，当前仅实现验证码 key 方法，
 * 后续按需补充更多缓存 key 生成方法。
 */
class CacheConstLogic
{
    /**
     * 获取登录验证码的 Session 缓存键名。
     *
     * @param int $appType 应用类型
     * @return string
     */
    public static function getLoginCaptchaKey(int $appType): string
    {
        return CommonConst::KEY_CAPTCHA_LOGIN . $appType;
    }
}
