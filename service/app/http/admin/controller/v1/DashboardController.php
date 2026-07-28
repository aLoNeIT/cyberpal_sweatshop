<?php

declare(strict_types=1);

namespace app\http\admin\controller\v1;

use app\common\util\JsonTable;
use app\http\admin\controller\BaseController;
use Hyperf\DbConnection\Db;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;

/**
 * Admin 首页仪表盘 (MN00 隐藏菜单子项)
 *
 * 提供全平台关键指标汇总卡片：
 *   - 用户总数 / 活跃用户数
 *   - Agent 总数 / 活跃 Agent 数
 *   - Session 总数 / 活跃 Session 数
 *   - 累计 Token / 估算费用
 */
class DashboardController extends BaseController
{
    protected int $dictId = 0;

    public function index(): JsonTable|PsrResponseInterface
    {
        $data = [
            'total_users'    => Db::table('user')->where('usr_app_type', 4)->where('usr_delete_time', 0)->count(),
            'active_users'   => Db::table('user')->where('usr_app_type', 4)->where('usr_state', 1)->where('usr_delete_time', 0)->count(),
            'total_agents'   => Db::table('agents')->where('delete_time', 0)->count(),
            'online_agents'  => Db::table('agents')->where('status', 'online')->where('delete_time', 0)->count(),
            'total_sessions' => Db::table('sessions')->where('delete_time', 0)->count(),
            'active_sessions'=> Db::table('sessions')->where('status', 'active')->where('delete_time', 0)->count(),
            'total_tokens'   => (int) Db::table('billing_records')->where('delete_time', 0)->sum(Db::raw('input_tokens + output_tokens')),
            'total_cost'     => \round((float) Db::table('billing_records')->where('delete_time', 0)->sum('cost_estimate'), 2),
        ];

        return JsonTable::withSuccess('获取成功', $data);
    }
}
