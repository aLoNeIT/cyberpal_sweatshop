<?php

declare(strict_types=1);

namespace App\Model;

use Hyperf\Database\Model\SoftDeletes;

/**
 * 计费记录模型
 *
 * 对应架构文档 §3.6 billing_records 表。
 *
 * 时间戳：create_time / update_time / delete_time 均为 BIGINT 秒级时间戳（项目统一约定）。
 *
 * @property int    $id
 * @property int    $user_id           租户
 * @property string $session_id        所属会话
 * @property string $agent_id          所属 Agent
 * @property string $model             模型
 * @property string $provider          提供商
 * @property int    $input_tokens      输入 token
 * @property int    $output_tokens     输出 token
 * @property int    $cache_read_tokens 缓存读取 token
 * @property int    $cache_write_tokens 缓存写入 token
 * @property float  $cost_estimate     估算费用（USD）
 * @property string $source            数据来源 usage|estimate|provider_api
 * @property int    $create_time 创建时间（秒级时间戳）
 * @property int    $update_time 更新时间（秒级时间戳）
 * @property int    $delete_time 删除时间（软删，秒级时间戳）
 */
class BillingRecord extends Model
{
    use SoftDeletes;

    protected ?string $table = 'billing_records';

    public const CREATED_AT = 'create_time';
    public const UPDATED_AT = 'update_time';
    public const DELETED_AT = 'delete_time';

    protected array $fillable = [
        'user_id',
        'session_id',
        'agent_id',
        'model',
        'provider',
        'input_tokens',
        'output_tokens',
        'cache_read_tokens',
        'cache_write_tokens',
        'cost_estimate',
        'source',
    ];

    protected array $casts = [
        'id'                => 'integer',
        'user_id'           => 'integer',
        'input_tokens'      => 'integer',
        'output_tokens'     => 'integer',
        'cache_read_tokens' => 'integer',
        'cache_write_tokens'=> 'integer',
        'cost_estimate'     => 'float',
    ];
}
