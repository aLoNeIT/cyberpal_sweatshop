<?php

declare(strict_types=1);

namespace app\http\admin\controller;

use app\common\util\JsonTable;
use app\http\common\controller\DictCrudController;

class BaseController extends DictCrudController
{

    protected function initialize(): void
    {
        parent::initialize();
    }

    protected function beforeSave(array &$data): JsonTable
    {
        $data = array_merge([
            'create_user' => $this->sessionLogic?->getUser() ?? 0,
        ], $data);

        return parent::beforeSave($data);
    }
}
