<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\Event;
use App\Model\Message;
use App\Model\Session;
use App\Model\Agent;
use App\Util\Uuid;
use Psr\Log\LoggerInterface;

/**
 * 会话管理服务
 *
 * 负责会话状态机、omp_session_id 映射、归档操作。
 * 对应架构文档 §5.1 主流程中的 Session 管理。
 */
class SessionService
{
    public function __construct(
        private LoggerInterface $logger,
    ) {
    }

    /**
     * 创建新会话
     *
     * @param int         $userId           租户 ID
     * @param string      $agentId          Agent ID
     * @param string      $title            会话标题（前 50 字符，或默认"新会话"）
     * @param string      $mode             normal|resumed|forked
     * @param string|null $parentSessionId  分叉来源（forked 时必填）
     * @param string|null $ompSessionId     指定 OMP session id（续聊/分叉时复用）
     * @return Session
     */
    public function createSession(
        int $userId,
        string $agentId,
        string $title = '',
        string $mode = 'normal',
        ?string $parentSessionId = null,
        ?string $ompSessionId = null,
    ): Session {
        $sessionId = Uuid::v4();

        // title 截取前 50 字符
        $title = mb_substr(trim($title), 0, 50);
        if ($title === '') {
            $title = '新会话';
        }

        $ompSid = $ompSessionId ?? Uuid::v4();

        $session = Session::create([
            'id'                => $sessionId,
            'user_id'           => $userId,
            'agent_id'          => $agentId,
            'title'             => $title,
            'omp_session_id'    => $ompSid,
            'status'            => 'active',
            'mode'              => $mode,
            'parent_session_id' => $parentSessionId,
            'message_count'     => 0,
        ]);

        $this->logger->info('[Session] Created', [
            'session_id' => $sessionId,
            'agent_id'   => $agentId,
            'mode'       => $mode,
        ]);

        return $session;
    }

    /**
     * 解析 OMP 会话 ID
     *
     * 根据会话模式返回应该传给 OMP 的 session identifier：
     * - normal → 自身 omp_session_id（新会话）
     * - resumed → 自身 omp_session_id（复用，OMP --session 找 session 文件）
     * - forked → parent_session 的 omp_session_id（OMP --fork 需要父 session）
     *
     * @param Session $session 当前会话
     * @param string  $mode    当前模式
     * @return string OMP 会话 ID
     */
    public function resolveOmpSessionId(Session $session, string $mode = 'normal'): string
    {
        if ($mode === 'forked' && !empty($session->parent_session_id)) {
            // 分叉：返回父 session 的 omp_session_id
            $parent = Session::query()->find($session->parent_session_id);
            if ($parent !== null && !empty($parent->omp_session_id)) {
                $this->logger->debug('[Session] Forked: using parent omp_session_id', [
                    'session_id'       => $session->id,
                    'parent_session_id'=> $parent->id,
                    'omp_session_id'   => $parent->omp_session_id,
                ]);
                return $parent->omp_session_id;
            }
        }

        // normal / resumed / 找不到父 → 返回自身 omp_session_id
        return $session->omp_session_id ?? '';
    }

    /**
     * 手动归档
     *
     * @param Session $session
     * @return void
     */
    public function archiveSession(Session $session): void
    {
        $session->status = 'archived';
        $session->archived_time = time();
        $session->save();

        $this->logger->info('[Session] Archived', ['session_id' => $session->id]);
    }

    /**
     * 历史会话列表（已归档 + 已删除）
     *
     * 支持按 agent_id / status / 关键词 / 时间范围筛选，分页返回。
     *
     * @param int   $userId   租户 ID
     * @param array $filters  { agent_id, status, keyword, from, to, page, per_page }
     *                        from/to 为 BIGINT 秒级时间戳（与 update_time 同语义）
     * @return array
     */
    public function getHistory(int $userId, array $filters = []): array
    {
        $page    = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));

        // 默认只查 archived + deleted（非 active）
        $status = $filters['status'] ?? '';
        if ($status !== '' && $status !== 'active') {
            $statuses = [$status];
        } else {
            $statuses = ['archived', 'deleted'];
        }

        $query = Session::query()->where('user_id', $userId)
            ->whereIn('status', $statuses);

        // 按 agent 筛选
        if (!empty($filters['agent_id'])) {
            $query->where('agent_id', $filters['agent_id']);
        }

        // 按关键词搜索（title 模糊匹配）
        if (!empty($filters['keyword'])) {
            $query->where('title', 'like', '%' . $filters['keyword'] . '%');
        }

        // 按时间范围筛选（update_time 为 BIGINT 秒级时间戳）
        if (!empty($filters['from'])) {
            $query->where('update_time', '>=', $filters['from']);
        }
        if (!empty($filters['to'])) {
            $query->where('update_time', '<=', $filters['to']);
        }

        $query->orderBy('update_time', 'desc');

        $total    = $query->count();
        $sessions = $query->forPage($page, $perPage)->get();

        // 加载关联 agent 名
        $agentIds = $sessions->pluck('agent_id')->unique()->toArray();
        $agents   = [];
        if (count($agentIds) > 0) {
            $agents = Agent::query()->whereIn('id', $agentIds)
                ->pluck('name', 'id')
                ->toArray();
        }

        $items = $sessions->map(function (Session $s) use ($agents) {
            $arr = $s->toArray();
            $arr['agent_name'] = $agents[$s->agent_id] ?? '';
            return $arr;
        })->toArray();

        return [
            'items'    => $items,
            'total'    => $total,
            'page'     => $page,
            'per_page' => $perPage,
        ];
    }

    /**
     * 会话详情（含完整 messages + events + agent_name）
     *
     * @param string $sessionId 会话 ID
     * @param int    $userId    租户 ID（归属校验）
     * @return array|null       不存在或无权时返回 null
     */
    public function getSessionDetail(string $sessionId, int $userId): ?array
    {
        $session = Session::query()->where('id', $sessionId)
            ->where('user_id', $userId)
            ->first();

        if ($session === null) {
            return null;
        }

        $messages = Message::query()->where('session_id', $sessionId)
            ->orderBy('seq', 'asc')
            ->get();

        $events = Event::query()->where('session_id', $sessionId)
            ->orderBy('seq', 'asc')
            ->get();

        $agent = Agent::query()->find($session->agent_id);

        return [
            'session'  => array_merge($session->toArray(), [
                'agent_name' => $agent->name ?? '',
            ]),
            'messages' => $messages->toArray(),
            'events'   => $events->toArray(),
        ];
    }
}
