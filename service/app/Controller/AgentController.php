<?php

declare(strict_types=1);

namespace App\Controller;

use App\Model\Agent;
use App\Model\AgentSkill;
use App\Model\SkillLibrary;
use App\Model\McpConfig;
use App\Service\McpConfigGenerator;
use App\Util\Uuid;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * Agent 管理控制器
 *
 * 对应架构文档 §4.1 的 /api/agents/* 端点。
 * 提供 Agent CRUD、skill 挂载、MCP 配置入口。
 */
class AgentController extends AbstractController
{
    #[Inject]
    private McpConfigGenerator $mcpConfigGenerator;

    #[Inject]
    private LoggerInterface $logger;

    // ──────────────────────────────────────────────
    //  Agent CRUD
    // ──────────────────────────────────────────────

    /**
     * Agent 列表
     *
     * GET /api/agents?page=1&per_page=20
     */
    public function index(RequestInterface $request, ResponseInterface $response)
    {
        $userId  = (int) $request->getAttribute('user_id', 0);
        $page    = max(1, (int) $request->input('page', 1));
        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));

        $query = Agent::query()->where('user_id', $userId)->orderBy('update_time', 'desc');

        $total   = $query->count();
        $agents  = $query->forPage($page, $perPage)->get();

        return $this->success($response, [
            'items'    => $agents->toArray(),
            'total'    => $total,
            'page'     => $page,
            'per_page' => $perPage,
        ]);
    }

    /**
     * 创建 Agent
     *
     * POST /api/agents
     */
    public function store(RequestInterface $request, ResponseInterface $response)
    {
        $userId = (int) $request->getAttribute('user_id', 0);
        $name   = trim($request->input('name', ''));

        if ($name === '') {
            return $this->error($response, 'Agent 名称不能为空', 422);
        }
        if (mb_strlen($name) > 128) {
            return $this->error($response, 'Agent 名称不能超过 128 个字符', 422);
        }

        // 检查同用户下名称唯一
        $existing = Agent::query()->where('user_id', $userId)->where('name', $name)->first();
        if ($existing !== null) {
            return $this->error($response, '同名 Agent 已存在', 409);
        }

        $uuid    = Uuid::v4();
        $profile = 'tenant_' . $userId;

        $agent = Agent::create([
            'id'                   => $uuid,
            'user_id'              => $userId,
            'name'                 => $name,
            'description'          => trim($request->input('description', '')),
            'system_prompt'        => $request->input('system_prompt', ''),
            'append_system_prompt' => $request->input('append_system_prompt', ''),
            'provider'             => $request->input('provider', 'openai'),
            'model'                => $request->input('model', 'gpt-4o'),
            'thinking'             => $request->input('thinking', 'medium'),
            'tools_whitelist'      => $request->input('tools_whitelist'),
            'tools_blacklist'      => $request->input('tools_blacklist'),
            'profile_name'         => $profile,
            'status'               => 'offline',
        ]);

        // 挂载 skill
        $skillIds = $request->input('skill_ids', []);
        if (is_array($skillIds) && count($skillIds) > 0) {
            $this->syncSkills($agent->id, $skillIds);
        }

        // 创建 MCP 条目
        $mcpItems = $request->input('mcp', []);
        if (is_array($mcpItems) && count($mcpItems) > 0) {
            foreach ($mcpItems as $item) {
                if (!is_array($item) || empty($item['name'])) {
                    continue;
                }
                McpConfig::create([
                    'id'           => Uuid::v4(),
                    'agent_id'     => $agent->id,
                    'name'         => $item['name'],
                    'transport'    => $item['transport'] ?? 'stdio',
                    'command'      => $item['command'] ?? null,
                    'args_json'    => $item['args_json'] ?? null,
                    'url'          => $item['url'] ?? null,
                    'env_json'     => $item['env_json'] ?? null,
                    'headers_json' => $item['headers_json'] ?? null,
                    'enabled'      => $item['enabled'] ?? 1,
                ]);
            }
        }

        // 初始化目录结构 + 生成 mcp.json
        $this->mcpConfigGenerator->ensureDirectories($agent);
        $this->mcpConfigGenerator->rebuild($agent);

        $this->logger->info('[Agent] Created', ['agent_id' => $agent->id, 'user_id' => $userId]);

        return $this->success($response, [
            'agent' => $this->formatAgent($agent),
        ], 'Agent 创建成功');
    }

    /**
     * Agent 详情（含关联 skills 和 mcp_config）
     *
     * GET /api/agents/{id}
     */
    public function show(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $agent = Agent::query()->where('id', $id)->where('user_id', $userId)->first();
        if ($agent === null) {
            return $this->error($response, 'Agent 不存在', 404);
        }

        return $this->success($response, [
            'agent' => $this->formatAgent($agent),
        ]);
    }

    /**
     * 编辑 Agent
     *
     * PUT /api/agents/{id}
     */
    public function update(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $agent = Agent::query()->where('id', $id)->where('user_id', $userId)->first();
        if ($agent === null) {
            return $this->error($response, 'Agent 不存在', 404);
        }

        $name = trim($request->input('name', $agent->name));
        if ($name === '') {
            return $this->error($response, 'Agent 名称不能为空', 422);
        }

        // 名称唯一性检查（排除自身）
        $dup = Agent::query()->where('user_id', $userId)
            ->where('name', $name)
            ->where('id', '!=', $id)
            ->first();
        if ($dup !== null) {
            return $this->error($response, '同名 Agent 已存在', 409);
        }

        $fields = [
            'name', 'description', 'system_prompt', 'append_system_prompt',
            'provider', 'model', 'thinking', 'tools_whitelist', 'tools_blacklist',
        ];
        foreach ($fields as $field) {
            if ($request->has($field)) {
                $agent->{$field} = $request->input($field);
            }
        }
        $agent->save();

        $this->logger->info('[Agent] Updated', ['agent_id' => $agent->id]);

        // 配置变更 → 标记活跃 session 失效（T07 感知）
        $this->markAgentSessionsStale($agent->id);

        return $this->success($response, [
            'agent' => $this->formatAgent($agent),
        ], 'Agent 已更新');
    }

    /**
     * 删除 Agent
     *
     * DELETE /api/agents/{id}
     */
    public function destroy(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $agent = Agent::query()->where('id', $id)->where('user_id', $userId)->first();
        if ($agent === null) {
            return $this->error($response, 'Agent 不存在', 404);
        }

        // 级联删除关联数据
        AgentSkill::query()->where('agent_id', $id)->delete();
        McpConfig::query()->where('agent_id', $id)->delete();

        // 清理 runtime 目录
        $agentDir = BASE_PATH . '/runtime/tenants/' . $userId . '/agents/' . $id;
        if (is_dir($agentDir)) {
            $this->deleteDirectory($agentDir);
        }

        $agent->delete();

        $this->logger->info('[Agent] Deleted', ['agent_id' => $id, 'user_id' => $userId]);

        return $this->success($response, null, 'Agent 已删除');
    }

    // ──────────────────────────────────────────────
    //  Skill 挂载（T05）
    // ──────────────────────────────────────────────

    /**
     * 挂载 skill
     *
     * POST /api/agents/{id}/skills
     * Body: { "skill_ids": ["uuid1", "uuid2"] }
     */
    public function mountSkills(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $agent = Agent::query()->where('id', $id)->where('user_id', $userId)->first();
        if ($agent === null) {
            return $this->error($response, 'Agent 不存在', 404);
        }

        $skillIds = $request->input('skill_ids', []);
        if (!is_array($skillIds) || count($skillIds) === 0) {
            return $this->error($response, 'skill_ids 不能为空', 422);
        }

        $this->syncSkills($id, $skillIds);

        // 标记 session 失效
        $this->markAgentSessionsStale($id);

        return $this->success($response, [
            'skills' => $this->getMountedSkills($id),
        ], 'Skill 挂载成功');
    }

    /**
     * 查询已挂载 skill 列表
     *
     * GET /api/agents/{id}/skills
     */
    public function listSkills(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $agent = Agent::query()->where('id', $id)->where('user_id', $userId)->first();
        if ($agent === null) {
            return $this->error($response, 'Agent 不存在', 404);
        }

        return $this->success($response, [
            'skills' => $this->getMountedSkills($id),
        ]);
    }

    // ──────────────────────────────────────────────
    //  辅助方法
    // ──────────────────────────────────────────────

    /**
     * 格式化 Agent（含关联数据）
     */
    private function formatAgent(Agent $agent): array
    {
        $skills    = $this->getMountedSkills($agent->id);
        $mcpConfigs = McpConfig::query()->where('agent_id', $agent->id)->get()->toArray();

        return array_merge($agent->toArray(), [
            'skills'     => $skills,
            'mcp_config' => $mcpConfigs,
        ]);
    }

    /**
     * 获取 Agent 已挂载的 skill 列表
     */
    private function getMountedSkills(string $agentId): array
    {
        $rows = AgentSkill::query()->where('agent_id', $agentId)->get();
        $skillIds = $rows->pluck('skill_id')->toArray();

        if (count($skillIds) === 0) {
            return [];
        }

        return SkillLibrary::query()->whereIn('id', $skillIds)->get()->toArray();
    }

    /**
     * 同步 skill 挂载（去重写入）
     */
    private function syncSkills(string $agentId, array $skillIds): void
    {
        $validIds = SkillLibrary::query()
            ->where('enabled', 1)
            ->whereIn('id', $skillIds)
            ->pluck('id')
            ->toArray();

        foreach ($validIds as $skillId) {
            AgentSkill::query()->firstOrCreate([
                'agent_id' => $agentId,
                'skill_id' => $skillId,
            ]);
        }
    }

    /**
     * 标记 Agent 全部活跃 session 失效（供 T07 Pool 感知）
     *
     * 使用 Redis 记录 agent 的最新 update_time，
     * Pool 启动会话时比对判否需要重建进程。
     */
    private function markAgentSessionsStale(string $agentId): void
    {
        // 更新 agent.update_time 作为版本标记
        $agent = Agent::query()->find($agentId);
        if ($agent !== null) {
            $agent->touch();
        }

        // 将失效时间戳写入 Redis（带 TTL = 24h）
        try {
            $redis = $this->container->get(\Hyperf\Redis\Redis::class);
            $key = 'agent:stale:' . $agentId;
            $redis->set($key, date('Y-m-d H:i:s'), 86400);
            $this->logger->debug('[Agent] Sessions marked stale', ['agent_id' => $agentId]);
        } catch (\Throwable $e) {
            $this->logger->warning('[Agent] Failed to mark stale in Redis: ' . $e->getMessage());
        }
    }

    /**
     * 递归删除目录
     */
    private function deleteDirectory(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }
        $items = scandir($dir);
        if ($items === false) {
            return;
        }
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            $path = $dir . '/' . $item;
            if (is_dir($path)) {
                $this->deleteDirectory($path);
            } else {
                @unlink($path);
            }
        }
        @rmdir($dir);
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
