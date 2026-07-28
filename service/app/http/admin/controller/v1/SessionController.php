<?php

declare(strict_types=1);

namespace app\http\admin\controller\v1;

use app\common\constants\CommonConst;
use app\common\util\Helper;
use app\common\util\JsonTable;
use app\http\admin\controller\BaseController;
use app\http\admin\logic\AdminSessionLogic;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;
use Throwable;

/**
 * 管理后台会话控制器。
 *
 * 对齐 hongshan_cloudscript 框架模式：
 *  - POST  /admin/v1/session              → save() 登录
 *  - PUT   /admin/v1/session/{id}         → update() 刷新令牌
 *  - DELETE /admin/v1/session/{id}        → delete() 登出
 *  - GET   /admin/v1/session/profile      → profile() 获取当前用户（保留）
 */
class SessionController extends BaseController
{
    /**
     * 创建管理员会话（登录）。
     *
     * POST body: account, password, code(验证码-可选)
     */
    public function save(): JsonTable|PsrResponseInterface
    {
        try {
            $account  = (string) $this->request->post('account', '');
            $password = (string) $this->request->post('password', '');
            $code     = (string) $this->request->post('code', '');

            return $this->sessionLogic->login(
                $account,
                $password,
                CommonConst::APP_TYPE_ADMIN,
                $code,
            );
        } catch (Throwable $throwable) {
            return Helper::logListenException(static::class, __FUNCTION__, $throwable);
        }
    }

    /**
     * 刷新管理员会话令牌。
     *
     * @param string|int $id 会话 ID
     */
    public function update(string|int $id): JsonTable|PsrResponseInterface
    {
        $refreshToken = (string) $this->request->post('refresh_token', '');

        return $this->sessionLogic->refresh($refreshToken);
    }

    /**
     * 退出管理员会话（登出）。
     *
     * @param string|int $id 会话 ID
     */
    public function delete(string|int $id): JsonTable|PsrResponseInterface
    {
        return $this->sessionLogic->logout();
    }

    /**
     * 获取当前登录用户信息（保留兼容）。
     */
    public function profile(): JsonTable|PsrResponseInterface
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
