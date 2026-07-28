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
 * Admin 会话管理 (MN0301) — 跨用户全局会话列表
 *
 * 依据 08-admin-user-management PRD §FR-6~FR-7：
 *   - 超管=全部（含查看会话内容）
 *   - 运营=查看元数据 + 强制结束会话（不可查看内容）
 *   - 客服=仅查看
 *
 * 会话内容查看受独立权限点 FN030106 控制。
 */
class SessionManagementController extends BaseController
{
    protected int $dictId = 0;

    /**
     * 全局会话列表（仅含元数据，不含内容）。
     */
    public function index(): JsonTable|PsrResponseInterface
    {
        try {
            $page  = (int) $this->request->query('p', 1);
            $limit = (int) $this->request->query('num', 20);
            $limit = \min($limit, 100);

            $query = Db::table('sessions AS s')
                ->leftJoin('user AS u', 'u.usr_id', '=', 's.user_id')
                ->leftJoin('agents AS a', 'a.id', '=', 's.agent_id')
                ->select([
                    's.id', 's.title', 's.status', 's.mode', 's.message_count',
                    's.create_time', 's.update_time', 's.archived_time',
                    'a.name AS agent_name',
                    'u.usr_account AS user_account',
                    'u.usr_real_name AS user_name',
                ])
                ->where('s.delete_time', 0);

            if ($kw = $this->request->query('keyword')) {
                $query->where(function ($q) use ($kw) {
                    $q->where('s.title', 'like', "%{$kw}%")
                      ->orWhere('a.name', 'like', "%{$kw}%")
                      ->orWhere('u.usr_account', 'like', "%{$kw}%");
                });
            }
            if ($status = $this->request->query('status')) {
                $query->where('s.status', $status);
            }

            $total = $query->count();
            $list  = $query->orderByDesc('s.create_time')
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
     * 强制结束会话（08 FR-6.2）。
     */
    #[PermissionAnnotation(code: '030105')]
    public function terminate(string $id): JsonTable|PsrResponseInterface
    {
        try {
            $affected = Db::table('sessions')
                ->where('id', $id)
                ->where('delete_time', 0)
                ->update(['status' => 'archived', 'archived_time' => \time(), 'update_time' => \time()]);

            if ($affected === 0) {
                return JsonTable::withError('会话不存在或已删除');
            }

            return JsonTable::withSuccess('会话已强制结束');
        } catch (Throwable $ex) {
            return Helper::logListenException(static::class, __FUNCTION__, $ex);
        }
    }

    /**
     * 查看会话内容 — 独立权限 FN030106，默认不授权任何角色
     */
    #[PermissionAnnotation(code: '030106')]
    public function viewContent(string $id): JsonTable|PsrResponseInterface
    {
        try {
            // 获取会话元数据
            $session = Db::table('sessions')->where('id', $id)->where('delete_time', 0)->first();
            if (empty($session)) {
                return JsonTable::withError('会话不存在');
            }

            // 获取消息列表
            $messages = Db::table('messages')
                ->where('session_id', $id)
                ->where('delete_time', 0)
                ->orderBy('seq')
                ->get(['role', 'content', 'thinking', 'seq', 'create_time'])
                ->toArray();

            return JsonTable::withSuccess('获取成功', [
                'session'  => $session,
                'messages' => $messages,
            ]);
        } catch (Throwable $ex) {
            return Helper::logListenException(static::class, __FUNCTION__, $ex);
        }
    }
}
