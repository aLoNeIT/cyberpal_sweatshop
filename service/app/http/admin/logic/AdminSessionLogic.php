<?php

declare(strict_types=1);

namespace app\http\admin\logic;

use app\common\constants\CommonConst;
use app\common\constants\ErrCodeConst as ErrorCode;
use app\common\logic\CacheConstLogic;
use app\common\logic\CaptchaLogic;
use app\common\logic\ErrCodeLogic;
use app\common\logic\SessionLogic;
use app\common\model\FunctionModel;
use app\common\model\MenuModel;
use app\common\model\RelationModel;
use app\common\model\RolePermissionModel;
use app\common\model\UserPermissionModel;
use app\common\util\Helper;
use app\common\util\JsonTable;
use app\http\user\model\CsUser;
use Throwable;
use function Hyperf\Config\config;

/**
 * 管理后台会话逻辑。
 *
 * 对齐 hongshan_cloudscript 框架模式：
 * - buildSessionData() 在登录时加载权限码 → session 缓存
 * - buildAccountLoginResponse() 构建含 menu/function 的登录响应
 * - 使用 Model 类的 scope 方法查询，不使用 Db::table()
 */
class AdminSessionLogic extends SessionLogic
{
    /**
     * 管理后台登录。
     *
     * @param string $account 账号
     * @param string $password 密码
     * @param int    $appType 应用类型
     * @param string $code    验证码
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

            if ($user['usr_state'] !== 1) {
                return ErrCodeLogic::instance()->getError(25, ['name' => '账号已禁用']);
            }

            if (! $this->verifyPassword($password, $user['usr_pwd'], $user['usr_salt'])) {
                return ErrCodeLogic::instance()->getError(25, ['name' => '密码错误']);
            }

            // 构建会话数据（含权限码）
            $data = $this->buildSessionData($user, $appType);

            // 创建会话（生成 token）
            $session = $this->create($data, $appType);
            if (! $session->isSuccess()) {
                return $session;
            }

            // 对齐 cloudscript：用 buildAccountLoginResponse 组装完整响应
            return JsonTable::withSuccess('success', $this->buildAccountLoginResponse($data, $session));
        } catch (Throwable $throwable) {
            return Helper::logListenException(static::class, __FUNCTION__, $throwable);
        }
    }

    /**
     * 查询管理后台用户。
     *
     * @param string $account 账号
     * @param int    $appType 应用类型
     * @return array<string, mixed>|null
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
        ];
    }

    /**
     * 构建登录会话数据（对齐 cloudscript：登录时解析权限码缓存到 session）。
     *
     * @param array<string, mixed> $user    用户数据
     * @param int                  $appType 应用类型
     * @return array<string, mixed>
     */
    protected function buildSessionData(array $user, int $appType): array
    {
        $data = parent::buildSessionData($user, $appType);

        // 登录时解析权限码并缓存到 session
        $userId = (int) ($user['id'] ?? 0);
        $data['usr_function'] = $this->resolveFunctionCodes($userId, $appType);

        return $data;
    }

    /**
     * 构建登录响应（对齐 cloudscript：含 menu / function 完整数据）。
     *
     * @param array<string, mixed> $data    会话数据
     * @param JsonTable            $session 会话创建结果（含 token 等）
     * @return array<string, mixed>
     */
    protected function buildAccountLoginResponse(array $data, JsonTable $session): array
    {
        $functionCodes = $this->normalizeFunctionCodes($data['usr_function'] ?? []);
        $appType       = (int) ($data['usr_app_type'] ?? CommonConst::APP_TYPE_ADMIN);
        $userId        = (int) ($data['usr_id'] ?? 0);
        $loginData     = $data;

        return array_merge([
            'user'     => $this->formatLoginUser($loginData),
            'menu'     => $this->resolveLoginMenus($functionCodes, $appType),
            'function' => $this->resolveLoginFunctions($functionCodes, $appType),
        ], is_array($session->data) ? $session->data : []);
    }

    // =========================================================================
    // 权限码加载
    // =========================================================================

    /**
     * 加载用户的完整权限码集合（用户直接权限 + 角色继承权限）。
     *
     * @param int $userId  用户 ID
     * @param int $appType 应用类型
     * @return array<int, string>
     */
    protected function resolveFunctionCodes(int $userId, int $appType): array
    {
        try {
            return $this->normalizeFunctionCodes(array_merge(
                $this->resolveUserPermissionCodes($userId, $appType),
                $this->resolveRolePermissionCodes($userId, $appType),
            ));
        } catch (Throwable $e) {
            return [];
        }
    }

    /**
     * 用户直接权限码（cs_user_permission 表）。
     *
     * @param int $userId  用户 ID
     * @param int $appType 应用类型
     * @return array<int, string>
     */
    protected function resolveUserPermissionCodes(int $userId, int $appType): array
    {
        try {
            return UserPermissionModel::byUserAppType($userId, $appType)
                ->pluck('up_function_code')
                ->unique()
                ->values()
                ->all();
        } catch (Throwable $e) {
            return [];
        }
    }

