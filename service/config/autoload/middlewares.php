<?php

declare(strict_types=1);

return [
    'http' => [
        \app\http\common\middleware\RequestMiddleware::class,
        \app\http\common\middleware\TokenSessionMiddleware::class,
        \app\http\common\middleware\PermissionMiddleware::class,
    ],
];
