<?php

declare(strict_types=1);

namespace app\http\admin\controller\v1;

use app\common\util\Helper;
use app\common\util\JsonTable;
use app\http\admin\controller\BaseController;
use Hyperf\DbConnection\Db;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;
use Throwable;

/**
 * 计费大盘 (MN0403) — 全平台用量与费用聚合展示
 *
 * 依据 09-admin-ops-modules PRD §FR-3：
 *   - 超管/运营/客服均可查看
 *   - 仅展示聚合数据，不钻取会话内容、不做扣费
 */
class BillingController extends BaseController
{
    protected int $dictId = 0;

    /**
     * 计费大盘汇总 + 时间趋势 + Top 排名。
     */
    public function index(): JsonTable|PsrResponseInterface
    {
        try {
            // --- 全平台汇总 ---
            $summary = (array) Db::table('billing_records')
                ->where('delete_time', 0)
                ->select([
                    Db::raw('COALESCE(SUM(input_tokens), 0)   AS total_input'),
                    Db::raw('COALESCE(SUM(output_tokens), 0)  AS total_output'),
                    Db::raw('COALESCE(SUM(cache_read_tokens), 0)  AS total_cache_read'),
                    Db::raw('COALESCE(SUM(cache_write_tokens), 0) AS total_cache_write'),
                    Db::raw('ROUND(COALESCE(SUM(cost_estimate), 0), 4) AS total_cost'),
                    Db::raw('COUNT(DISTINCT user_id) AS user_count'),
                ])
                ->first();

            // --- 用户 Top 10 ---
            $topUsers = Db::table('billing_records AS br')
                ->leftJoin('user AS u', 'u.usr_id', '=', 'br.user_id')
                ->where('br.delete_time', 0)
                ->groupBy('br.user_id', 'u.usr_account', 'u.usr_real_name')
                ->select([
                    'br.user_id',
                    'u.usr_account AS account',
                    'u.usr_real_name AS name',
                    Db::raw('COALESCE(SUM(input_tokens), 0) + COALESCE(SUM(output_tokens), 0) AS total_tokens'),
                    Db::raw('ROUND(COALESCE(SUM(cost_estimate), 0), 4) AS total_cost'),
                ])
                ->orderByDesc('total_tokens')
                ->limit(10)
                ->get()
                ->toArray();

            // --- Provider 分布 ---
            $providerDist = Db::table('billing_records')
                ->where('delete_time', 0)
                ->groupBy('provider')
                ->select([
                    'provider',
                    Db::raw('SUM(input_tokens + output_tokens) AS total_tokens'),
                    Db::raw('ROUND(SUM(cost_estimate), 4) AS total_cost'),
                ])
                ->orderByDesc('total_tokens')
                ->get()
                ->toArray();

            return JsonTable::withSuccess('获取成功', [
                'summary'       => $summary,
                'top_users'     => $topUsers,
                'provider_dist' => $providerDist,
            ]);
        } catch (Throwable $ex) {
            return Helper::logListenException(static::class, __FUNCTION__, $ex);
        }
    }
}
