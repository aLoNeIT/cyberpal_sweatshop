<?php

declare(strict_types=1);

return [
    \app\common\contract\SessionLogicContract::class => \app\common\logic\SessionLogic::class,
    \app\common\logic\SessionLogic::class => \app\http\admin\logic\AdminSessionLogic::class,
    \Hyperf\Session\SessionManager::class => \app\common\util\TokenSessionManager::class,
    \Hyperf\HttpServer\Contract\RequestInterface::class => \app\http\common\Request::class,
];
