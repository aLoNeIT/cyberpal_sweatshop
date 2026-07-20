<?php

declare(strict_types=1);

namespace app\http\admin\controller\v1;

use app\http\admin\controller\BaseController;
use app\common\util\JsonTable;
use app\common\util\Helper;
use Psr\Http\Message\ResponseInterface;
use Throwable;

class SessionController extends BaseController
{
    /**
     * 管理后台登录。
     *
     * POST body: account, password, code(验证码-可选)
     *
     * @return JsonTable|ResponseInterface
     */
    public function login(): JsonTable|ResponseInterface
    {
        try {
            $account = (string) $this->request->post('account', '');
            $password = (string) $this->request->post('password', '');
            $code = (string) $this->request->post('code', '');

            return $this->sessionLogic->login($account, $password, \app\common\constants\CommonConst::APP_TYPE_ADMIN, $code);
        } catch (Throwable $throwable) {
            return Helper::logListenException(static::class, __FUNCTION__, $throwable);
        }
    }

    /**
     * 管理后台登出。
     *
     * @return JsonTable|ResponseInterface
     */
    public function logout(): JsonTable|ResponseInterface
    {
        return $this->sessionLogic->logout();
    }

    /**
     * 获取当前登录用户信息。
     *
     * @return JsonTable|ResponseInterface
     */
    public function profile(): JsonTable|ResponseInterface
    {
        $userId = $this->sessionLogic->getUser();
        if ($userId <= 0) {
            return $this->errCodeLogic->getError(80);
        }

        return JsonTable::withSuccess('success', [
            'user_id' => $userId,
            'app_type' => $this->sessionLogic->getUsrAppType(),
        ]);
    }
}
