<?php

declare(strict_types=1);

namespace app\common\logic;

use app\common\traits\InstanceTrait;
use app\common\util\JsonTable;
use Hyperf\Di\Annotation\Inject;

/**
 * 逻辑类基类
 */
class BaseLogic
{
    use InstanceTrait;

    #[Inject]
    protected JsonTable $jsonTable;

    public function __construct()
    {
        $this->initialize();
    }

    protected function initialize(): void {}
}
