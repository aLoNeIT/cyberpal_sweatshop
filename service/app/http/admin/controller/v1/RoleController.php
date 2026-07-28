<?php

declare(strict_types=1);

namespace app\http\admin\controller\v1;

use app\common\annotation\PermissionAnnotation;
use app\common\util\JsonTable;
use app\http\admin\controller\BaseController;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;

/**
 * 角色管理 (MN0502) — 对应 dict_id=502
 *
 * 依据 07-admin-account-rbac PRD §FR-3：
 *   - 超管可 CRUD + 权限配置
 *   - 运营/客服不可操作（前端隐藏 + 后端 403 由 PermissionMiddleware 兜底）
 *
 * 禁止操作：不允许删除 r_systemed=1 的系统角色。
 */
class RoleController extends BaseController
{
    /**
     * 角色管理字典 ID（cs_role 表）。
     */
    protected int $dictId = 502;

    /**
     * 仅管理 app_type=1（管理后台）的角色，过滤掉其他端角色数据。
     */
    protected array $filter = [
        'app_type' => ['r_app_type', '=', 1],
    ];

    /**
     * 事务开关：仅 save(2) + update(4) + delete(16) 启用事务（index=1 只读不开启）。
     */
    protected int $transaction = 22;

    protected function initialize(): void
    {
        parent::initialize();
        $this->excludePrefix = ['app_type'];
    }

    // ============================================================
    // 标准 CRUD 继承自 DictCrudController：
    //   index (list)   — Annotation '01'
    //   save   (add)   — Annotation '02'
    //   update (edit)  — Annotation '03'
    //   delete (del)   — Annotation '04'
    //   read   (detail)— Annotation '05'
    // ============================================================

    // ----------------------------
    // 钩子：保存前注入 app_type
    // ----------------------------
    protected function beforeSave(array &$data): JsonTable
    {
        $data['app_type'] = 1;

        return parent::beforeSave($data);
    }

    // ----------------------------
    // 钩子：删除前拦截系统角色
    // ----------------------------
    protected function beforeDelete(string|int $id): JsonTable
    {
        $dict = $this->dictLogic->getDict($this->dictId);
        $pk   = $dict->getPrimaryKey();
        if (\is_null($pk)) {
            return $this->errCodeLogic->getError(41);
        }

        // 查询目标角色的 systemed 标记
        $jResult = $this->dictLogic->find(
            $this->dictId,
            $this->filterCondition($this->filter, [[$pk->fieldname, '=', $id]]),
            null,
            $this->request->getAppType()
        );
        if (! $jResult->isSuccess()) {
            return $jResult;
        }

        $row = $jResult->data;
        if (! empty($row['r_systemed']) && (int) $row['r_systemed'] === 1) {
            return JsonTable::withError('不能删除系统角色');
        }

        return parent::beforeDelete($id);
    }

    // ============================================================
    // 自定义：权限配置 — 获取/设置某角色的功能授权
    // ============================================================

    /**
     * 获取指定角色已授权的功能编码列表。
     */
    #[PermissionAnnotation(code: '050204')]
    public function getPermission(string|int $id): JsonTable|PsrResponseInterface
    {
        $codes = $this->dictLogic->getRolePermissions((int) $id, 1);

        return JsonTable::withSuccessByData($codes);
    }

    /**
     * 设置指定角色的功能授权（全量替换）。
     */
    #[PermissionAnnotation(code: '050204')]
    public function savePermission(string|int $id): JsonTable|PsrResponseInterface
    {
        $raw  = $this->request->post();
        $codes = $raw['codes'] ?? [];

        if (! \is_array($codes)) {
            return $this->errCodeLogic->getError(20);
        }

        $this->dictLogic->setRolePermissions((int) $id, $codes, 1);

        return JsonTable::withSuccess('权限配置已更新');
    }
}
