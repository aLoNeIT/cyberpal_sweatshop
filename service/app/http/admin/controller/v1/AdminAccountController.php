<?php

declare(strict_types=1);

namespace app\http\admin\controller\v1;

use app\common\annotation\PermissionAnnotation;
use app\common\util\Helper;
use app\common\util\JsonTable;
use app\http\admin\controller\BaseController;
use Hyperf\DbConnection\Db;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;

/**
 * 管理员管理 (MN0501) — 管理 app_type=1 的管理后台账号
 *
 * 依据 07-admin-account-rbac PRD §FR-4：
 *   - 仅超管可 CRUD
 *   - 新建管理员自动写 cs_user(app_type=1) + cs_relation
 *   - 锁死最后一个超管（r_level=0），防误操作
 */
class AdminAccountController extends BaseController
{
    protected int $dictId = 503;

    protected array $filter = [
        'app_type' => ['usr_app_type', '=', 1],
    ];

    protected int $transaction = 22;

    protected array $excludePrefix = ['app_type'];

    // ============================================================
    // 保存管理员 — 自动写 cs_user + cs_relation
    // ============================================================

    protected function beforeSave(array &$data): JsonTable
    {
        $data['app_type'] = 1;

        // 管理员默认使用 md5(md5+salt) 方案
        if (! empty($data['pwd'])) {
            $salt            = Helper::randStr(4);
            $data['salt']    = $salt;
            $data['pwd']     = \md5(\md5($data['pwd']) . $salt);
        }

        return parent::beforeSave($data);
    }

    protected function afterSave(string|int $id, array &$data): JsonTable
    {
        // 自动绑定角色（如果前端传了 role_id）
        $roleId = $data['role_id'] ?? 0;
        if (! empty($roleId)) {
            Db::table('relation')->insert([
                'rel_user'       => $id,
                'rel_role'       => (int) $roleId,
                'rel_app_type'   => 1,
                'rel_role_level' => (int) ($data['role_level'] ?? 1),
            ]);
        }

        return parent::afterSave($id, $data);
    }

    // ============================================================
    // 禁用/启用管理员
    // ============================================================

    #[PermissionAnnotation(code: '050105')]
    public function toggleStatus(string|int $id): JsonTable|PsrResponseInterface
    {
        $raw   = $this->request->post();
        $state = isset($raw['usr_state']) ? (int) $raw['usr_state'] : null;

        if ($state === null || ! \in_array($state, [0, 1], true)) {
            return JsonTable::withError('状态值无效');
        }

        // 锁死最后一个超管检查
        if ($state === 0) {
            $jResult = $this->checkLastSuperAdmin($id);
            if (! $jResult->isSuccess()) {
                return $jResult;
            }
        }

        $dict      = $this->dictLogic->getDict($this->dictId);
        $pk        = $dict->getPrimaryKey();
        $condition = $this->filterCondition($this->filter, [[$pk->fieldname, '=', $id]]);

        return $this->dictLogic->update(
            $this->dictId,
            ['state' => $state],
            $condition,
            $this->request->getAppType()
        );
    }

    // ============================================================
    // 重置管理员密码
    // ============================================================

    #[PermissionAnnotation(code: '050106')]
    public function resetPassword(string|int $id): JsonTable|PsrResponseInterface
    {
        $raw = $this->request->post();
        $newPwd = $raw['password'] ?? '';

        if (\strlen($newPwd) < 8) {
            return JsonTable::withError('密码不能少于 8 位');
        }

        $salt = Helper::randStr(4);

        $dict      = $this->dictLogic->getDict($this->dictId);
        $pk        = $dict->getPrimaryKey();
        $condition = $this->filterCondition($this->filter, [[$pk->fieldname, '=', $id]]);

        return $this->dictLogic->update(
            $this->dictId,
            [
                'pwd'               => \md5(\md5($newPwd) . $salt),
                'salt'              => $salt,
                'must_change_pwd'   => 1,
                'pwd_update_time'   => \time(),
            ],
            $condition,
            $this->request->getAppType()
        );
    }

    // ============================================================
    // 删除 — 锁死最后一个超管
    // ============================================================

    protected function beforeDelete(string|int $id): JsonTable
    {
        return $this->checkLastSuperAdmin($id);
    }

    // ------------------------------------------------------------
    // 内部：锁死最后一个 super admin
    // ------------------------------------------------------------
    private function checkLastSuperAdmin(string|int $id): JsonTable
    {
        // 查询该管理员绑定的是否为 r_level=0 的超管角色
        $superCount = Db::table('relation AS rel')
            ->join('role AS r', 'r.r_id', '=', 'rel.rel_role')
            ->where('rel.rel_user', $id)
            ->where('r.r_level', 0)
            ->where('r.r_app_type', 1)
            ->count();

        if ($superCount === 0) {
            // 不是超管，放行
            return JsonTable::withSuccess();
        }

        // 检查是否只剩下这一个超管
        $totalSuper = Db::table('relation AS rel')
            ->join('role AS r', 'r.r_id', '=', 'rel.rel_role')
            ->where('r.r_level', 0)
            ->where('r.r_app_type', 1)
            ->count();

        if ($totalSuper <= 1) {
            return JsonTable::withError('不能删除/禁用最后一个超级管理员');
        }

        return JsonTable::withSuccess();
    }
}
