<?php

declare(strict_types=1);

namespace App\Model;

/**
 * 会话模型
 *
 * 对应架构文档 §3.3 sessions 表。
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
 * @property string      $created_at
 * @property string      $updated_at
 * @property string|null $archived_at
 */
class Session extends Model
{
    protected ?string $table = 'sessions';

    protected string $keyType = 'string';
    public bool $incrementing = false;

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
        'archived_at',
    ];

    protected array $casts = [
        'id'            => 'string',
        'user_id'       => 'integer',
        'message_count' => 'integer',
        'last_usage'    => 'json',
    ];

    protected array $attributes = [
        'status'        => 'active',
        'mode'          => 'normal',
        'message_count' => 0,
    ];
}
