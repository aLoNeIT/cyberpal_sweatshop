<?php

declare(strict_types=1);

namespace app\http\user\controller\v1;

use app\http\user\controller\BaseController;
use app\common\util\JsonTable;
use app\common\util\Helper;
use Psr\Http\Message\ResponseInterface;
use Throwable;

class SessionController extends BaseController
{
    /**
     * 用户端登录。
     *
     * POST body: account, password
     *
     * @return JsonTable|ResponseInterface
     */
    public function login(): JsonTable|ResponseInterface
    {
        try {
            $account = (string) $this->request->post('account', '');
            $password = (string) $this->request->post('password', '');

            return $this->sessionLogic->login($account, $password, \app\common\constants\CommonConst::APP_TYPE_USER);
        } catch (Throwable $throwable) {
            return Helper::logListenException(static::class, __FUNCTION__, $throwable);
        }
    }

    /**
     * 用户端登出。
     *
     * @return JsonTable|ResponseInterface
     */
    public function logout(): JsonTable|ResponseInterface
    {
        return $this->sessionLogic->logout();
    }
}
