<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\Agent as AgentModel;
use App\Model\Session as SessionModel;
use Psr\Container\ContainerInterface;
use Psr\Log\LoggerInterface;
use Swoole\Coroutine\Channel;

/**
 * Pi Agent 会话进程池
 *
 * 同一 sessionId 复用同一个 Pi 进程，实现上下文记忆。
 * T07 增强：集成 AgentLauncherService 构建启动命令 + cwd 隔离 + 配置失效检测。
 */
class PiSessionPool
{
    /** @var array<string, PiAgentSession> */
    private array $sessions = [];

    /** @var array<string, Channel> */
    private array $locks = [];

    /** @var array<string, string> 记录每个 session 创建时的 agent_config_version */
    private array $sessionAgentVersions = [];

    private int $maxIdleTime = 600;

    public function __construct(
        private ContainerInterface $container,
        private LoggerInterface $logger,
    ) {
    }

    // ──────────────────────────────────────────────
    //  新接口：T07 增强版（供 R3 ChatController 使用）
    // ──────────────────────────────────────────────

    /**
     * 获取或创建会话（增强版，T07）
     *
     * 使用 AgentLauncherService 组装启动命令，注入 cwd、profile、skill、mcp。
     * 增加配置失效检测：比对 agent.updated_at 与 Redis stale 标记，不一致则重建进程。
     *
     * @param AgentModel   $agent   Agent 实例
     * @param SessionModel $session Session 实例
     * @return PiAgentSession
     */
    public function getOrCreateSession(AgentModel $agent, SessionModel $session): PiAgentSession
    {
        $sessionId = $session->id;

        // 协程锁：保证同一 session 串行处理
        if (!isset($this->locks[$sessionId])) {
            $this->locks[$sessionId] = new Channel(1);
            $this->locks[$sessionId]->push(true);
        }

        $lock = $this->locks[$sessionId];
        $lock->pop();

        try {
            $this->cleanup();

            $needsRebuild = false;

            if (isset($this->sessions[$sessionId])) {
                $existing = $this->sessions[$sessionId];

                // 检查进程是否存活
                if (!$existing->pi->isRunning()) {
                    $this->logger->warning('[Pool] Session dead, will recreate: ' . $sessionId);
                    @$existing->pi->stop();
                    $needsRebuild = true;
                } elseif ($this->isAgentConfigStale($agent->id, $agent->updated_at ?? '')) {
                    // 配置失效检测（T07）：agent 配置变更后重建进程
                    $this->logger->info('[Pool] Agent config stale, recreating: ' . $sessionId, [
                        'agent_id' => $agent->id,
                    ]);
                    @$existing->pi->stop();
                    $needsRebuild = true;
                } else {
                    $existing->touch();
                    return $existing;
                }
            } else {
                $needsRebuild = true;
            }

            if ($needsRebuild) {
                $this->logger->info('[Pool] Creating session (T07): ' . $sessionId);

                /** @var AgentLauncherService $launcher */
                $launcher = $this->container->get(AgentLauncherService::class);
                $launchInfo = $launcher->buildLaunchCommand($agent, $session);

                /** @var PiAgentService $pi */
                $pi = $this->container->get(PiAgentService::class);
                $pi->reset();
                $pi->start($sessionId, $launchInfo['cwd'], $launchInfo['cmd']);

                $this->sessions[$sessionId] = new PiAgentSession($pi, time());

                // 记录当前 agent 版本（updated_at + 清除 stale 标记）
                $this->sessionAgentVersions[$agent->id] = $agent->updated_at ?? '';
                $this->clearStaleMark($agent->id);
            }

            return $this->sessions[$sessionId];
        } finally {
            $lock->push(true);
        }
    }

    // ──────────────────────────────────────────────
    //  旧接口：向后兼容（ChatController demo 仍可用）
    // ──────────────────────────────────────────────

    /**
     * 获取或创建会话（旧版，协程安全）
     *
     * 保持与现有 ChatController 的兼容性。
     *
     * @param string $sessionId 会话 ID
     * @return PiAgentSession
     */
    public function getSession(string $sessionId): PiAgentSession
    {
        // 保证同一 session 串行处理
        if (!isset($this->locks[$sessionId])) {
            $this->locks[$sessionId] = new Channel(1);
            $this->locks[$sessionId]->push(true);
        }

        $lock = $this->locks[$sessionId];
        $lock->pop();

        try {
            $this->cleanup();

            if (!isset($this->sessions[$sessionId])) {
                $this->logger->info('[Pool] Creating session: ' . $sessionId);

                /** @var PiAgentService $pi */
                $pi = $this->container->get(PiAgentService::class);
                $pi->reset();
                $pi->start($sessionId);
                $this->sessions[$sessionId] = new PiAgentSession($pi, time());
            } else {
                $session = $this->sessions[$sessionId];
                if (!$session->pi->isRunning()) {
                    $this->logger->warning('[Pool] Session dead, recreating: ' . $sessionId);
                    $session->pi->reset();
                    $session->pi->start($sessionId);
                }
                $session->touch();
            }

            return $this->sessions[$sessionId];
        } finally {
            $lock->push(true);
        }
    }

    // ──────────────────────────────────────────────
    //  配置失效检测（T07）
    // ──────────────────────────────────────────────

    /**
     * 检查 Agent 配置是否已失效
     *
     * 策略：
     * 1. 检查 Redis 的 agent:stale:{agentId} 标记
     * 2. 比对该 agent 的 updated_at 与上次记录版本
     *
     * @param string $agentId         Agent ID
     * @param string $currentVersion  当前 agent.updated_at
     * @return bool true = 已失效需重建
     */
    private function isAgentConfigStale(string $agentId, string $currentVersion): bool
    {
        // 方法 1：Redis stale 标记
        try {
            $redis = $this->container->get(\Hyperf\Redis\Redis::class);
            $staleKey = 'agent:stale:' . $agentId;
            if ($redis->exists($staleKey)) {
                return true;
            }
        } catch (\Throwable $e) {
            // Redis 不可用时降级到方法 2
        }

        // 方法 2：比对内存中的版本号
        if (isset($this->sessionAgentVersions[$agentId])) {
            if ($this->sessionAgentVersions[$agentId] !== $currentVersion) {
                return true;
            }
        }

        return false;
    }

    /**
     * 清除 Redis 中的 stale 标记
     */
    private function clearStaleMark(string $agentId): void
    {
        try {
            $redis = $this->container->get(\Hyperf\Redis\Redis::class);
            $redis->del('agent:stale:' . $agentId);
        } catch (\Throwable) {
            // 静默
        }
    }

    // ──────────────────────────────────────────────
    //  空闲回收
    // ──────────────────────────────────────────────

    private function cleanup(): void
    {
        $now = time();
        foreach ($this->sessions as $id => $session) {
            if ($now - $session->lastUsed > $this->maxIdleTime) {
                $this->logger->info('[Pool] Expired: ' . $id);
                @$session->pi->stop();
                unset($this->sessions[$id], $this->locks[$id], $this->sessionAgentVersions[$id]);
            }
        }
    }
}

class PiAgentSession
{
    public function __construct(
        public PiAgentService $pi,
        public int $lastUsed,
    ) {
    }

    public function touch(): void
    {
        $this->lastUsed = time();
    }
}