    /**
     * 角色继承权限码（cs_relation → cs_role_permission）。
     *
     * @param int $userId  用户 ID
     * @param int $appType 应用类型
     * @return array<int, string>
     */
    protected function resolveRolePermissionCodes(int $userId, int $appType): array
    {
        try {
            $roleIds = $this->roleIdsByUserAppType($userId, $appType);
            if (empty($roleIds)) {
                return [];
            }

            return RolePermissionModel::byRolesAppType($roleIds, $appType)
                ->pluck('rp_function_code')
                ->unique()
                ->values()
                ->all();
        } catch (Throwable $e) {
            return [];
        }
    }

    /**
     * 获取用户的角色 ID 列表。
     *
     * @param int $userId  用户 ID
     * @param int $appType 应用类型
     * @return array<int, int>
     */
    private function roleIdsByUserAppType(int $userId, int $appType): array
    {
        return RelationModel::byUserAppType($userId, $appType)
            ->pluck('rel_role')
            ->filter(static fn (int $role): bool => $role > 0)
            ->values()
            ->all();
    }

    // =========================================================================
    // 菜单加载
    // =========================================================================

    /**
     * 构建登录响应中的菜单树（对齐 cloudscript）。
     *
     * @param array<int, string> $functionCodes 权限码集合
     * @param int                $appType       应用类型
     * @return array<string, array<string, mixed>>
     */
    protected function resolveLoginMenus(array $functionCodes, int $appType): array
    {
        try {
            // 从权限码提取可见菜单编码（FNxx00 → MNxx）
            $menuCodes = $this->visibleMenuCodes($functionCodes);

            // 查询启用菜单
            $rows = MenuModel::enabledByAppType($appType)
                ->orderBy('mn_sort')
                ->orderBy('mn_id')
                ->get()
                ->toArray();

            // 非超管用户过滤菜单（超管有 FN0099 则全可见）
            if (! $this->hasSuperFunction($functionCodes)) {
                $rows = $this->filterVisibleMenuRows($rows, $menuCodes);
            }

            // 构建菜单树
            return $this->buildMenuTree($rows);
        } catch (Throwable $e) {
            return [];
        }
    }

    /**
     * 判断是否拥有超级权限。
     *
     * @param array<int, string> $functionCodes 权限码集合
     * @return bool
     */
    protected function hasSuperFunction(array $functionCodes): bool
    {
        return in_array(CommonConst::PRIVILEGE_LEVEL_SUPER_FUNCTION, $functionCodes, true);
    }

    /**
     * 从权限码中提取可见菜单编码（FNxx00 → MNxx）。
     *
     * @param array<int, string> $functionCodes 权限码集合
     * @return array<int, string>
     */
    protected function visibleMenuCodes(array $functionCodes): array
    {
        $menuCodes = [];
        foreach ($functionCodes as $functionCode) {
            if (preg_match('/^FN(\d+)00$/', $functionCode, $matches) !== 1) {
                continue;
            }
            $menuCodes[] = 'MN' . $matches[1];
        }
        return array_values(array_unique($menuCodes));
    }

    /**
     * 过滤可见菜单行（含祖先路径保留）。
     *
     * @param array<int, array<string, mixed>> $rows      菜单行集合
     * @param array<int, string>               $menuCodes 可见菜单编码
     * @return array<int, array<string, mixed>>
     */
    protected function filterVisibleMenuRows(array $rows, array $menuCodes): array
    {
        $visibleCodes = array_fill_keys($menuCodes, true);
        foreach ($rows as $row) {
            $row = (array) $row;
            $code = (string) ($row['mn_code'] ?? '');
            if (! isset($visibleCodes[$code])) {
                continue;
            }
            // 保留祖先路径中的所有菜单
            $pathCodes = explode('-', (string) ($row['mn_path'] ?? $code));
            foreach ($pathCodes as $pathCode) {
                if ($pathCode !== '') {
                    $visibleCodes[$pathCode] = true;
                }
            }
        }

        return array_values(array_filter(
            $rows,
            static function ($row) use ($visibleCodes): bool {
                $rowArr = (array) $row;
                $code = (string) ($rowArr['mn_code'] ?? '');
                return isset($visibleCodes[$code]);
            }
        ));
    }

    /**
     * 构建菜单树（对齐 cloudscript）。
     *
     * @param array<int, array<string, mixed>> $rows 菜单行集合
     * @return array<string, array<string, mixed>>
     */
    protected function buildMenuTree(array $rows): array
    {
        $groups = [];
        foreach ($rows as $row) {
            $item = $this->formatMenuRow((array) $row);
            $groups[(string) $item['parent_code']][$item['code']] = $item;
        }

        return $this->buildMenuChildren($groups, '');
    }

