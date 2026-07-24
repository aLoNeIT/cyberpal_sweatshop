<?php

declare(strict_types=1);

namespace App\Model;

use Hyperf\Database\Model\SoftDeletes;

/**
 * 事件模型（结构化事件落库）
 *
 * 对应架构文档 §3.5 events 表。
 *
 * 时间戳：create_time / update_time / delete_time 均为 BIGINT 秒级时间戳（项目统一约定）。
 *
 * @property int    $id
 * @property string $session_id 所属会话
 * @property int|null $message_id 关联 message
 * @property string $event_type tool_call|usage|error|meta
 * @property int    $seq        会话内顺序
 * @property array  $payload    结构化数据
 * @property int    $create_time 创建时间（秒级时间戳）
 * @property int    $update_time 更新时间（秒级时间戳）
 * @property int    $delete_time 删除时间（软删，秒级时间戳）
 */
class Event extends Model
{
    use SoftDeletes;

    protected ?string $table = 'events';

    public const CREATED_AT = 'create_time';
    public const UPDATED_AT = 'update_time';
    public const DELETED_AT = 'delete_time';

    protected array $fillable = [
        'session_id',
        'message_id',
        'event_type',
        'seq',
        'payload',
    ];

    protected array $casts = [
        'id'         => 'integer',
        'message_id' => 'integer',
        'seq'        => 'integer',
        'payload'    => 'json',
    ];
}
