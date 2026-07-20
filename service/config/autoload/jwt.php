<?php

declare(strict_types=1);

use function Hyperf\Support\env;

/**
 * JWT 鉴权配置
 *
 * 使用 firebase/php-jwt 库，HS256 算法签发无状态 token。
 */
return [
    // JWT 签名密钥（生产环境务必通过环境变量注入）
    'secret' => env('JWT_SECRET', 'pi-agent-jwt-secret-change-me-in-production'),

    // Token 有效期（秒），默认 7 天
    'ttl' => (int) env('JWT_TTL', 604800),

    // 签名算法
    'algorithm' => 'HS256',

    // 签发者
    'issuer' => env('JWT_ISSUER', 'pi-agent'),
];
