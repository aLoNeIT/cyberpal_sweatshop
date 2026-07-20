<?php

declare(strict_types=1);

namespace App\Controller;

use App\Constants\EventType;
use App\Model\Agent;
use App\Model\Event;
use App\Model\Message;
use App\Model\Session;
use App\Service\PiSessionPool;
use App\Service\PiAgentService;
use App\Service\UsageCollector;
use Hyperf\Context\ResponseContext;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;
use Psr\Log\LoggerInterface;
use Swoole\Http\Response as SwooleResponse;

class ChatController extends AbstractController
{
    public function __construct(
        private PiSessionPool $pool,
        private LoggerInterface $logger,
        private UsageCollector $usageCollector,
    ) {
    }

    // ──────────────────────────────────────────────
    //  旧 demo 方法（保留不动）
    // ──────────────────────────────────────────────

    /**
     * 聊天页面
     */
    public function index(): PsrResponseInterface
    {
        return $this->response->html($this->renderChatPage());
    }

    /**
     * SSE 聊天端点 - 旧 demo 版本（向后兼容，保留不动）
     */
    public function chat(RequestInterface $request, ResponseInterface $response)
    {
        $message = $request->input('message', '');
        $sessionId = $request->input('session_id', 'default');
        $sessionId = preg_replace('/[^a-zA-Z0-9\-_]/', '', $sessionId) ?: 'default';

        if (empty(trim($message))) {
            return $response->json(['error' => '消息不能为空'])->withStatus(400);
        }

        $psr7Response = ResponseContext::get();
        $connection = $psr7Response?->getConnection();
        $swooleRes = $connection?->getSocket();

        if (!$swooleRes instanceof SwooleResponse) {
            $this->logger->error('Cannot get Swoole response via Context');
            return $response->json(['error' => '服务器配置错误'])->withStatus(500);
        }

        $swooleRes->header('Content-Type', 'text/event-stream');
        $swooleRes->header('Cache-Control', 'no-cache');
        $swooleRes->header('Connection', 'keep-alive');
        $swooleRes->header('X-Accel-Buffering', 'no');
        $swooleRes->header('Access-Control-Allow-Origin', '*');
        $swooleRes->status(200);
        $swooleRes->write("retry: 1000\n\n");

        try {
            $session = $this->pool->getSession($sessionId);
            $piAgent = $session->pi;
            $this->logger->info('[Chat] Using session=' . $sessionId);

            $piAgent->sendPrompt($message);

            $currentText = '';
            $hasContent = false;

            foreach ($piAgent->readEvents() as $event) {
                $type = $event['type'] ?? '';
                $this->logger->debug('[Chat] Event: ' . $type, ['event_keys' => array_keys($event)]);

                switch ($type) {
                    case 'message_update':
                        $ame = $event['assistantMessageEvent'] ?? [];
                        $updateType = $ame['type'] ?? '';
                        $delta = $ame['delta'] ?? '';

                        if ($updateType === 'text_delta' && $delta !== '') {
                            $hasContent = true;
                            $currentText .= $delta;
                            $swooleRes->write($this->sseEvent('delta', ['text' => $delta]));
                        } elseif ($updateType === 'thinking_delta') {
                            $swooleRes->write($this->sseEvent('thinking', ['text' => $delta]));
                        } elseif ($updateType === 'toolcall_start') {
                            $toolName = $ame['toolCall']['name'] ?? 'unknown';
                            $swooleRes->write($this->sseEvent('tool_start', ['name' => $toolName]));
                        } elseif ($updateType === 'toolcall_end') {
                            $swooleRes->write($this->sseEvent('tool_end', ['name' => $ame['toolCall']['name'] ?? 'unknown']));
                        } elseif (in_array($updateType, ['text_start', 'text_end', 'thinking_start', 'thinking_end', 'done'], true)) {
                            // 结构化事件，跳过
                        }
                        break;

                    case 'tool_execution_start':
                        $swooleRes->write($this->sseEvent('tool_exec', [
                            'name' => $event['toolName'] ?? 'unknown',
                        ]));
                        break;

                    case 'agent_settled':
                        $swooleRes->write($this->sseEvent('done', [
                            'fullText' => $currentText,
                        ]));
                        break 2;

                    case 'error':
                        $errMsg = $event['error'] ?? 'Unknown Pi error';
                        $this->logger->error('[Chat] Pi error: ' . $errMsg);
                        $swooleRes->write($this->sseEvent('error', [
                            'message' => $errMsg,
                        ]));
                        break 2;

                    case 'response':
                        if (!($event['success'] ?? true)) {
                            $swooleRes->write($this->sseEvent('error', [
                                'message' => $event['error'] ?? 'Unknown error',
                            ]));
                        }
                        break;
                }
            }

            if (!$hasContent && $currentText === '') {
                $stderr = $piAgent->getStderr();
                $this->logger->error('[Chat] No content received, stderr: ' . $stderr);
                $swooleRes->write($this->sseEvent('error', [
                    'message' => 'Pi Agent 未返回内容，请检查 API Key 和模型配置是否正确。' . ($stderr ? ' 错误: ' . $stderr : ''),
                ]));
            }
        } catch (\Throwable $e) {
            $this->logger->error('[Chat] Exception: ' . $e->getMessage());
            $swooleRes->write($this->sseEvent('error', [
                'message' => '服务异常: ' . $e->getMessage(),
            ]));
        } finally {
            $swooleRes->write("event: close\ndata: {}\n\n");
            $swooleRes->end();
        }
    }

