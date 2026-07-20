<?php

declare(strict_types=1);

namespace app\common\logic;

use app\common\annotation\PermissionAnnotation;
use app\common\constants\CommonConst;
use app\common\constants\ErrCodeConst as ErrorCode;
use app\common\contract\SessionLogicContract;
use app\common\util\Helper;
use app\common\util\JsonTable;
use Hyperf\Contract\SessionInterface;
use Hyperf\Di\Annotation\Inject;
use Throwable;
use function Hyperf\Config\config;

/**
 * 通用会话逻辑。
 *
 * 提供基于 Session 的登录态管理、权限校验等基础能力。
 * 各应用端应继承并覆写 buildSessionData、findUserByAccount 等方法来适配自身业务。
 */
class SessionLogic extends BaseLogic implements SessionLogicContract
{
    #[Inject]
    protected SessionInterface $session;

    protected int $appType = CommonConst::APP_TYPE_ADMIN;

    /**
     * 获取当前用户ID。
     *
     * @return int
     */
    public function getUser(): int
    {
        return (int) $this->session->get('usr_id', 0);
    }

    /**
     * 获取当前用户应用类型。
     *
     * @return int
     */
    public function getUsrAppType(): int
    {
        return (int) $this->session->get('usr_app_type', 0);
    }

    /**
     * 判断当前会话是否存在登录用户。
     *
     * @return bool 是否已登录
     */
    public function logined(): bool
    {
        return $this->session->has('usr_id');
    }

    /**
     * 获取当前会话权限码列表。
     *
     * @return array<int, string> 清洗后的权限码列表
     */
    public function getFunctionCodes(): array
    {
        return $this->normalizeFunctionCodes($this->session->get('usr_function', []));
    }

    /**
     * 判断当前会话是否拥有指定注解权限。
     *
     * @param PermissionAnnotation $annotation 权限注解
     * @return bool 是否拥有权限
     */
    public function hasPermission(PermissionAnnotation $annotation): bool
    {
        $functions = $this->getFunctionCodes();

        $matches = array_values(array_filter(
            $annotation->code,
            static fn(string $code): bool => in_array($code, $functions, true)
        ));

        return $annotation->operation === PermissionAnnotation::OPERATION_AND
            ? count($matches) === count($annotation->code)
            : $matches !== [];
    }

    /**
     * 登录。
     *
     * @param string $account 账号
     * @param string $password 密码
     * @param int $appType 应用类型
     * @param string $code 验证码
     * @return JsonTable
     */
    public function login(
        string $account,
        string $password,
        int $appType = CommonConst::APP_TYPE_HOME,
        string $code = ''
    ): JsonTable
    {
        if ($account === '' || $password === '') {
            return ErrCodeLogic::instance()->getError(ErrorCode::PARAM_ERROR, ['param' => 'account or password']);
        }

        try {
            $user = $this->findUserByAccount($account, $appType);
            if (\is_null($user)) {
                return ErrCodeLogic::instance()->getError(25, ['name' => '账号不存在']);
            }

            return $this->doLogin($user, $appType);
        } catch (Throwable $throwable) {
            return Helper::logListenException(static::class, __FUNCTION__, $throwable);
        }
    }

    /**
     * 执行登录流程：构建会话数据并创建新会话。
     *
     * @param array<string, mixed> $user 用户数据
     * @param int $appType 应用类型
     * @return JsonTable
     */
    protected function doLogin(array $user, int $appType): JsonTable
    {
        $data = $this->buildSessionData($user, $appType);
        $session = $this->create($data, $appType);
        if (! $session->isSuccess()) {
            return $session;
        }

        return JsonTable::withSuccess('success', array_merge(
            ['user' => $this->formatLoginUser($data)],
            is_array($session->data) ? $session->data : []
        ));
    }

    /**
     * 注销当前登录。
     *
     * @return JsonTable
     */
    public function logout(): JsonTable
    {
        $this->session->invalidate();

        return JsonTable::withSuccess();
    }

    /**
     * 创建新的会话令牌信息。
     *
     * @param array $data 附加会话数据
     * @param int $appType 应用类型
     * @return JsonTable
     */
    public function create(array $data = [], int $appType = 0): JsonTable
    {
        $sessionId = $this->session->getId();
        $refreshToken = Helper::randStr(32, 7);
        $expireIn = (int) config('session.options.gc_maxlifetime', 7200);
        $refreshExpireIn = $expireIn - 200;

        $this->session->start();
        $sessionId = $this->session->getId();

        $sessionData = array_merge($data, [
            'app_type' => $appType,
            'client_ip' => $data['client_ip'] ?? '127.0.0.1',
            'refresh_token' => $refreshToken,
            'create_time' => time(),
            'expire_in' => $expireIn,
            'refresh_expire_in' => $refreshExpireIn
        ]);
        $this->session->replace($sessionData);

        return JsonTable::withSuccessByData([
            'token' => $sessionId,
            'refresh_token' => $refreshToken,
            'expire_in' => $expireIn,
            'refresh_expire_in' => $refreshExpireIn,
        ]);
    }

    /**
     * 构造登录成功后的会话基础数据。
     *
     * 子类应覆写此方法来适配各端的用户字段映射。
     *
     * @param array<string, mixed> $user 用户数据
     * @param int $appType 应用类型
     * @return array<string, mixed>
     */
    protected function buildSessionData(array $user, int $appType): array
    {
        return [
            'usr_id' => (int) ($user['id'] ?? 0),
            'usr_app_type' => $appType,
            'usr_account' => (string) ($user['account'] ?? ''),
            'usr_real_name' => (string) ($user['real_name'] ?? ''),
            'usr_function' => $user['functions'] ?? [],
        ];
    }

    /**
     * 查询指定应用端账号对应的用户数据。
     *
     * 子类必须覆写此方法，对接自身的用户查询逻辑。
     *
     * @param string $account 账号
     * @param int $appType 应用类型
     * @return array<string, mixed>|null 用户数据
     */
    protected function findUserByAccount(string $account, int $appType): ?array
    {
        return null;
    }

    /**
     * 格式化登录响应中的用户信息。
     *
     * @param array<string, mixed> $data 登录会话数据
     * @return array<string, mixed> 用户信息
     */
    protected function formatLoginUser(array $data): array
    {
        return [
            'id' => (int) ($data['usr_id'] ?? 0),
            'app_type' => (int) ($data['usr_app_type'] ?? 0),
            'account' => (string) ($data['usr_account'] ?? ''),
            'real_name' => (string) ($data['usr_real_name'] ?? ''),
        ];
    }

    /**
     * 清洗功能权限编码集合。
     *
     * @param mixed $functions 原始权限编码集合
     * @return array<int, string> 清洗后的权限编码集合
     */
    protected function normalizeFunctionCodes(mixed $functions): array
    {
        if (! is_array($functions)) {
            return [];
        }

        return array_values(array_unique(array_filter(array_map(
            static fn(mixed $item): string => trim((string) $item),
            $functions
        ), static fn(string $item): bool => $item !== '')));
    }
}
