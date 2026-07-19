<?php

declare(strict_types=1);

namespace App\Model;

/**
 * 事件模型（结构化事件落库）
 *
 * 对应架构文档 §3.5 events 表。
 *
 * @property int    $id
 * @property string $session_id 所属会话
 * @property int|null $message_id 关联 message
 * @property string $event_type tool_call|usage|error|meta
 * @property int    $seq        会话内顺序
 * @property array  $payload    结构化数据
 * @property string $created_at
 */
class Event extends Model
{
    protected ?string $table = 'events';

    public const UPDATED_AT = null;

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
