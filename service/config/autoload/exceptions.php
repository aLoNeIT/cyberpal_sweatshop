<?php

declare(strict_types=1);

return [
    'handler' => [
        'http' => [
            Hyperf\HttpServer\Exception\Handler\HttpExceptionHandler::class,
            \app\common\exception\handler\AppExceptionHandler::class,
        ],
    ],
];
