<?php

declare(strict_types=1);

use function Hyperf\Support\env;

/**
 * 系统级开关配置。
 *
 * 控制可运行时关闭的功能开关。
 */
return [
    // 登录是否需要验证码（true=需要验证码，false=可跳过）
    'login_with_check' => (bool) env('SYSTEM_LOGIN_WITH_CHECK', true),
];
