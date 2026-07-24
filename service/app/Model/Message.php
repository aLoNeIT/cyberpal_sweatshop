<?php

declare(strict_types=1);

namespace App\Model;

use Hyperf\Database\Model\SoftDeletes;

/**
 * 消息模型
 *
 * 对应架构文档 §3.4 messages 表。
 *
 * 时间戳：create_time / update_time / delete_time 均为 BIGINT 秒级时间戳（项目统一约定）。
 * 消息不可变，update_time 仅在建表语义上存在（写入后等于 create_time），业务不更新。
 *
 * @property int    $id
 * @property string $session_id 所属会话
 * @property string $role       user|assistant|system
 * @property string|null $content    正文
 * @property string|null $thinking   思考过程
 * @property int    $seq        会话内顺序
 * @property int    $create_time 创建时间（秒级时间戳）
 * @property int    $update_time 更新时间（秒级时间戳）
 * @property int    $delete_time 删除时间（软删，秒级时间戳）
 */
class Message extends Model
{
    use SoftDeletes;

    protected ?string $table = 'messages';

    public const CREATED_AT = 'create_time';
    public const UPDATED_AT = 'update_time';
    public const DELETED_AT = 'delete_time';

    protected array $fillable = [
        'session_id',
        'role',
        'content',
        'thinking',
        'seq',
    ];

    protected array $casts = [
        'id' => 'integer',
        'seq' => 'integer',
    ];
}
