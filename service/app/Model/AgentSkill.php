<?php

declare(strict_types=1);

namespace App\Model;

use Hyperf\Database\Model\SoftDeletes;

/**
 * Agent-Skill 多对多关联模型
 *
 * 对应架构文档 §3.9 agent_skill 表。
 *
 * 时间戳：create_time / update_time / delete_time 均为 BIGINT 秒级时间戳（项目统一约定）。
 *
 * @property int    $id
 * @property string $agent_id Agent ID
 * @property string $skill_id Skill ID
 * @property int    $create_time 创建时间（秒级时间戳）
 * @property int    $update_time 更新时间（秒级时间戳）
 * @property int    $delete_time 删除时间（软删，秒级时间戳）
 */
class AgentSkill extends Model
{
    use SoftDeletes;

    protected ?string $table = 'agent_skill';

    public const CREATED_AT = 'create_time';
    public const UPDATED_AT = 'update_time';
    public const DELETED_AT = 'delete_time';

    protected array $fillable = [
        'agent_id',
        'skill_id',
    ];

    protected array $casts = [
        'id' => 'integer',
    ];
}
