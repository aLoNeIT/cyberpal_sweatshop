<?php

declare(strict_types=1);

namespace App\Service;

use Hyperf\Contract\ConfigInterface;
use Psr\Log\LoggerInterface;

/**
 * Pi Agent 进程管理服务
 * 通过 proc_open 启动 pi --mode rpc，使用 stdin/stdout JSONL 协议通信
 */
class PiAgentService
{
    /** @var resource|null */
    private $process = null;

    /** @var array */
    private array $pipes = [];

    /** @var string stderr 缓冲区 */
    private string $stderrBuffer = '';

    /** @var string|null 启动时的 cwd（用于 T07 闭环 C） */
    private ?string $cwd = null;

    private string $piPath;
    private string $provider;
    private string $model;
    private string $sessionDir;

    public function __construct(
        private ConfigInterface $config,
        private LoggerInterface $logger,
    ) {
        $this->piPath = $this->config->get('pi_agent.bin', 'pi');
        $this->provider = $this->config->get('pi_agent.provider', 'openai');
        $this->model = $this->config->get('pi_agent.model', 'gpt-4o');
        $this->sessionDir = $this->config->get('pi_agent.session_dir', '/tmp/pi-sessions');
    }

    /**
     * 启动 Pi Agent 子进程
     *
     * @param string      $sessionId 会话 ID（同一 sessionId 复用历史上下文）
     * @param string|null $cwd       工作目录（T07 闭环 C：per-agent workspace 隔离）
     * @param string|null $cmd       自定义命令（T07：由 AgentLauncherService 组装；为 null 时使用默认命令）
     */
    public function start(string $sessionId, ?string $cwd = null, ?string $cmd = null): void
    {
        $this->cwd = $cwd;

        if ($cmd === null) {
            // 兼容旧调用路径（ChatController demo）：使用默认命令
            $cmd = sprintf(
                '%s --mode rpc --session-dir %s --name %s --provider %s --model %s 2>&1',
                escapeshellcmd($this->piPath),
                escapeshellarg($this->sessionDir),
                escapeshellarg($sessionId),
                escapeshellarg($this->provider),
                escapeshellarg($this->model)
            );
        }

        $this->logger->info('[PiAgent] Starting: ' . $cmd . ($cwd ? ' (cwd=' . $cwd . ')' : ''));

        $descriptor = [
            0 => ['pipe', 'r'], // stdin
            1 => ['pipe', 'w'], // stdout
            2 => ['pipe', 'w'], // stderr
        ];

        // T07 闭环 C：指定 cwd 实现 workspace 隔离
        if ($cwd !== null && is_dir($cwd)) {
            $this->process = proc_open($cmd, $descriptor, $this->pipes, $cwd);
        } else {
            $this->process = proc_open($cmd, $descriptor, $this->pipes);
        }

        if (!is_resource($this->process)) {
            throw new \RuntimeException('Failed to start Pi Agent process: ' . $cmd);
        }

        stream_set_blocking($this->pipes[1], false);
        stream_set_blocking($this->pipes[2], false);

        $this->logger->info('[PiAgent] Process started, PID: ' . proc_get_status($this->process)['pid']);
    }

    /**
     * 获取当前 cwd
     */
    public function getCwd(): ?string
    {
        return $this->cwd;
    }

    /**
     * 发送 JSON 命令到 Pi Agent stdin
     */
    public function sendCommand(array $command): void
    {
        $json = json_encode($command, JSON_UNESCAPED_UNICODE) . "\n";
        $this->logger->info('[PiAgent] SEND: ' . trim($json));
        fwrite($this->pipes[0], $json);
        fflush($this->pipes[0]);
    }

    /**
     * 发送用户消息（prompt 命令）
     */
    public function sendPrompt(string $message): void
    {
        $this->sendCommand([
            'id' => 'msg-' . uniqid(),
            'type' => 'prompt',
            'message' => $message,
        ]);
    }

