<?php

declare(strict_types=1);

namespace App\Controller;

use App\Model\Agent;
use App\Model\Event;
use App\Model\Message;
use App\Model\Session;
use App\Service\SessionService;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * 会话管理控制器
 *
 * 对应架构文档 §4.1 的 /api/sessions/* 端点。
 * 提供会话创建、列表、详情、续聊、分叉、归档、删除。
 */
class SessionController extends AbstractController
{
    #[Inject]
    private SessionService $sessionService;

    #[Inject]
    private LoggerInterface $logger;

    /**
     * 会话列表
     *
     * GET /api/sessions?status=active&agent_id=X&page=1&per_page=20
     */
    public function index(RequestInterface $request, ResponseInterface $response)
    {
        $userId  = (int) $request->getAttribute('user_id', 0);
        $page    = max(1, (int) $request->input('page', 1));
        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));

        $query = Session::query()->where('user_id', $userId);

        // 按状态筛选
        $status = $request->input('status');
        if ($status !== null && $status !== '') {
            $query->where('status', $status);
        }

        // 按 agent 筛选
        $agentId = $request->input('agent_id');
        if ($agentId !== null && $agentId !== '') {
            $query->where('agent_id', $agentId);
        }

        $query->orderBy('updated_at', 'desc');

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

        return $this->success($response, [
            'items'    => $items,
            'total'    => $total,
            'page'     => $page,
            'per_page' => $perPage,
        ]);
    }

    /**
     * 创建会话
     *
     * POST /api/sessions
     * Body: { "agent_id": "...", "title": "..." }
     */
    public function store(RequestInterface $request, ResponseInterface $response)
    {
        $userId  = (int) $request->getAttribute('user_id', 0);
        $agentId = trim($request->input('agent_id', ''));

        if ($agentId === '') {
            return $this->error($response, 'agent_id 不能为空', 422);
        }

        // 验证 agent 归属
        $agent = Agent::query()->where('id', $agentId)->where('user_id', $userId)->first();
        if ($agent === null) {
            return $this->error($response, 'Agent 不存在', 404);
        }

        $title   = trim($request->input('title', ''));
        $session = $this->sessionService->createSession($userId, $agentId, $title, 'normal');

        return $this->success($response, [
            'session' => $session->toArray(),
        ], '会话已创建');
    }

    /**
     * 会话详情（含 messages + events）
     *
     * GET /api/sessions/{id}
     */
    public function show(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $session = Session::query()->where('id', $id)->where('user_id', $userId)->first();
        if ($session === null) {
            return $this->error($response, '会话不存在', 404);
        }

        $messages = Message::query()->where('session_id', $id)
            ->orderBy('seq', 'asc')
            ->get();

        $events = Event::query()->where('session_id', $id)
            ->orderBy('seq', 'asc')
            ->get();

        // 加载 agent 名
        $agent = Agent::query()->find($session->agent_id);

        return $this->success($response, [
            'session'  => array_merge($session->toArray(), [
                'agent_name' => $agent->name ?? '',
            ]),
            'messages' => $messages->toArray(),
            'events'   => $events->toArray(),
        ]);
    }

    /**
     * 续聊
     *
     * POST /api/sessions/{id}/resume
     */
    public function resume(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $parent = Session::query()->where('id', $id)->where('user_id', $userId)->first();
        if ($parent === null) {
            return $this->error($response, '会话不存在', 404);
        }

        // 复用父会话的 omp_session_id
        $ompSid = $this->sessionService->resolveOmpSessionId($parent, 'resumed');
        $title  = trim($request->input('title', $parent->title));

        $session = $this->sessionService->createSession(
            $userId,
            $parent->agent_id,
            $title ?: '续聊: ' . mb_substr($parent->title ?? '', 0, 40),
            'resumed',
            $parent->id,
            $ompSid,
        );

        $this->logger->info('[Session] Resumed', [
            'new_session' => $session->id,
            'parent'      => $id,
            'omp_sid'     => $ompSid,
        ]);

        return $this->success($response, [
            'session' => $session->toArray(),
        ], '续聊会话已创建');
    }

    /**
     * 分叉
     *
     * POST /api/sessions/{id}/fork
     */
    public function fork(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $parent = Session::query()->where('id', $id)->where('user_id', $userId)->first();
        if ($parent === null) {
            return $this->error($response, '会话不存在', 404);
        }

        $ompSid = $this->sessionService->resolveOmpSessionId($parent, 'forked');
        $title  = trim($request->input('title', $parent->title));

        $session = $this->sessionService->createSession(
            $userId,
            $parent->agent_id,
            $title ?: '分叉: ' . mb_substr($parent->title ?? '', 0, 40),
            'forked',
            $parent->id,
            $ompSid,
        );

        $this->logger->info('[Session] Forked', [
            'new_session' => $session->id,
            'parent'      => $id,
            'omp_sid'     => $ompSid,
        ]);

        return $this->success($response, [
            'session' => $session->toArray(),
        ], '分叉会话已创建');
    }

    /**
     * 手动归档
     *
     * POST /api/sessions/{id}/archive
     */
    public function archive(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $session = Session::query()->where('id', $id)->where('user_id', $userId)->first();
        if ($session === null) {
            return $this->error($response, '会话不存在', 404);
        }

        if ($session->status !== 'active') {
            return $this->error($response, '只能归档活跃状态的会话', 400);
        }

        $this->sessionService->archiveSession($session);

        return $this->success($response, [
            'session' => $session->toArray(),
        ], '会话已归档');
    }

    /**
     * 软删除
     *
     * DELETE /api/sessions/{id}
     */
    public function destroy(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $session = Session::query()->where('id', $id)->where('user_id', $userId)->first();
        if ($session === null) {
            return $this->error($response, '会话不存在', 404);
        }

        $session->status = 'deleted';
        $session->save();

        $this->logger->info('[Session] Deleted (soft)', ['session_id' => $id]);

        return $this->success($response, null, '会话已删除');
    }

    // ──────────────────────────────────────────────
    //  T11 新增 — 历史 + 详情
    // ──────────────────────────────────────────────

    /**
     * 历史会话列表（已归档 + 已删除）
     *
     * GET /api/sessions/history?status=archived&agent_id=X&keyword=&from=&to=&page=1&per_page=20
     */
    public function history(RequestInterface $request, ResponseInterface $response)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $filters = [
            'agent_id' => $request->input('agent_id'),
            'status'   => $request->input('status'),
            'keyword'  => $request->input('keyword'),
            'from'     => $request->input('from'),
            'to'       => $request->input('to'),
            'page'     => (int) $request->input('page', 1),
            'per_page' => (int) $request->input('per_page', 20),
        ];

        $data = $this->sessionService->getHistory($userId, $filters);

        return $this->success($response, $data);
    }

    /**
     * 会话完整详情（含 messages + events）
     *
     * GET /api/sessions/{id}/detail
     */
    public function detail(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $data = $this->sessionService->getSessionDetail($id, $userId);
        if ($data === null) {
            return $this->error($response, '会话不存在', 404);
        }

        return $this->success($response, $data);
    }

    // ──────────────────────────────────────────────
    //  统一响应
    // ──────────────────────────────────────────────

    private function success(ResponseInterface $response, mixed $data, string $message = 'ok')
    {
        return $response->json([
            'code'    => 0,
            'data'    => $data,
            'message' => $message,
        ]);
    }

    private function error(ResponseInterface $response, string $message, int $code = 400)
    {
        return $response->json([
            'code'    => $code,
            'data'    => null,
            'message' => $message,
        ])->withStatus($code >= 100 && $code < 600 ? $code : 400);
    }
}
