<?php

declare(strict_types=1);

namespace App\Model;

/**
 * Agent-Skill 多对多关联模型
 *
 * 对应架构文档 §3.9 agent_skill 表。
 *
 * @property int    $id
 * @property string $agent_id Agent ID
 * @property string $skill_id Skill ID
 */
class AgentSkill extends Model
{
    protected ?string $table = 'agent_skill';

    public const CREATED_AT = null;
    public const UPDATED_AT = null;
    public bool $timestamps = false;

    protected array $fillable = [
        'agent_id',
        'skill_id',
    ];

    protected array $casts = [
        'id' => 'integer',
    ];
}
