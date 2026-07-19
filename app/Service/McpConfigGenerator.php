<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\Agent;
use App\Model\McpConfig;
use Psr\Log\LoggerInterface;

/**
 * MCP 配置生成器
 *
 * 由数据库 mcp_config 表生成 .omp/mcp.json 文件。
 * 闭环架构风险 A（MCP 注入）。
 *
 * 对应架构文档 §8.2 + §9.A：
 * - 单一数据源：mcp_config 表
 * - 格式：{ "mcpServers": { "<name>": {...} } }
 * - OMP 从 cwd 向上查找 .omp/mcp.json
 * - 不支持热加载 → MCP CRUD 后由 Controller 调 rebuild + 标记 session 失效
 */
class McpConfigGenerator
{
    public function __construct(
        private AgentLauncherService $launcher,
        private LoggerInterface $logger,
    ) {
    }

    /**
     * 确保 Agent 目录结构存在（委托给 AgentLauncherService）
     */
    public function ensureDirectories(Agent $agent): void
    {
        $this->launcher->ensureDirectories($agent);
    }

    /**
     * 获取 mcp.json 文件路径
     */
    public function getMcpJsonPath(Agent $agent): string
    {
        return $this->launcher->getMcpJsonPath($agent);
    }

    /**
     * 重建 mcp.json
     *
     * 从 mcp_config 表查询该 agent 所有 enabled=true 的条目，
     * 按 OMP/Claude 兼容格式写入 .omp/mcp.json。
     *
     * 对应架构文档 §4.2 的 MCP 条目 JSON schema：
     *   stdio  → { command, args, env }
     *   http   → { type: "http", url, headers }
     *   sse    → { type: "sse", url, headers }
     *
     * @param Agent $agent
     * @return bool 是否生成成功
     */
    public function rebuild(Agent $agent): bool
    {
        $entries = McpConfig::query()
            ->where('agent_id', $agent->id)
            ->where('enabled', 1)
            ->get();

        $mcpServers = [];

        foreach ($entries as $entry) {
            $serverConfig = [];

            if ($entry->transport === 'stdio') {
                if (!empty($entry->command)) {
                    $serverConfig['command'] = $entry->command;
                }
                $args = $entry->args_json;
                if (is_array($args) && count($args) > 0) {
                    $serverConfig['args'] = $args;
                }
                $env = $entry->env_json;
                if (is_array($env) && count($env) > 0) {
                    $serverConfig['env'] = $env;
                }
            } elseif (in_array($entry->transport, ['http', 'sse'], true)) {
                $serverConfig['type'] = $entry->transport;
                if (!empty($entry->url)) {
                    $serverConfig['url'] = $entry->url;
                }
                $headers = $entry->headers_json;
                if (is_array($headers) && count($headers) > 0) {
                    $serverConfig['headers'] = $headers;
                }
            }

            $mcpServers[$entry->name] = $serverConfig;
        }

        $config = [
            'mcpServers' => $mcpServers,
        ];

        // 确保目录存在
        $this->launcher->ensureDirectories($agent);

        $path = $this->getMcpJsonPath($agent);
        $json = json_encode($config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

        if (file_put_contents($path, $json) === false) {
            $this->logger->error('[McpGen] Failed to write mcp.json', [
                'agent_id' => $agent->id,
                'path'     => $path,
            ]);
            return false;
        }

        $this->logger->info('[McpGen] mcp.json rebuilt', [
            'agent_id'     => $agent->id,
            'path'         => $path,
            'server_count' => count($mcpServers),
        ]);

        return true;
    }
}