    /**
     * 读取 stdout 事件，yield 逐行返回解析后的 JSON
     * 同时持续收集 stderr
     *
     * @return \Generator<array>
     */
    public function readEvents(): \Generator
    {
        $buffer = '';
        $startTime = time();
        $timeout = 60; // 60 秒超时

        while (true) {
            // 检查超时
            if (time() - $startTime > $timeout) {
                $this->logger->warning('[PiAgent] Timeout after ' . $timeout . 's');
                $this->drainStderr();
                yield ['type' => 'error', 'error' => 'Pi Agent 执行超时 (' . $timeout . 's)'];
                return;
            }

            // 读取 stdout
            $data = fread($this->pipes[1], 8192);

            // 同时读取 stderr（非阻塞）
            $this->drainStderr();

            if ($data === false || $data === '') {
                $status = proc_get_status($this->process);
                if (!$status['running']) {
                    $this->logger->warning('[PiAgent] Process exited with code: ' . $status['exitcode']);
                    $this->drainStderr();
                    if ($this->stderrBuffer !== '') {
                        $this->logger->error('[PiAgent] stderr: ' . $this->stderrBuffer);
                    }
                    // 进程退出但没有收到 agent_settled，说明出错了
                    yield ['type' => 'error', 'error' => 'Pi Agent 异常退出 (exit=' . $status['exitcode'] . '): ' . $this->stderrBuffer];
                    return;
                }
                \Swoole\Coroutine::sleep(0.05);
                continue;
            }

            $buffer .= $data;

            // 按行解析 JSONL
            while (($pos = strpos($buffer, "\n")) !== false) {
                $line = trim(substr($buffer, 0, $pos));
                $buffer = substr($buffer, $pos + 1);

                if ($line === '') {
                    continue;
                }

                $event = json_decode($line, true);
                if ($event === null) {
                    $this->logger->warning('[PiAgent] Non-JSON output: ' . substr($line, 0, 200));
                    continue;
                }

                $this->logger->debug('[PiAgent] RECV: ' . ($event['type'] ?? '?') . ($event['updateType'] ?? ''));

                yield $event;

                if (($event['type'] ?? '') === 'agent_settled') {
                    $this->drainStderr();
                    return;
                }
            }
        }
    }

    /**
     * 非阻塞读取 stderr 到缓冲区
     */
    private function drainStderr(): void
    {
        while (true) {
            $data = fread($this->pipes[2], 8192);
            if ($data === false || $data === '') {
                break;
            }
            $this->stderrBuffer .= $data;
        }

        // 限制缓冲区大小
        if (strlen($this->stderrBuffer) > 10000) {
            $this->stderrBuffer = substr($this->stderrBuffer, -5000);
        }
    }

    /**
     * 获取 stderr 内容
     */
    public function getStderr(): string
    {
        return $this->stderrBuffer;
    }

    /**
     * 停止 Pi Agent 进程
     */
    public function stop(): void
    {
        foreach ($this->pipes as $pipe) {
            if (is_resource($pipe)) {
                @fclose($pipe);
            }
        }

        if (is_resource($this->process)) {
            $status = proc_get_status($this->process);
            if ($status['running']) {
                $this->logger->info('[PiAgent] Terminating process...');
                proc_terminate($this->process, SIGTERM);
                // 等最多 3 秒
                for ($i = 0; $i < 30; $i++) {
                    $status = proc_get_status($this->process);
                    if (!$status['running']) {
                        break;
                    }
                    usleep(100000);
                }
                // 强杀
                $status = proc_get_status($this->process);
                if ($status['running']) {
                    proc_terminate($this->process, SIGKILL);
                }
            }
            $exitCode = proc_close($this->process);
            $this->logger->info('[PiAgent] Process closed, exit=' . $exitCode);
        }
    }

    /**
     * 检查进程是否在运行
     */
    public function isRunning(): bool
    {
        if (!is_resource($this->process)) {
            return false;
        }
        $status = proc_get_status($this->process);
        return $status['running'];
    }

    /**
     * 重置状态，准备复用实例
     */
    public function reset(): void
    {
        $this->process = null;
        $this->pipes = [];
        $this->stderrBuffer = '';
    }
}
