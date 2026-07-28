<?php

declare(strict_types=1);

namespace app\http\admin\controller\v1;

use app\common\util\Helper;
use app\common\util\JsonTable;
use app\http\admin\controller\BaseController;
use Hyperf\DbConnection\Db;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;
use Throwable;

/**
 * 审计日志 (MN0504) — cs_user_log 只读查看
 *
 * 依据 07-admin-account-rbac PRD §FR-6：
 *   - 仅超管可读
 *   - 不可篡改、不可删除
 */
class AuditLogController extends BaseController
{
    protected int $dictId = 0;

    /**
     * 审计日志分页列表。
     */
    public function index(): JsonTable|PsrResponseInterface
    {
        try {
            $page  = (int) $this->request->query('p', 1);
            $limit = (int) $this->request->query('num', 20);
            $limit = \min($limit, 100);

            $query = Db::table('user_log AS ul')
                ->leftJoin('user AS u', 'u.usr_id', '=', 'ul.ul_user')
                ->select([
                    'ul.ul_id', 'ul.ul_module', 'ul.ul_controller', 'ul.ul_action',
                    'ul.ul_remark', 'ul.ul_extend', 'ul.ul_ip',
                    'ul.ul_response_elapsed_time', 'ul.ul_create_time',
                    'u.usr_account AS operator_account',
                    'u.usr_real_name AS operator_name',
                ])
                ->where('ul.ul_app_type', 1)
                ->where('ul.ul_delete_time', 0);

            // 按操作人 / 模块筛选
            if ($kw = $this->request->query('keyword')) {
                $query->where(function ($q) use ($kw) {
                    $q->where('u.usr_account', 'like', "%{$kw}%")
                      ->orWhere('ul.ul_module', 'like', "%{$kw}%")
                      ->orWhere('ul.ul_remark', 'like', "%{$kw}%");
                });
            }
            if ($module = $this->request->query('module')) {
                $query->where('ul.ul_module', $module);
            }

            $total = $query->count();
            $list  = $query->orderByDesc('ul.ul_create_time')
                           ->offset(($page - 1) * $limit)
                           ->limit($limit)
                           ->get()
                           ->toArray();

            return JsonTable::withSuccess(['total' => $total, 'page' => $page, 'num' => $limit], $list);
        } catch (Throwable $ex) {
            return Helper::logListenException(static::class, __FUNCTION__, $ex);
        }
    }
}
