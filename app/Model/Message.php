<?php

declare(strict_types=1);

namespace App\Model;

/**
 * 消息模型
 *
 * 对应架构文档 §3.4 messages 表。
 *
 * @property int         $id
 * @property string      $session_id 所属会话
 * @property string      $role       user|assistant|system
 * @property string|null $content    正文
 * @property string|null $thinking   思考过程
 * @property int         $seq        会话内顺序
 * @property string      $created_at
 */
class Message extends Model
{
    protected ?string $table = 'messages';

    /** 消息没有 updated_at 字段 */
    public const UPDATED_AT = null;

    protected array $fillable = [
        'session_id',
        'role',
        'content',
        'thinking',
        'seq',
    ];

    protected array $casts = [
        'id'  => 'integer',
        'seq' => 'integer',
    ];
}
