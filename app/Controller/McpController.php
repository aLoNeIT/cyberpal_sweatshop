<?php

declare(strict_types=1);

namespace App\Controller;

use App\Model\Agent;
use App\Model\McpConfig;
use App\Service\McpConfigGenerator;
use App\Util\Uuid;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * MCP 配置管理控制器
 *
 * 对应架构文档 §4.1 的 /api/agents/{id}/mcp/* 端点。
 * per-agent MCP server 条目的 CRUD，变更后触发 mcp.json 重建。
 * 闭环架构风险 A。
 */
class McpController extends AbstractController
{
    #[Inject]
    private McpConfigGenerator $mcpConfigGenerator;

    #[Inject]
    private LoggerInterface $logger;

    /**
     * 列出 Agent 的 MCP 配置
     *
     * GET /api/agents/{id}/mcp
     */
    public function index(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $userId = (int) $request->getAttribute('user_id', 0);
        $agent  = $this->getOwnedAgent($id, $userId);

        if ($agent === null) {
            return $this->error($response, 'Agent 不存在', 404);
        }

        $items = McpConfig::query()->where('agent_id', $id)->get();

        return $this->success($response, [
            'items' => $items->toArray(),
        ]);
    }

    /**
     * 新增 MCP 条目
     *
     * POST /api/agents/{id}/mcp
     */
    public function store(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $userId = (int) $request->getAttribute('user_id', 0);
        $agent  = $this->getOwnedAgent($id, $userId);

        if ($agent === null) {
            return $this->error($response, 'Agent 不存在', 404);
        }

        $name = trim($request->input('name', ''));
        if ($name === '') {
            return $this->error($response, 'MCP server 名称不能为空', 422);
        }

        $transport = $request->input('transport', 'stdio');
        if (!in_array($transport, ['stdio', 'http', 'sse'], true)) {
            return $this->error($response, 'transport 必须为 stdio/http/sse', 422);
        }

        $entry = McpConfig::create([
            'id'           => Uuid::v4(),
            'agent_id'     => $id,
            'name'         => $name,
            'transport'    => $transport,
            'command'      => $request->input('command'),
            'args_json'    => $request->input('args_json'),
            'url'          => $request->input('url'),
            'env_json'     => $request->input('env_json'),
            'headers_json' => $request->input('headers_json'),
            'enabled'      => $request->input('enabled', 1),
        ]);

        // 重建 mcp.json + 标记 session 失效
        $this->mcpConfigGenerator->rebuild($agent);
        $this->markAgentSessionsStale($id);

        $this->logger->info('[MCP] Created', ['agent_id' => $id, 'mcp_name' => $name]);

        return $this->success($response, [
            'mcp' => $entry->toArray(),
        ], 'MCP 条目已创建');
    }

    /**
     * 编辑 MCP 条目
     *
     * PUT /api/agents/{id}/mcp/{mid}
     */
    public function update(RequestInterface $request, ResponseInterface $response, string $id, string $mid)
    {
        $userId = (int) $request->getAttribute('user_id', 0);
        $agent  = $this->getOwnedAgent($id, $userId);

        if ($agent === null) {
            return $this->error($response, 'Agent 不存在', 404);
        }

        $entry = McpConfig::query()->where('id', $mid)->where('agent_id', $id)->first();
        if ($entry === null) {
            return $this->error($response, 'MCP 条目不存在', 404);
        }

        $name = trim($request->input('name', $entry->name));
        if ($name === '') {
            return $this->error($response, 'MCP server 名称不能为空', 422);
        }

        $transport = $request->input('transport', $entry->transport);
        if (!in_array($transport, ['stdio', 'http', 'sse'], true)) {
            return $this->error($response, 'transport 必须为 stdio/http/sse', 422);
        }

        $fields = ['name', 'transport', 'command', 'args_json', 'url', 'env_json', 'headers_json', 'enabled'];
        foreach ($fields as $field) {
            if ($request->has($field)) {
                $entry->{$field} = $request->input($field);
            }
        }
        $entry->save();

        // 重建 mcp.json + 标记 session 失效
        $this->mcpConfigGenerator->rebuild($agent);
        $this->markAgentSessionsStale($id);

        $this->logger->info('[MCP] Updated', ['agent_id' => $id, 'mcp_id' => $mid]);

        return $this->success($response, [
            'mcp' => $entry->toArray(),
        ], 'MCP 条目已更新');
    }

    /**
     * 删除 MCP 条目
     *
     * DELETE /api/agents/{id}/mcp/{mid}
     */
    public function destroy(RequestInterface $request, ResponseInterface $response, string $id, string $mid)
    {
        $userId = (int) $request->getAttribute('user_id', 0);
        $agent  = $this->getOwnedAgent($id, $userId);

        if ($agent === null) {
            return $this->error($response, 'Agent 不存在', 404);
        }

        $entry = McpConfig::query()->where('id', $mid)->where('agent_id', $id)->first();
        if ($entry === null) {
            return $this->error($response, 'MCP 条目不存在', 404);
        }

        $entry->delete();

        // 重建 mcp.json + 标记 session 失效
        $this->mcpConfigGenerator->rebuild($agent);
        $this->markAgentSessionsStale($id);

        $this->logger->info('[MCP] Deleted', ['agent_id' => $id, 'mcp_id' => $mid]);

        return $this->success($response, null, 'MCP 条目已删除');
    }

    // ──────────────────────────────────────────────
    //  辅助方法
    // ──────────────────────────────────────────────

    /**
     * 获取当前用户拥有的 Agent
     */
    private function getOwnedAgent(string $agentId, int $userId): ?Agent
    {
        return Agent::query()->where('id', $agentId)->where('user_id', $userId)->first();
    }

    /**
     * 标记 Agent 全部活跃 session 失效
     */
    private function markAgentSessionsStale(string $agentId): void
    {
        try {
            $redis = $this->container->get(\Hyperf\Redis\Redis::class);
            $key = 'agent:stale:' . $agentId;
            $redis->set($key, date('Y-m-d H:i:s'), 86400);
            $this->logger->debug('[MCP] Sessions marked stale', ['agent_id' => $agentId]);
        } catch (\Throwable $e) {
            $this->logger->warning('[MCP] Failed to mark stale in Redis: ' . $e->getMessage());
        }
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
