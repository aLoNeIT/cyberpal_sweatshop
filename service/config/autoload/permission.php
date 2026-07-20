<?php

declare(strict_types=1);

/**
 * 权限白名单配置。
 *
 * key 为请求路径模式（支持通配符 *），value 为位标记：
 * - 1 = 跳过登录校验 (SKIP_LOGIN)
 * - 2 = 跳过权限校验 (SKIP_PERMISSION)
 * - 3 = 全部跳过 (SKIP_BOTH)
 */
return [
    'whitelist' => [
        // 公共首页无需登录
        '/home/*' => 3,
        // 登录相关接口跳过登录校验
        '/admin/*/session' => 1,
        '/admin/*/session/*' => 1,
        '/user/*/session' => 1,
        '/user/*/session/*' => 1,
        // 验证码
        '/home/*/captcha' => 3,
        // Pi Agent 聊天端点（兼容旧路由，无需登录）
        '/api/auth/*' => 3,
        '/chat' => 3,
        '/chat/*' => 3,
        // 开放平台始终跳过
        '/open_platform/*' => 3,
    ],
];
