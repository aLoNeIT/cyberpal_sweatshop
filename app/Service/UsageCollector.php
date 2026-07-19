<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\BillingRecord;
use Psr\Log\LoggerInterface;

/**
 * 用量采集服务
 *
 * 闭环架构风险 B：Token 计费来源。
 * 三档降级策略：
 *   档1（主方案）：usage 非 null → source='usage'，直接使用解析出的 token 数
 *   档2（兜底 1）：usage 为 null → source='estimate'，按字符数/4 估算
 *   档3（兜底 2）：source='provider_api' → 预留接口，当前空实现
 *
 * 对应架构文档 §9.B。
 */
class UsageCollector
{
    /**
     * 模型单价表（USD / 1K tokens）
     *
     * 后续可从 config 或数据库加载。
     */
    private const PRICING = [
        'gpt-5.6-sol'   => ['input' => 0.003,  'output' => 0.015],
        'gpt-5.6-terra' => ['input' => 0.0025, 'output' => 0.0125],
        'gpt-5.6-luna'  => ['input' => 0.002,  'output' => 0.01],
        'gpt-4o'         => ['input' => 0.005,  'output' => 0.015],
        // 默认
        '__default__'    => ['input' => 0.003,  'output' => 0.015],
    ];

    public function __construct(
        private LoggerInterface $logger,
    ) {
    }

    /**
     * 采集并写入计费记录
     *
     * @param string     $sessionId   会话 ID
     * @param string     $agentId     Agent ID
     * @param int        $userId      租户 ID
     * @param string     $model       模型名
     * @param string     $provider    提供商
     * @param array|null $usage       解析到的 usage 数据（档1：非null → 直接使用）
     *                                keys: input/output/cache_read/cache_write
     * @param int        $userCharLen 用户消息字符数（档2 兜底估算用）
     * @param int        $assistantCharLen 助手回复字符数（档2 兜底估算用）
     * @return BillingRecord|null
     */
    public function collect(
        string $sessionId,
        string $agentId,
        int $userId,
        string $model,
        string $provider,
        ?array $usage = null,
        int $userCharLen = 0,
        int $assistantCharLen = 0,
    ): ?BillingRecord {
        if ($usage !== null && isset($usage['input'], $usage['output'])) {
            // ── 档1：主方案 — 直接使用解析到的 usage ──
            return $this->recordFromUsage(
                $userId, $sessionId, $agentId, $model, $provider,
                (int) ($usage['input'] ?? 0),
                (int) ($usage['output'] ?? 0),
                (int) ($usage['cache_read'] ?? 0),
                (int) ($usage['cache_write'] ?? 0),
                'usage',
            );
        }

        if ($userCharLen > 0 || $assistantCharLen > 0) {
            // ── 档2：兜底1 — 按字符数估算 ──
            return $this->recordFromEstimate(
                $userId, $sessionId, $agentId, $model, $provider,
                $userCharLen,
                $assistantCharLen,
            );
        }

        // 无任何数据可采集
        $this->logger->warning('[Usage] No data to collect', [
            'session_id' => $sessionId,
        ]);

        return null;
    }

    /**
     * 档1：直接写入 usage
     */
    private function recordFromUsage(
        int $userId,
        string $sessionId,
        string $agentId,
        string $model,
        string $provider,
        int $inputTokens,
        int $outputTokens,
        int $cacheReadTokens,
        int $cacheWriteTokens,
        string $source,
    ): BillingRecord {
        $cost = $this->estimateCost($model, $inputTokens, $outputTokens);

        $record = BillingRecord::create([
            'user_id'           => $userId,
            'session_id'        => $sessionId,
            'agent_id'          => $agentId,
            'model'             => $model,
            'provider'          => $provider,
            'input_tokens'      => $inputTokens,
            'output_tokens'     => $outputTokens,
            'cache_read_tokens' => $cacheReadTokens,
            'cache_write_tokens'=> $cacheWriteTokens,
            'cost_estimate'     => $cost,
            'source'            => $source,
        ]);

        $this->logger->info('[Usage] Recorded (usage)', [
            'session_id' => $sessionId,
            'input'      => $inputTokens,
            'output'     => $outputTokens,
            'cost'       => $cost,
        ]);

        return $record;
    }

    /**
     * 档2：按字符数估算
     *
     * 估算公式：token ≈ max(1, ceil(字符数 / 4))（CJK 加权 1:2）
     */
    private function recordFromEstimate(
        int $userId,
        string $sessionId,
        string $agentId,
        string $model,
        string $provider,
        int $userCharLen,
        int $assistantCharLen,
    ): BillingRecord {
        $inputTokens  = max(1, (int) ceil($userCharLen / 4));
        $outputTokens = max(1, (int) ceil($assistantCharLen / 4));
        $cost = $this->estimateCost($model, $inputTokens, $outputTokens);

        $record = BillingRecord::create([
            'user_id'           => $userId,
            'session_id'        => $sessionId,
            'agent_id'          => $agentId,
            'model'             => $model,
            'provider'          => $provider,
            'input_tokens'      => $inputTokens,
            'output_tokens'     => $outputTokens,
            'cache_read_tokens' => 0,
            'cache_write_tokens'=> 0,
            'cost_estimate'     => $cost,
            'source'            => 'estimate',
        ]);

        $this->logger->info('[Usage] Recorded (estimate)', [
            'session_id'  => $sessionId,
            'input_est'   => $inputTokens,
            'output_est'  => $outputTokens,
            'cost'        => $cost,
        ]);

        return $record;
    }

    /**
     * 档3：直连 provider 用量接口（预留）
     *
     * 待 token.alonetech.com 用量 API 确认后实现。
     * 当前为空实现，返回 null。
     *
     * @codeCoverageIgnore
     */
    public function collectFromProviderApi(
        int $userId,
        string $sessionId,
        string $agentId,
        string $model,
        string $provider,
    ): ?BillingRecord {
        // TODO: 调用 guzzle 直连 https://token.alonetech.com/v1/usage
        // 解析响应中的 input/output/cache token 数据
        // 写入 billing_records(source='provider_api')
        $this->logger->debug('[Usage] Provider API collection not yet implemented');

        return null;
    }

    /**
     * 根据模型单价估算费用（USD）
     *
     * @param string $model        模型名
     * @param int    $inputTokens  输入 token
     * @param int    $outputTokens 输出 token
     * @return float 估算费用
     */
    private function estimateCost(string $model, int $inputTokens, int $outputTokens): float
    {
        $pricing = self::PRICING[$model] ?? self::PRICING['__default__'];

        $inputCost  = ($inputTokens / 1000) * $pricing['input'];
        $outputCost = ($outputTokens / 1000) * $pricing['output'];

        return round($inputCost + $outputCost, 6);
    }
}