    // ──────────────────────────────────────────────
    //  新 SSE 端点：/api/chat/stream（T09 闭环 B 主方案）
    // ──────────────────────────────────────────────

    /**
     * SSE 流式聊天端点（正式版）
     *
     * GET /api/chat/stream?session_id=<UUID>&message=<text>
     *
     * 完整链路：
     * 1. 验证 user_id（JWT 中间件已注入）
     * 2. 查 Session + Agent，验证归属
     * 3. 通过 Pool::getOrCreateSession 获取 Pi 进程
     * 4. 写 user message 到 messages 表
     * 5. stdin 发送 send_prompt
     * 6. 循环 readEvents → SSE 推送 + 事件落库 + usage 解析
     * 7. settled 后写 assistant message + 更新 session + 计费写入
     *
     * 闭环 B 主方案：解析 RPC 事件流中的 usage 字段实时计费。
     */
    public function stream(RequestInterface $request, ResponseInterface $response)
    {
        $userId    = (int) $request->getAttribute('user_id', 0);
        $sessionId = trim($request->input('session_id', ''));
        $userMsg   = trim($request->input('message', ''));

        if ($userId === 0) {
            return $response->json(['code' => 401, 'data' => null, 'message' => '未登录'])->withStatus(401);
        }
        if ($sessionId === '') {
            return $response->json(['code' => 422, 'data' => null, 'message' => 'session_id 不能为空'])->withStatus(422);
        }
        if ($userMsg === '') {
            return $response->json(['code' => 422, 'data' => null, 'message' => 'message 不能为空'])->withStatus(422);
        }

        // 查 Session + 验证归属
        $session = Session::query()->where('id', $sessionId)->where('user_id', $userId)->first();
        if ($session === null) {
            return $response->json(['code' => 404, 'data' => null, 'message' => '会话不存在'])->withStatus(404);
        }

        // 查 Agent
        $agent = Agent::query()->find($session->agent_id);
        if ($agent === null) {
            return $response->json(['code' => 404, 'data' => null, 'message' => 'Agent 不存在'])->withStatus(404);
        }

        // 获取 Swoole 原生 Response
        $psr7Response = ResponseContext::get();
        $connection   = $psr7Response?->getConnection();
        $swooleRes    = $connection?->getSocket();

        if (!$swooleRes instanceof SwooleResponse) {
            $this->logger->error('[Stream] Cannot get Swoole response via Context');
            return $response->json(['code' => 500, 'data' => null, 'message' => '服务器配置错误'])->withStatus(500);
        }

        // 写 user message
        $nextSeq = $this->getNextSeq($sessionId);
        $userMessage = Message::create([
            'session_id' => $sessionId,
            'role'       => 'user',
            'content'    => $userMsg,
            'seq'        => $nextSeq,
        ]);

        // SSE 头
        $swooleRes->header('Content-Type', 'text/event-stream');
        $swooleRes->header('Cache-Control', 'no-cache');
        $swooleRes->header('Connection', 'keep-alive');
        $swooleRes->header('X-Accel-Buffering', 'no');
        $swooleRes->header('Access-Control-Allow-Origin', '*');
        $swooleRes->status(200);
        $swooleRes->write("retry: 1000\n\n");

        try {
            // 取/建 Pi 进程（Pool 内部调用 AgentLauncher→cwd→AgentLauncherService）
            $piSession = $this->pool->getOrCreateSession($agent, $session);
            $piAgent   = $piSession->pi;
            $this->logger->info('[Stream] Connected', [
                'session_id' => $sessionId,
                'agent_id'   => $agent->id,
            ]);

            // stdin 发送消息
            $piAgent->sendCommand([
                'id'      => 'msg-' . uniqid(),
                'type'    => EventType::SEND_PROMPT,
                'message' => $userMsg,
            ]);

            // 流式处理
            $currentContent  = '';
            $currentThinking = '';
            $currentUsage    = null;    // 从 usage 事件解析出的最新用量
            $eventSeq        = 0;       // events 表序号
            $hasContent      = false;

            foreach ($piAgent->readEvents() as $event) {
                $type = $event['type'] ?? '';
                $this->logger->debug('[Stream] Event: ' . $type);

                switch ($type) {
                    // ── message_update ──
                    case 'message_update':
                        $ame       = $event['assistantMessageEvent'] ?? [];
                        $updateType = $ame['type'] ?? '';
                        $delta      = $ame['delta'] ?? '';

                        // --- usage 解析（闭环 B 主方案） ---
                        $rawUsage = $event['usage'] ?? $ame['usage'] ?? null;
                        if ($rawUsage !== null && is_array($rawUsage)) {
                            $currentUsage = $this->extractUsage($rawUsage);
                            if ($currentUsage !== null) {
                                $eventSeq++;
                                $this->writeEvent($sessionId, $userMessage->id, 'usage', $eventSeq, $currentUsage);
                                $currentUsage['source'] = 'usage';
                                $swooleRes->write($this->sseEvent(EventType::USAGE, $currentUsage));
                            }
                        }

                        // text_delta
                        if ($updateType === 'text_delta' && $delta !== '') {
                            $hasContent = true;
                            $currentContent .= $delta;
                            $swooleRes->write($this->sseEvent(EventType::DELTA, ['text' => $delta]));
                        }
                        // thinking_delta
                        elseif ($updateType === 'thinking_delta') {
                            $currentThinking .= $delta;
                            $swooleRes->write($this->sseEvent(EventType::THINKING, ['text' => $delta]));
                        }
                        // toolcall_start
                        elseif ($updateType === 'toolcall_start') {
                            $toolCall = $ame['toolCall'] ?? [];
                            $toolName = $toolCall['name'] ?? 'unknown';
                            $callId   = $toolCall['id'] ?? '';
                            $swooleRes->write($this->sseEvent(EventType::TOOL_START, [
                                'name'    => $toolName,
                                'call_id' => $callId,
                            ]));
                            // 暂存 tool 信息供 toolcall_end 使用
                            $pendingTool = [
                                'call_id' => $callId,
                                'name'    => $toolName,
                                'params'  => $toolCall['arguments'] ?? $toolCall['input'] ?? null,
                            ];
                        }
                        // toolcall_end
                        elseif ($updateType === 'toolcall_end') {
                            $toolCall = $ame['toolCall'] ?? [];
                            $toolName = $toolCall['name'] ?? ($pendingTool['name'] ?? 'unknown');
                            $callId   = $toolCall['id'] ?? ($pendingTool['call_id'] ?? '');
                            $result   = $toolCall['result'] ?? $toolCall['output'] ?? null;
                            $success  = !isset($toolCall['error']);

                            $eventSeq++;
                            $toolPayload = [
                                'call_id'  => $callId,
                                'name'     => $toolName,
                                'params'   => $pendingTool['params'] ?? null,
                                'result'   => $result,
                                'success'  => $success,
                            ];
                            $this->writeEvent($sessionId, $userMessage->id, 'tool_call', $eventSeq, $toolPayload);

                            $swooleRes->write($this->sseEvent(EventType::TOOL_END, [
                                'name'    => $toolName,
                                'call_id' => $callId,
                                'result'  => $result,
                                'success' => $success,
                            ]));
                        }
                        // 结构化事件（text_start/text_end/thinking_start/thinking_end/done）→ 跳过
                        break;

                    // ── tool_execution_start ──
                    case 'tool_execution_start':
                        $toolName = $event['toolName'] ?? 'unknown';
                        $callId   = $event['toolCallId'] ?? '';

                        $eventSeq++;
                        $this->writeEvent($sessionId, $userMessage->id, 'tool_call', $eventSeq, [
                            'call_id' => $callId,
                            'name'    => $toolName,
                            'status'  => 'executing',
                        ]);

                        $swooleRes->write($this->sseEvent(EventType::TOOL_EXEC, [
                            'name'    => $toolName,
                            'call_id' => $callId,
                            'status'  => 'executing',
                        ]));
                        break;

                    // ── agent_settled ──
                    case 'agent_settled':
                        // settled 时的 usage（末帧兜底）
                        $rawUsage = $event['usage'] ?? null;
                        if ($currentUsage === null && $rawUsage !== null && is_array($rawUsage)) {
                            $currentUsage = $this->extractUsage($rawUsage);
                            if ($currentUsage !== null) {
                                $eventSeq++;
                                $this->writeEvent($sessionId, $userMessage->id, 'usage', $eventSeq, $currentUsage);
                                $currentUsage['source'] = 'usage';
                                $swooleRes->write($this->sseEvent(EventType::USAGE, $currentUsage));
                            }
                        }

                        $swooleRes->write($this->sseEvent(EventType::DONE, [
                            'fullText' => $currentContent,
                        ]));
                        break 2;

                    // ── error ──
                    case 'error':
                        $errMsg = $event['error'] ?? 'Unknown error';
                        $this->logger->error('[Stream] Pi error: ' . $errMsg);

                        $eventSeq++;
                        $this->writeEvent($sessionId, $userMessage->id, 'error', $eventSeq, [
                            'message' => $errMsg,
                            'stage'   => $event['stage'] ?? 'runtime',
                        ]);

                        $swooleRes->write($this->sseEvent(EventType::ERROR, ['message' => $errMsg]));
                        break 2;

                    // ── response（末帧） ──
                    case 'response':
                        // response.usage 作为末帧兜底
                        $rawUsage = $event['usage'] ?? null;
                        if ($currentUsage === null && $rawUsage !== null && is_array($rawUsage)) {
                            $currentUsage = $this->extractUsage($rawUsage);
                            if ($currentUsage !== null) {
                                $eventSeq++;
                                $this->writeEvent($sessionId, $userMessage->id, 'usage', $eventSeq, $currentUsage);
                                $currentUsage['source'] = 'usage';
                                $swooleRes->write($this->sseEvent(EventType::USAGE, $currentUsage));
                            }
                        }

                        if (!($event['success'] ?? true)) {
                            $swooleRes->write($this->sseEvent(EventType::ERROR, [
                                'message' => $event['error'] ?? 'Unknown error',
                            ]));
                        }
                        break;
                }
            }

            // ── settled 后处理 ──

            // 写 assistant message
            if ($hasContent || $currentContent !== '') {
                $nextSeq = $this->getNextSeq($sessionId);
                $assistantMsg = Message::create([
                    'session_id' => $sessionId,
                    'role'       => 'assistant',
                    'content'    => $currentContent,
                    'thinking'   => $currentThinking !== '' ? $currentThinking : null,
                    'seq'        => $nextSeq,
                ]);

                // 更新 session
                $session->message_count = $session->message_count + 1;
                $session->last_usage = $currentUsage;
                $session->save();

                // ── 计费写入（闭环 B） ──
                // 主方案：有 usage → source='usage'
                // 兜底 1：无 usage → UsageCollector 估算
                if ($currentUsage !== null && isset($currentUsage['input'], $currentUsage['output'])) {
                    $this->usageCollector->collect(
                        $sessionId,
                        $agent->id,
                        $userId,
                        $agent->model,
                        $agent->provider,
                        [
                            'input'        => $currentUsage['input'] ?? 0,
                            'output'       => $currentUsage['output'] ?? 0,
                            'cache_read'   => $currentUsage['cache_read'] ?? 0,
                            'cache_write'  => $currentUsage['cache_write'] ?? 0,
                        ],
                    );
                } else {
                    // 兜底 1：按字符数估算
                    $this->usageCollector->collect(
                        $sessionId,
                        $agent->id,
                        $userId,
                        $agent->model,
                        $agent->provider,
                        null, // usage=null → 触发估算
                        mb_strlen($userMsg),
                        mb_strlen($currentContent),
                    );
                }
            }

            // 无内容时的错误提示
            if (!$hasContent && $currentContent === '') {
                $stderr = $piAgent->getStderr();
                $this->logger->error('[Stream] No content', ['stderr' => $stderr]);
                $swooleRes->write($this->sseEvent(EventType::ERROR, [
                    'message' => 'Pi Agent 未返回内容，请检查配置。' . ($stderr ? ' ' . $stderr : ''),
                ]));
            }
        } catch (\Throwable $e) {
            $this->logger->error('[Stream] Exception: ' . $e->getMessage());
            $swooleRes->write($this->sseEvent(EventType::ERROR, [
                'message' => '服务异常: ' . $e->getMessage(),
            ]));
        } finally {
            $swooleRes->write("event: close\ndata: {}\n\n");
            $swooleRes->end();
        }
    }

