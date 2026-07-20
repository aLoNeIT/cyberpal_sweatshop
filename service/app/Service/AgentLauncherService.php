<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\Agent;
use App\Model\AgentSkill;
use App\Model\Session;
use App\Model\SkillLibrary;
use Hyperf\Contract\ConfigInterface;
use Psr\Log\LoggerInterface;

/**
 * Agent 启动器服务
 *
 * 负责构建 per-agent 的 OMP 启动命令、管理运行时目录结构。
 * 闭环架构风险 A（MCP 注入）与风险 C（workspace 隔离）。
 *
 * 对应架构文档 §8.1 目录规范 + §9.A + §9.C。
 */
class AgentLauncherService
{
    private string $runtimeRoot;
    private string $sessionDir;
    private string $piBin;

    public function __construct(
        private ConfigInterface $config,
        private LoggerInterface $logger,
    ) {
        $this->runtimeRoot = $this->config->get('pi_agent.runtime_root', BASE_PATH . '/runtime');
        $this->sessionDir  = $this->config->get('pi_agent.session_dir', '/tmp/pi-sessions');
        $this->piBin       = $this->config->get('pi_agent.bin', 'pi');
    }

    // ──────────────────────────────────────────────
    //  目录路径
    // ──────────────────────────────────────────────

    /**
     * Agent 运行时根目录
     *
     * @return string runtime/tenants/{user_id}/agents/{agent_id}/
     */
    public function agentRuntimeDir(Agent $agent): string
    {
        return sprintf(
            '%s/tenants/%d/agents/%s',
            rtrim($this->runtimeRoot, '/'),
            $agent->user_id,
            $agent->id
        );
    }

    /**
     * Agent 工作目录（OMP 启动 cwd）
     *
     * @return string .../agents/{agent_id}/workspace/
     */
    public function agentWorkspaceDir(Agent $agent): string
    {
        return $this->agentRuntimeDir($agent) . '/workspace';
    }

    /**
     * MCP 配置文件路径
     *
     * @return string .../agents/{agent_id}/.omp/mcp.json
     */
    public function getMcpJsonPath(Agent $agent): string
    {
        return $this->agentRuntimeDir($agent) . '/.omp/mcp.json';
    }

    // ──────────────────────────────────────────────
    //  目录初始化
    // ──────────────────────────────────────────────

    /**
     * 确保 Agent 运行时目录结构存在
     *
     * 创建 workspace/、skills/、.omp/ 三个子目录。
     */
    public function ensureDirectories(Agent $agent): void
    {
        $base = $this->agentRuntimeDir($agent);

        $dirs = [
            $base,
            $base . '/workspace',
            $base . '/skills',
            $base . '/.omp',
        ];

        foreach ($dirs as $dir) {
            if (!is_dir($dir)) {
                if (!mkdir($dir, 0755, true)) {
                    $this->logger->error('[Launcher] Failed to create directory: ' . $dir);
                    throw new \RuntimeException('Failed to create directory: ' . $dir);
                }
                $this->logger->debug('[Launcher] Created directory: ' . $dir);
            }
        }
    }

    // ──────────────────────────────────────────────
    //  启动命令构建（T07 填充 — 闭环 C）
    // ──────────────────────────────────────────────

    /**
     * 构建 OMP 启动命令数组
     *
     * 对应架构文档 §5.2 + §9.C：
     * - cwd = agentWorkspaceDir（闭环 C：文件操作不出此目录）
     * - --profile = tenant_{user_id}（租户隔离）
     * - --session-dir 指向统一 session_dir
     * - 从 agent_skill 表查询挂载 skill，拼 --skill {path}
     * - tools whitelist/blacklist 拼 --tools / --exclude-tools
     *
     * @param Agent   $agent   Agent 实例
     * @param Session $session Session 实例
     * @return array{cwd: string, cmd: string} 包含 cwd 和完整命令字符串
     */
    public function buildLaunchCommand(Agent $agent, Session $session): array
    {
        // 确保目录就绪
        $this->ensureDirectories($agent);

        $cwd = $this->agentWorkspaceDir($agent);

        // 基础命令
        $cmdParts = [
            escapeshellcmd($this->piBin),
            '--mode', 'rpc',
            '--provider', escapeshellarg($agent->provider),
            '--model', escapeshellarg($agent->model),
            '--profile', escapeshellarg('tenant_' . $agent->user_id),
            '--session-dir', escapeshellarg($this->sessionDir),
            '--name', escapeshellarg($agent->id),
        ];

        // thinking
        if (!empty($agent->thinking) && $agent->thinking !== 'medium') {
            $cmdParts[] = '--thinking';
            $cmdParts[] = escapeshellarg($agent->thinking);
        }

        // system_prompt
        if (!empty($agent->system_prompt)) {
            $cmdParts[] = '--system-prompt';
            $cmdParts[] = escapeshellarg($agent->system_prompt);
        }

        // append_system_prompt
        if (!empty($agent->append_system_prompt)) {
            $cmdParts[] = '--append-system-prompt';
            $cmdParts[] = escapeshellarg($agent->append_system_prompt);
        }

        // 挂载 skills（从 agent_skill 查 path）
        $skillPaths = $this->getSkillPaths($agent->id);
        foreach ($skillPaths as $skillPath) {
            $cmdParts[] = '--skill';
            $cmdParts[] = escapeshellarg($skillPath);
        }

        // tools whitelist
        $whitelist = $agent->tools_whitelist;
        if (!empty($whitelist)) {
            $cmdParts[] = '--tools';
            $cmdParts[] = escapeshellarg($whitelist);
        }

        // tools blacklist
        $blacklist = $agent->tools_blacklist;
        if (!empty($blacklist)) {
            $cmdParts[] = '--exclude-tools';
            $cmdParts[] = escapeshellarg($blacklist);
        }

        // stderr 合并到 stdout
        $cmdParts[] = '2>&1';

        $cmd = implode(' ', $cmdParts);

        $this->logger->info('[Launcher] Build command', [
            'agent_id' => $agent->id,
            'cwd'      => $cwd,
            'cmd'      => $cmd,
        ]);

        return [
            'cwd' => $cwd,
            'cmd' => $cmd,
        ];
    }

    // ──────────────────────────────────────────────
    //  Skill 路径解析
    // ──────────────────────────────────────────────

    /**
     * 获取 Agent 已挂载 skill 的磁盘路径列表
     *
     * @return string[]
     */
    private function getSkillPaths(string $agentId): array
    {
        $rows = AgentSkill::query()->where('agent_id', $agentId)->get();
        $skillIds = $rows->pluck('skill_id')->toArray();

        if (count($skillIds) === 0) {
            return [];
        }

        $skills = SkillLibrary::query()
            ->where('enabled', 1)
            ->whereIn('id', $skillIds)
            ->get();

        $paths = [];
        foreach ($skills as $skill) {
            if (!empty($skill->path)) {
                $paths[] = $skill->path;
            }
        }

        return $paths;
    }
}
