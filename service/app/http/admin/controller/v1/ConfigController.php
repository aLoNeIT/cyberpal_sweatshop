<?php

declare(strict_types=1);

namespace app\http\admin\controller\v1;

use app\common\annotation\PermissionAnnotation;
use app\common\util\Helper;
use app\common\util\JsonTable;
use app\http\admin\controller\BaseController;
use Hyperf\DbConnection\Db;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;
use Throwable;

/**
 * 全局配置 (MN0503) — cs_system_config KV 管理
 *
 * 依据 09-admin-ops-modules PRD §FR-4：
 *   - 仅超管可查看 + 编辑
 *   - 支持四组配置：自动归档开关/天数、活跃/归档会话上限
 */
class ConfigController extends BaseController
{
    protected int $dictId = 0;

    /**
     * 获取当前全部全局配置。
     */
    public function index(): JsonTable|PsrResponseInterface
    {
        try {
            $rows = Db::table('system_config')
                ->where('delete_time', 0)
                ->get(['cfg_id', 'cfg_key', 'cfg_value', 'cfg_type', 'cfg_group', 'cfg_remark']);

            // 解析 JSON value
            $config = [];
            foreach ($rows as $row) {
                $row = (array) $row;
                $val = $row['cfg_value'];
                if (\is_string($val)) {
                    $decoded = \json_decode($val, true);
                    $val = $decoded !== null ? $decoded : $val;
                }
                $config[$row['cfg_key']] = [
                    'value'  => $val,
                    'type'   => $row['cfg_type'],
                    'group'  => $row['cfg_group'],
                    'remark' => $row['cfg_remark'],
                ];
            }

            return JsonTable::withSuccess('获取成功', $config);
        } catch (Throwable $ex) {
            return Helper::logListenException(static::class, __FUNCTION__, $ex);
        }
    }

    /**
     * 更新全局配置（09 FR-4.3 写 cs_system_record 审计）。
     */
    #[PermissionAnnotation(code: '050301')]
    public function save(): JsonTable|PsrResponseInterface
    {
        try {
            $raw  = $this->request->post();
            $items = $raw['items'] ?? [];

            if (! \is_array($items) || empty($items)) {
                return JsonTable::withError('配置项不能为空');
            }

            $allowedKeys = ['auto_archive_enabled', 'auto_archive_days', 'active_session_limit', 'archived_session_limit'];
            $userId = $this->sessionLogic->getUser();

            foreach ($items as $key => $value) {
                if (! \in_array($key, $allowedKeys, true)) {
                    continue;
                }

                $jsonValue = \is_scalar($value) ? \json_encode($value, \JSON_UNESCAPED_UNICODE) : \json_encode($value, \JSON_UNESCAPED_UNICODE);

                Db::table('system_config')
                    ->where('cfg_key', $key)
                    ->update([
                        'cfg_value'   => $jsonValue,
                        'update_time' => \time(),
                    ]);

                // 写审计记录（09 FR-4.3）
                Db::table('system_record')->insert([
                    'sr_title'       => '全局配置变更',
                    'sr_field'       => $key,
                    'sr_value'       => (string) $value,
                    'sr_extend'      => \json_encode(['operator' => $userId], \JSON_UNESCAPED_UNICODE),
                    'sr_create_user' => $userId,
                    'sr_create_time' => \time(),
                ]);
            }

            return JsonTable::withSuccess('全局配置已更新');
        } catch (Throwable $ex) {
            return Helper::logListenException(static::class, __FUNCTION__, $ex);
        }
    }
}
