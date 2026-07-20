<?php

declare(strict_types=1);

namespace app\common\contract;

use app\common\annotation\PermissionAnnotation;
use app\common\constants\CommonConst;
use app\common\util\JsonTable;

/**
 * 会话业务契约
 */
interface SessionLogicContract
{
    /**
     * 获取当前用户ID
     *
     * @return int
     */
    public function getUser(): int;

    /**
     * 获取当前用户应用类型
     *
     * @return int
     */
    public function getUsrAppType(): int;

    /**
     * 判断当前会话是否存在登录用户。
     *
     * @return bool 是否已登录
     */
    public function logined(): bool;

    /**
     * 获取当前会话权限码列表。
     *
     * @return array<int, string> 权限码列表
     */
    public function getFunctionCodes(): array;

    /**
     * 判断当前会话是否拥有指定注解权限。
     *
     * @param PermissionAnnotation $annotation 权限注解
     * @return bool 是否拥有权限
     */
    public function hasPermission(PermissionAnnotation $annotation): bool;

    /**
     * 登录
     *
     * @param string $account 账号
     * @param string $password 密码
     * @param int $appType 应用类型
     * @return JsonTable
     */
    public function login(
        string $account,
        string $password,
        int $appType = CommonConst::APP_TYPE_HOME,
        string $code = ''
    ): JsonTable;

    /**
     * 退出登录
     *
     * @return JsonTable
     */
    public function logout(): JsonTable;
}
