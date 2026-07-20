<?php

declare(strict_types=1);

return [
    'http' => [
        \app\http\middleware\RequestMiddleware::class,
        \app\http\middleware\TokenSessionMiddleware::class,
        \app\http\middleware\PermissionMiddleware::class,
    ],
];
