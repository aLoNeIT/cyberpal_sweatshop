<?php

declare(strict_types=1);

use Hyperf\Session\Handler\FileHandler;

return [
    'handler' => FileHandler::class,
    'options' => [
        'connection' => 'default',
        'path' => BASE_PATH . '/runtime/session',
        'gc_maxlifetime' => 7200,
        'session_name' => 'CYBERPAL_SESSION_ID',
        'domain' => null,
        'cookie_lifetime' => 5 * 60 * 60,
        'cookie_same_site' => 'Lax',
        'expire_on_close' => false,
    ],
];
