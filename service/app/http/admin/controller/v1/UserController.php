<?php

declare(strict_types=1);

namespace app\http\admin\controller\v1;

use app\common\annotation\PermissionAnnotation;
use app\common\util\Helper;
use app\common\util\JsonTable;
use app\http\admin\controller\BaseController;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;

/**
 * 用户管理 (MN0101) — 管理 app_type=4 的用户端用户
 *
 * 依据 08-admin-user-management PRD §FR-1~FR-5：
 *   - 超管=全部（含删除用户）
 *   - 运营=列表/详情/禁用启用/重置密码（不可删除）
 *   - 客服=仅查看
 *
 * dict_id=530，通过 filter 限定 usr_app_type=4。
 * 禁用启用/重置密码为自定义 action，不走标准 DictCrudController。
 */
class UserController extends BaseController
{
    protected int $dictId = 503;

    /**
     * 限定操作对象为 app_type=4（用户端用户）。
     */
    protected array $filter = [
        'app_type' => ['usr_app_type', '=', 4],
    ];

    protected int $transaction = 22;

    protected array $excludePrefix = ['app_type'];

    // ============================================================
    // 标准 CRUD：index / save / read / update / delete
    // 继承自 DictCrudController
    // ============================================================

    // ----------------------------
    // 保存时自动写入 usr_app_type=4
    // ----------------------------
    protected function beforeSave(array &$data): JsonTable
    {
        $data['app_type'] = 4;

        return parent::beforeSave($data);
    }

    // ============================================================
    // 自定义：禁用/启用用户状态
    // ============================================================

    /**
     * 切换用户启用/禁用状态（08 FR-3）。
     */
    #[PermissionAnnotation(code: '010105')]
    public function toggleStatus(string|int $id): JsonTable|PsrResponseInterface
    {
        $dict = $this->dictLogic->getDict($this->dictId);
        $pk   = $dict->getPrimaryKey();
        if (\is_null($pk)) {
            return $this->errCodeLogic->getError(41);
        }

        $raw    = $this->request->post();
        $state  = isset($raw['usr_state']) ? (int) $raw['usr_state'] : null;

        if ($state === null || ! \in_array($state, [0, 1], true)) {
            return JsonTable::withError('状态值无效，仅支持 0（禁用）或 1（启用）');
        }

        // 通过 dictLogic->update 走字典规则
        $condition = $this->filterCondition($this->filter, [[$pk->fieldname, '=', $id]]);
        $jResult   = $this->dictLogic->update(
            $this->dictId,
            ['state' => $state],
            $condition,
            $this->request->getAppType()
        );

        if (! $jResult->isSuccess()) {
            return $jResult;
        }

        return JsonTable::withSuccess($state === 1 ? '用户已启用' : '用户已禁用');
    }

    // ============================================================
    // 自定义：重置用户密码
    // ============================================================

    /**
     * 重置用户密码（08 FR-5）。
     *
     * @param string|int $id 用户 ID
     */
    #[PermissionAnnotation(code: '010106')]
    public function resetPassword(string|int $id): JsonTable|PsrResponseInterface
    {
        $raw = $this->request->post();
        $newPassword = $raw['password'] ?? '';

        if (empty($newPassword) || \strlen($newPassword) < 8) {
            return JsonTable::withError('密码不能少于 8 位');
        }

        // 用户端使用 bcrypt
        $hashed = \password_hash($newPassword, \PASSWORD_BCRYPT);

        $dict      = $this->dictLogic->getDict($this->dictId);
        $pk        = $dict->getPrimaryKey();
        $condition = $this->filterCondition($this->filter, [[$pk->fieldname, '=', $id]]);

        // 直接更新 cs_user 的密码与强制改密标记
        $jResult = $this->dictLogic->update(
            $this->dictId,
            [
                'pwd'               => $hashed,
                'must_change_pwd'   => 1,
                'pwd_update_time'   => \time(),
            ],
            $condition,
            $this->request->getAppType()
        );

        if (! $jResult->isSuccess()) {
            return $jResult;
        }

        return JsonTable::withSuccess('密码已重置，用户下次登录需强制改密');
    }

    // ----------------------------
    // 删除前校验：不能删除自己
    // ----------------------------
    protected function beforeDelete(string|int $id): JsonTable
    {
        // admin 端操作者无法删除自己的 admin 账号，但此处操作的是 app_type=4 用户
        return parent::beforeDelete($id);
    }
}