    // ──────────────────────────────────────────────
    //  辅助方法
    // ──────────────────────────────────────────────

    /**
     * 格式化 SSE 事件帧
     */
    private function sseEvent(string $event, array $data): string
    {
        $json = json_encode($data, JSON_UNESCAPED_UNICODE);
        return "event: {$event}\ndata: {$json}\n\n";
    }

    /**
     * 提取 usage 数据（闭环 B 主方案）
     *
     * 从 OMP/pi RPC 事件的 usage 字段中抽取标准键：
     *   input / output / cache_read / cache_write
     *
     * 兼容多种字段名：input_tokens/input, output_tokens/output 等。
     *
     * @param array $raw 原始 usage 数据
     * @return array|null 标准化的 usage，无有效数据时返回 null
     */
    private function extractUsage(array $raw): ?array
    {
        $input  = $raw['input_tokens'] ?? $raw['input'] ?? $raw['prompt_tokens'] ?? 0;
        $output = $raw['output_tokens'] ?? $raw['output'] ?? $raw['completion_tokens'] ?? 0;
        $cacheR = $raw['cache_read_tokens'] ?? $raw['cache_read'] ?? $raw['cache_read_input_tokens'] ?? 0;
        $cacheW = $raw['cache_write_tokens'] ?? $raw['cache_write'] ?? $raw['cache_creation_input_tokens'] ?? 0;

        // 至少要有 input 或 output 才算有效
        if ((int) $input === 0 && (int) $output === 0) {
            return null;
        }

        return [
            'input'       => (int) $input,
            'output'      => (int) $output,
            'cache_read'  => (int) $cacheR,
            'cache_write' => (int) $cacheW,
        ];
    }

