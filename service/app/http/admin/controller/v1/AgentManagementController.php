<?php

declare(strict_types=1);

namespace app\http\admin\controller\v1;

use app\common\annotation\PermissionAnnotation;
use app\common\util\Helper;
use app\common\util\JsonTable;
use app\http\admin\controller\BaseController;
use Hyperf\DbConnection\Db;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;
use Throwable;

/**
 * Admin Agent 管理 (MN0201) — 跨用户全局 Agent 列表
 *
 * 依据 08-admin-user-management PRD §FR-6：
 *   - 超管/运营可查看 + 停止 Agent
 *   - 客服仅查看
 */
class AgentManagementController extends BaseController
{
    protected int $dictId = 0;

    /**
     * 全局 Agent 列表（分页）。
     */
    public function index(): JsonTable|PsrResponseInterface
    {
        try {
            $page  = (int) $this->request->query('p', 1);
            $limit = (int) $this->request->query('num', 20);
            $limit = \min($limit, 100);

            $query = Db::table('agents AS a')
                ->leftJoin('user AS u', 'u.usr_id', '=', 'a.user_id')
                ->select([
                    'a.id', 'a.name', 'a.provider', 'a.model', 'a.status',
                    'a.create_time', 'a.update_time',
                    'u.usr_account AS user_account',
                    'u.usr_real_name AS user_name',
                ])
                ->where('a.delete_time', 0);

            // 可选筛选
            if ($kw = $this->request->query('keyword')) {
                $query->where(function ($q) use ($kw) {
                    $q->where('a.name', 'like', "%{$kw}%")
                      ->orWhere('u.usr_account', 'like', "%{$kw}%");
                });
            }
            if ($status = $this->request->query('status')) {
                $query->where('a.status', $status);
            }

            $total = $query->count();
            $list  = $query->orderByDesc('a.create_time')
                           ->offset(($page - 1) * $limit)
                           ->limit($limit)
                           ->get()
                           ->toArray();

            return JsonTable::withSuccess(['total' => $total, 'page' => $page, 'num' => $limit], $list);
        } catch (Throwable $ex) {
            return Helper::logListenException(static::class, __FUNCTION__, $ex);
        }
    }

    /**
     * 停止指定 Agent（08 FR-6.2）。
     */
    #[PermissionAnnotation(code: '020105')]
    public function stop(string $id): JsonTable|PsrResponseInterface
    {
        try {
            $affected = Db::table('agents')
                ->where('id', $id)
                ->where('delete_time', 0)
                ->update(['status' => 'offline', 'update_time' => \time()]);

            if ($affected === 0) {
                return JsonTable::withError('Agent 不存在或已删除');
            }

            return JsonTable::withSuccess('Agent 已停止');
        } catch (Throwable $ex) {
            return Helper::logListenException(static::class, __FUNCTION__, $ex);
        }
    }
}