    /**
     * 递归构建菜单子节点。
     *
     * @param array<string, array<string, array<string, mixed>>> $groups     按 parent_code 分组的菜单
     * @param string                                             $parentCode 父编码
     * @return array<string, array<string, mixed>>
     */
    private function buildMenuChildren(array $groups, string $parentCode): array
    {
        $children = [];
        foreach ($groups[$parentCode] ?? [] as $code => $item) {
            $grandchildren = $this->buildMenuChildren($groups, $code);
            if ($grandchildren !== []) {
                $item['children'] = $grandchildren;
            }
            $children[$code] = $item;
        }
        return $children;
    }

    /**
     * 格式化菜单行数据。
     *
     * @param array<string, mixed> $row 菜单行
     * @return array<string, mixed>
     */
    protected function formatMenuRow(array $row): array
    {
        return [
            'id'          => (int) ($row['mn_id'] ?? 0),
            'app_type'    => (int) ($row['mn_app_type'] ?? 0),
            'code'        => (string) ($row['mn_code'] ?? ''),
            'parent_code' => (string) ($row['mn_parent_code'] ?? ''),
            'title'       => (string) ($row['mn_title'] ?? ''),
            'path'        => (string) ($row['mn_path'] ?? ''),
            'sort'        => (int) ($row['mn_sort'] ?? 0),
            'level'       => (int) ($row['mn_level'] ?? 0),
            'parented'    => (int) ($row['mn_parented'] ?? 0),
            'state'       => (int) ($row['mn_state'] ?? 0),
            'css'         => (string) ($row['mn_css'] ?? ''),
            'style'       => (int) ($row['mn_style'] ?? 0),
            'icon'        => (string) ($row['mn_icon'] ?? ''),
            'uri'         => (string) ($row['mn_uri'] ?? ''),
        ];
    }

    // =========================================================================
    // 功能权限详情加载
    // =========================================================================

    /**
     * 构建登录响应中的功能权限详情（对齐 cloudscript）。
     *
     * @param array<int, string> $functionCodes 权限码集合
     * @param int                $appType       应用类型
     * @return array<string, array<string, mixed>>
     */
    protected function resolveLoginFunctions(array $functionCodes, int $appType): array
    {
        try {
            if (empty($functionCodes)) {
                return [];
            }

            $rows = FunctionModel::enabledByCodesAppType($functionCodes, $appType)
                ->get()
                ->toArray();

            $functions = [];
            foreach ($rows as $row) {
                $item = $this->formatFunctionRow((array) $row);
                if ($item['code'] !== '') {
                    $functions[$item['code']] = $item;
                }
            }
            return $functions;
        } catch (Throwable $e) {
            return [];
        }
    }

    /**
     * 格式化功能行数据。
     *
     * @param array<string, mixed> $row 功能行
     * @return array<string, mixed>
     */
    protected function formatFunctionRow(array $row): array
    {
        return [
            'id'        => (int) ($row['fn_id'] ?? 0),
            'code'      => (string) ($row['fn_code'] ?? ''),
            'menu_code' => (string) ($row['fn_menu_code'] ?? ''),
            'name'      => (string) ($row['fn_name'] ?? ''),
            'app_type'  => (int) ($row['fn_app_type'] ?? 0),
            'state'     => (int) ($row['fn_state'] ?? 0),
            'style'     => (int) ($row['fn_style'] ?? 0),
            'sort'      => (int) ($row['fn_sort'] ?? 0),
            'css'       => (string) ($row['fn_css'] ?? ''),
            'type'      => (string) ($row['fn_type'] ?? 'default'),
        ];
    }

    // =========================================================================
    // 公开接口（供 SessionController::profile() 等使用）
    // =========================================================================

    /**
     * 获取当前用户的菜单树（供外部调用）。
     *
     * @param int $appType 应用类型
     * @return array<string, array<string, mixed>>
     */
    public function loadMenuTree(int $appType): array
    {
        $functionCodes = $this->getFunctionCodes();
        return $this->resolveLoginMenus($functionCodes, $appType);
    }

    /**
     * 获取当前用户的功能权限集合（供外部调用）。
     *
     * @param int $userId 用户 ID
     * @return array<string, array<string, mixed>>
     */
    public function loadFunctionSet(int $userId): array
    {
        $functionCodes = $this->getFunctionCodes();
        $appType = $this->getUsrAppType();
        return $this->resolveLoginFunctions($functionCodes, $appType);
    }

    // =========================================================================
    // 工具方法
    // =========================================================================

    /**
     * 验证管理员密码。
     *
     * @param string $plainPassword 前端 md5 后的密码
     * @param string $storedHash    数据库哈希（md5(md5(原始) . salt)）
     * @param string $salt          盐值
     * @return bool
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
     * @return string
     */
    public function hashPassword(string $plainPassword, string $salt): string
    {
        return md5(md5($plainPassword) . $salt);
    }

    /**
     * 生成随机盐值（长度4，含大小写字母+数字）。
     *
     * @return string
     */
    public function generateSalt(): string
    {
        return Helper::randStr(4, 7);
    }
}