    /**
     * 获取会话下一个消息序号
     */
    private function getNextSeq(string $sessionId): int
    {
        $last = Message::query()
            ->where('session_id', $sessionId)
            ->orderBy('seq', 'desc')
            ->first();

        return ($last !== null) ? $last->seq + 1 : 1;
    }

    /**
     * 写入 events 表
     */
    private function writeEvent(string $sessionId, ?int $messageId, string $eventType, int $seq, array $payload): void
    {
        try {
            Event::create([
                'session_id' => $sessionId,
                'message_id' => $messageId,
                'event_type' => $eventType,
                'seq'        => $seq,
                'payload'    => $payload,
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('[Stream] Failed to write event: ' . $e->getMessage());
        }
    }

    /**
     * 返回聊天页面 HTML（旧 demo 用）
     */
    private function renderChatPage(): string
    {
        return <<<'HTML'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pi Agent Chat</title>
    <style>
        :root {
            --bg: #f5f5f5;
            --surface: #ffffff;
            --text: #1a1a1a;
            --text-secondary: #666;
            --border: #e5e5e5;
            --primary: #4f46e5;
            --primary-hover: #4338ca;
            --user-bubble: #4f46e5;
            --user-text: #ffffff;
            --ai-bubble: #f0f0f0;
            --ai-text: #1a1a1a;
            --tool-bg: #fff8e1;
            --error: #dc2626;
            --radius: 16px;
            --shadow: 0 4px 24px rgba(0,0,0,0.08);
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg: #1a1a2e;
                --surface: #16213e;
                --text: #e0e0e0;
                --text-secondary: #999;
                --border: #2a2a4a;
                --primary: #6366f1;
                --primary-hover: #818cf8;
                --user-bubble: #6366f1;
                --ai-bubble: #1e293b;
                --ai-text: #e0e0e0;
                --tool-bg: #2d2410;
                --shadow: 0 4px 24px rgba(0,0,0,0.3);
            }
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            height: 100vh;
            display: flex;
            flex-direction: column;
            transition: background 0.3s, color 0.3s;
        }

        .header {
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: var(--shadow);
            z-index: 10;
        }

        .header h1 {
            font-size: 1.25rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .header h1 .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #22c55e;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }

        .status-badge {
            font-size: 0.75rem;
            padding: 4px 10px;
            border-radius: 20px;
            background: var(--ai-bubble);
            color: var(--text-secondary);
        }

        .chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            scroll-behavior: smooth;
        }

        .message {
            display: flex;
            flex-direction: column;
            max-width: 80%;
            animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
            align-self: flex-end;
        }

        .message.ai {
            align-self: flex-start;
        }

        .bubble {
            padding: 12px 18px;
            border-radius: var(--radius);
            line-height: 1.6;
            font-size: 0.95rem;
            word-break: break-word;
        }

        .message.user .bubble {
            background: var(--user-bubble);
            color: var(--user-text);
            border-bottom-right-radius: 4px;
        }

        .message.ai .bubble {
            background: var(--ai-bubble);
            color: var(--ai-text);
            border-bottom-left-radius: 4px;
            border: 1px solid var(--border);
        }

        .message.ai .bubble.streaming {
            border-left: 3px solid var(--primary);
        }

        .tool-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 14px;
            background: var(--tool-bg);
            border-radius: 12px;
            font-size: 0.8rem;
            color: var(--text-secondary);
            align-self: flex-start;
            animation: slideIn 0.3s ease-out;
        }

        .tool-indicator .spinner {
            width: 14px;
            height: 14px;
            border: 2px solid var(--border);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .input-area {
            background: var(--surface);
            border-top: 1px solid var(--border);
            padding: 16px 24px;
            box-shadow: var(--shadow);
            z-index: 10;
        }

        .input-wrapper {
            display: flex;
            gap: 12px;
            align-items: flex-end;
            max-width: 900px;
            margin: 0 auto;
        }

        .input-wrapper textarea {
            flex: 1;
            padding: 12px 18px;
            border: 2px solid var(--border);
            border-radius: var(--radius);
            font-size: 0.95rem;
            line-height: 1.5;
            background: var(--bg);
            color: var(--text);
            resize: none;
            min-height: 48px;
            max-height: 150px;
            outline: none;
            transition: border-color 0.2s;
            font-family: inherit;
        }

        .input-wrapper textarea:focus {
            border-color: var(--primary);
        }

        .input-wrapper button {
            padding: 12px 24px;
            background: var(--primary);
            color: #fff;
            border: none;
            border-radius: var(--radius);
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            white-space: nowrap;
        }

        .input-wrapper button:hover {
            background: var(--primary-hover);
        }

        .input-wrapper button:active {
            transform: scale(0.97);
        }

        .input-wrapper button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .empty-state {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            gap: 12px;
            text-align: center;
            padding: 40px;
        }

        .empty-state .icon {
            font-size: 3rem;
            margin-bottom: 8px;
        }

        .empty-state p {
            font-size: 0.95rem;
            max-width: 400px;
            line-height: 1.6;
        }

        @media (max-width: 640px) {
            .chat-container { padding: 12px; }
            .message { max-width: 90%; }
            .input-area { padding: 12px; }
            .input-wrapper { flex-direction: column; }
            .input-wrapper button { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>
            <span class="dot"></span>
            Pi Agent Chat
        </h1>
        <span class="status-badge" id="statusBadge">就绪</span>
    </div>

    <div class="chat-container" id="chatContainer">
        <div class="empty-state">
            <div class="icon">&#x1F916;</div>
            <p>你好！我是 Pi Agent 助手。<br>在下方输入任务，我将调用 AI 为你执行。</p>
        </div>
    </div>

    <div class="input-area">
        <div class="input-wrapper">
            <textarea
                id="messageInput"
                placeholder="输入任务，例如：帮我分析当前项目的代码结构..."
                rows="1"
                onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMessage()}"
            ></textarea>
            <button id="sendBtn" onclick="sendMessage()">发送</button>
        </div>
    </div>

    <script>
        const chatContainer = document.getElementById('chatContainer');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const statusBadge = document.getElementById('statusBadge');

        let sessionId = sessionStorage.getItem('pi_session_id');
        if (!sessionId) {
            sessionId = 'sess-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
            sessionStorage.setItem('pi_session_id', sessionId);
        }

        let isStreaming = false;
        let currentAiBubble = null;
        let eventSource = null;

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message || isStreaming) return;

            const emptyState = chatContainer.querySelector('.empty-state');
            if (emptyState) emptyState.remove();

            appendMessage('user', message);
            messageInput.value = '';
            messageInput.style.height = 'auto';

            currentAiBubble = appendMessage('ai', '', true);

            isStreaming = true;
            sendBtn.disabled = true;
            setStatus('思考中...', 'thinking');

            const params = new URLSearchParams({ message: message, session_id: sessionId });
            eventSource = new EventSource('/chat?' + params.toString());

            eventSource.addEventListener('delta', (e) => {
                const data = JSON.parse(e.data);
                if (currentAiBubble && data.text) {
                    const bubble = currentAiBubble.querySelector('.bubble');
                    bubble.textContent += data.text;
                    scrollToBottom();
                }
            });

            eventSource.addEventListener('thinking', (e) => {
                setStatus('深度思考中...', 'thinking');
            });

            eventSource.addEventListener('tool_start', (e) => {
                const data = JSON.parse(e.data);
                appendToolIndicator('🔧 正在执行: ' + data.name, true);
            });

            eventSource.addEventListener('tool_end', (e) => {
                removeToolIndicators();
                const data = JSON.parse(e.data);
                appendToolIndicator('✅ 完成: ' + data.name);
            });

            eventSource.addEventListener('tool_exec', (e) => {
                const data = JSON.parse(e.data);
                appendToolIndicator('⚡ 执行中: ' + data.name, true);
            });

            eventSource.addEventListener('done', () => {
                setStatus('就绪', 'ready');
                finishStreaming();
            });

            eventSource.addEventListener('error', (e) => {
                try {
                    const data = JSON.parse(e.data);
                    if (currentAiBubble) {
                        const bubble = currentAiBubble.querySelector('.bubble');
                        if (!bubble.textContent) {
                            bubble.textContent = '❌ 错误: ' + (data.message || '未知错误');
                        }
                    }
                } catch (_) {}
                setStatus('错误', 'error');
                finishStreaming();
            });

            eventSource.addEventListener('close', () => {
                finishStreaming();
            });

            eventSource.onerror = () => {
                setStatus('连接断开', 'error');
                finishStreaming();
            };
        }

        function finishStreaming() {
            isStreaming = false;
            sendBtn.disabled = false;
            if (eventSource) {
                eventSource.close();
                eventSource = null;
            }
            if (currentAiBubble) {
                currentAiBubble.querySelector('.bubble').classList.remove('streaming');
            }
            currentAiBubble = null;
            removeSpinningTools();
            messageInput.focus();
        }

        function appendMessage(role, text, streaming) {
            streaming = streaming || false;
            const div = document.createElement('div');
            div.className = 'message ' + role;
            div.innerHTML = '<div class="bubble' + (streaming ? ' streaming' : '') + '">' + escapeHtml(text) + '</div>';
            chatContainer.appendChild(div);
            scrollToBottom();
            return div;
        }

        function appendToolIndicator(text, spinning) {
            spinning = spinning || false;
            removeSpinningTools();
            const div = document.createElement('div');
            div.className = 'tool-indicator' + (spinning ? ' spinning' : '');
            div.innerHTML = (spinning ? '<div class="spinner"></div>' : '') + escapeHtml(text);
            chatContainer.appendChild(div);
            scrollToBottom();
            return div;
        }

        function removeToolIndicators() {
            chatContainer.querySelectorAll('.tool-indicator').forEach(function(el) { el.remove(); });
        }

        function removeSpinningTools() {
            chatContainer.querySelectorAll('.tool-indicator.spinning').forEach(function(el) { el.remove(); });
        }

        function setStatus(text, type) {
            statusBadge.textContent = text;
            statusBadge.className = 'status-badge status-' + type;
        }

        function scrollToBottom() {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        messageInput.addEventListener('input', function() {
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
        });
    </script>
</body>
</html>
HTML;
    }
}
