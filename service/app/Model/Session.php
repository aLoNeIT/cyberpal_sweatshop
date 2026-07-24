<?php

declare(strict_types=1);

namespace App\Model;

use Hyperf\Database\Model\SoftDeletes;

/**
 * 会话模型
 *
 * 对应架构文档 §3.3 sessions 表。
 *
 * 时间戳：create_time / update_time / delete_time 均为 BIGINT 秒级时间戳（项目统一约定）。
 *
 * @property string      $id                UUID
 * @property int         $user_id           租户归属
 * @property string      $agent_id          绑定 Agent
 * @property string|null $title             会话标题
 * @property string|null $omp_session_id    OMP 原生 session 文件 id
 * @property string      $status            active|archived|deleted
 * @property string      $mode              normal|resumed|forked
 * @property string|null $parent_session_id fork 来源
 * @property int         $message_count     消息计数
 * @property array|null  $last_usage        最近一次 usage 快照
 * @property int         $archived_time     归档时间（秒级时间戳，0=未归档）
 * @property int         $create_time       创建时间（秒级时间戳）
 * @property int         $update_time       更新时间（秒级时间戳）
 * @property int         $delete_time       删除时间（软删，秒级时间戳）
 */
class Session extends Model
{
    use SoftDeletes;

    protected ?string $table = 'sessions';

    protected string $keyType = 'string';
    public bool $incrementing = false;

    public const CREATED_AT = 'create_time';
    public const UPDATED_AT = 'update_time';
    public const DELETED_AT = 'delete_time';

    protected array $fillable = [
        'id',
        'user_id',
        'agent_id',
        'title',
        'omp_session_id',
        'status',
        'mode',
        'parent_session_id',
        'message_count',
        'last_usage',
        'archived_time',
    ];

    protected array $casts = [
        'id'            => 'string',
        'user_id'       => 'integer',
        'message_count' => 'integer',
        'last_usage'    => 'json',
        'archived_time' => 'integer',
    ];

    protected array $attributes = [
        'status'        => 'active',
        'mode'          => 'normal',
        'message_count' => 0,
    ];
}
