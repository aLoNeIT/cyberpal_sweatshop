<?php

declare(strict_types=1);

use function Hyperf\Support\env;

/**
 * Pi Agent / OMP 配置
 *
 * 控制 OMP 二进制路径、session 持久化目录、默认 provider/model、
 * 以及租户隔离所需的运行时根目录。
 */
return [
    // Pi/OMP CLI 可执行文件路径
    'bin' => env('PI_AGENT_BIN', 'pi'),

    // LLM 提供商
    'provider' => env('PI_AGENT_PROVIDER', 'openai'),

    // 默认模型
    'model' => env('PI_AGENT_MODEL', 'gpt-4o'),

    // 会话持久化目录（续聊/分叉映射用）
    'session_dir' => env('PI_AGENT_SESSION_DIR', BASE_PATH . '/runtime/pi-sessions'),

    // 租户运行时根目录
    // 目录结构：runtime/tenants/{tenant_id}/agents/{agent_id}/
    'runtime_root' => env('PI_AGENT_RUNTIME_ROOT', BASE_PATH . '/runtime'),
];
