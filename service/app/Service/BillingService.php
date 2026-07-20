<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\BillingRecord;
use Hyperf\Database\Model\Collection;

/**
 * 计费查询服务
 *
 * 提供用量汇总、分模型明细、分页明细。
 * 对应架构文档 §4.1 的 /api/billing/* 端点背后的逻辑。
 */
class BillingService
{
    /**
     * 用量概览
     *
     * @param int    $userId  租户 ID
     * @param string $period  月份，如 '2025-07'，'current_month' 表示当月
     * @return array
     */
    public function getSummary(int $userId, string $period = 'current_month'): array
    {
        if ($period === 'current_month') {
            $period = date('Y-m');
        }

        [$start, $end] = $this->periodRange($period);

        $query = BillingRecord::query()
            ->where('user_id', $userId)
            ->whereBetween('created_at', [$start, $end]);

        // 汇总
        $totals = (clone $query)->selectRaw(
            'COALESCE(SUM(input_tokens), 0) as input_tokens,
             COALESCE(SUM(output_tokens), 0) as output_tokens,
             COALESCE(SUM(cache_read_tokens), 0) as cache_read_tokens,
             COALESCE(SUM(cache_write_tokens), 0) as cache_write_tokens,
             COALESCE(SUM(cost_estimate), 0) as cost_estimate_usd'
        )->first();

        // 分模型明细
        $byModel = (clone $query)->selectRaw(
            'model,
             COALESCE(SUM(input_tokens), 0) as input_tokens,
             COALESCE(SUM(output_tokens), 0) as output_tokens,
             COALESCE(SUM(cost_estimate), 0) as cost'
        )->groupBy('model')->get()->toArray();

        return [
            'period'            => $period,
            'input_tokens'      => (int) ($totals->input_tokens ?? 0),
            'output_tokens'     => (int) ($totals->output_tokens ?? 0),
            'cache_read_tokens' => (int) ($totals->cache_read_tokens ?? 0),
            'cache_write_tokens'=> (int) ($totals->cache_write_tokens ?? 0),
            'cost_estimate_usd' => (float) ($totals->cost_estimate_usd ?? 0),
            'by_model'          => $byModel,
        ];
    }

    /**
     * 计费明细分页
     *
     * @param int         $userId   租户 ID
     * @param array       $filters  { from, to, session_id, page, per_page }
     * @return array
     */
    public function getRecords(int $userId, array $filters = []): array
    {
        $page    = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));

        $query = BillingRecord::query()->where('user_id', $userId);

        // 时间范围
        if (!empty($filters['from'])) {
            $query->where('created_at', '>=', $filters['from']);
        }
        if (!empty($filters['to'])) {
            $query->where('created_at', '<=', $filters['to']);
        }

        // 按会话筛选
        if (!empty($filters['session_id'])) {
            $query->where('session_id', $filters['session_id']);
        }

        $query->orderBy('created_at', 'desc');

        $total   = $query->count();
        $records = $query->forPage($page, $perPage)->get();

        return [
            'items'    => $records->toArray(),
            'total'    => $total,
            'page'     => $page,
            'per_page' => $perPage,
        ];
    }

    /**
     * 将月份字符串转为起止时间
     *
     * @param string $period 如 '2025-07'
     * @return array{string, string}
     */
    private function periodRange(string $period): array
    {
        $start = $period . '-01 00:00:00';
        $end   = date('Y-m-t 23:59:59', strtotime($start));

        return [$start, $end];
    }
}
