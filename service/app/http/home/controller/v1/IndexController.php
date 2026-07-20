<?php

declare(strict_types=1);

namespace app\http\home\controller\v1;

use app\http\common\controller\BaseController;
use app\common\util\JsonTable;
use Psr\Http\Message\ResponseInterface;

class IndexController extends BaseController
{
    /**
     * 首页
     *
     * @return JsonTable|ResponseInterface
     */
    public function index(): JsonTable|ResponseInterface
    {
        return JsonTable::withSuccess('cyberpal_sweatshop');
    }
}
