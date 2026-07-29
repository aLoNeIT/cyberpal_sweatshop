<?php

declare(strict_types=1);

namespace app\http\admin\logic;

use app\common\constants\CommonConst;
use app\common\constants\ErrCodeConst as ErrorCode;
use app\common\logic\CacheConstLogic;
use app\common\logic\CaptchaLogic;
use app\common\logic\ErrCodeLogic;
use app\common\logic\SessionLogic;
use app\common\util\Helper;
use app\common\util\JsonTable;
use app\http\user\model\CsUser;
use Throwable;
use function Hyperf\Config\config;

/**
 * 管理后台会话逻辑。
 *
 * 覆写基类的登录流程，增加：
 * - 管理员账号状态校验（usr_state）
 * - 密码验证（md5(md5(password) . salt) 框架盐值方案）
 * - CsUser 模型查询
 */
class AdminSessionLogic extends SessionLogic
{
    /**
     * 管理后台登录。
     *
     * 覆写基类 login()，在 doLogin() 之前插入状态校验和密码验证。
     *
     * @param string $account 账号
     * @param string $password 密码
     * @param int    $appType 应用类型
     * @param string $code    验证码（暂未使用）
     * @return JsonTable
     */
    public function login(
        string $account,
        string $password,
        int $appType = CommonConst::APP_TYPE_ADMIN,
        string $code = ''
    ): JsonTable {
        if ($account === '' || $password === '') {
            return ErrCodeLogic::instance()->getError(
                ErrorCode::PARAM_ERROR,
                ['param' => 'account or password']
            );
        }

        // 验证码校验（与框架 SessionLogic 登录流程保持一致）
        if ((bool) config('system.login_with_check', true)) {
            $captchaKey   = (string) $this->session->get(CacheConstLogic::getLoginCaptchaKey($appType), '');
            $captchaResult = CaptchaLogic::instance()->validate($code, $captchaKey);
            if (! $captchaResult->isSuccess()) {
                return $captchaResult;
            }
        }

        try {
            $user = $this->findUserByAccount($account, $appType);
            if (\is_null($user)) {
                return ErrCodeLogic::instance()->getError(25, ['name' => '账号不存在']);
            }

            // 检查账号状态（0=关闭, 1=开启）
            if ($user['usr_state'] !== 1) {
                return ErrCodeLogic::instance()->getError(25, ['name' => '账号已禁用']);
            }

            // 验证密码（框架盐值方案：md5(md5(password) . salt)）
            if (! $this->verifyPassword($password, $user['usr_pwd'], $user['usr_salt'])) {
                return ErrCodeLogic::instance()->getError(25, ['name' => '密码错误']);
            }

            return $this->doLogin($user, $appType);
        } catch (Throwable $throwable) {
            return Helper::logListenException(static::class, __FUNCTION__, $throwable);
        }
    }

    /**
     * 查询管理后台用户。
     *
     * @param string $account 账号
     * @param int    $appType 应用类型
     * @return array<string, mixed>|null 用户数据，含 usr_pwd、usr_salt、usr_state 等扩展字段
     */
    protected function findUserByAccount(string $account, int $appType): ?array
    {
        $user = CsUser::query()
            ->where('usr_account', $account)
            ->where('usr_app_type', $appType)
            ->first();

        if (! $user) {
            return null;
        }

        return [
            'id'        => (int) $user->usr_id,
            'account'   => (string) $user->usr_account,
            'real_name' => (string) $user->usr_real_name,
            'usr_pwd'   => (string) $user->usr_pwd,
            'usr_salt'  => (string) $user->usr_salt,
            'usr_state' => (int) $user->usr_state,
            'functions' => [],
        ];
    }

    /**
     * 验证管理员密码。
     *
     * 前端已对密码做一次 md5（传输安全），故此处仅需 md5(前端值 . salt)
     * 与数据库存储的 md5(md5(原始密码) . salt) 比对。
     * AdminAccountController 的新建/重置密码 hashPassword() 仍用 md5(md5(plain) . salt)，
     * 因为那�?plaintext 来自 admin 面板直接提交�??
     *
     * @param string $plainPassword 前端 md5 后的密码
     * @param string $storedHash    数据库中的哈希（md5(md5(原始) . salt)�?
     * @param string $salt          �?�?
     * @return bool 是否匹配
     */
    protected function verifyPassword(string $plainPassword, string $storedHash, string $salt): bool
    {
        return md5($plainPassword . $salt) === $storedHash;
    }

    /**
     * 生成管理员密码哈希。
     *
     * @param string $plainPassword 明文密码
     * @param string $salt          盐值
     * @return string 密码哈希
     */
    public function hashPassword(string $plainPassword, string $salt): string
    {
        return md5(md5($plainPassword) . $salt);
    }

    /**
     * 生成随机盐值（长度4，含大小写字母+数字）。
     *
     * @return string 盐值
     */
    public function generateSalt(): string
    {
        return Helper::randStr(4, 7);
    }
}
