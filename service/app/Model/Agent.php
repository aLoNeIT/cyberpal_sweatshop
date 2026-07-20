<?php

declare(strict_types=1);

namespace App\Model;

use Hyperf\Database\Model\Relations\BelongsToMany;
use Hyperf\Database\Model\Relations\HasMany;

/**
 * Agent 模型
 *
 * 对应架构文档 §3.2 agents 表。
 * 主键使用 UUID 字符串。
 *
 * @property string      $id                   UUID
 * @property int         $user_id              租户归属
 * @property string      $name                 Agent 名称
 * @property string|null $description          描述
 * @property string|null $system_prompt        系统提示词
 * @property string|null $append_system_prompt 追加系统提示词
 * @property string      $provider             LLM 提供商
 * @property string      $model                模型名
 * @property string      $thinking             思考深度
 * @property string|null $tools_whitelist      工具白名单（逗号分隔）
 * @property string|null $tools_blacklist      工具黑名单（逗号分隔）
 * @property string      $profile_name         OMP --profile 值
 * @property string      $status               offline|online|error
 * @property string      $created_at
 * @property string      $updated_at
 */
class Agent extends Model
{
    protected ?string $table = 'agents';

    /** 主键非自增，类型为 string */
    protected string $keyType = 'string';
    public bool $incrementing = false;

    protected array $fillable = [
        'id',
        'user_id',
        'name',
        'description',
        'system_prompt',
        'append_system_prompt',
        'provider',
        'model',
        'thinking',
        'tools_whitelist',
        'tools_blacklist',
        'profile_name',
        'status',
    ];

    protected array $casts = [
        'id'     => 'string',
        'user_id' => 'integer',
    ];

    protected array $attributes = [
        'provider' => 'openai',
        'thinking' => 'medium',
        'status'   => 'offline',
    ];

    // ──────────────────────────────────────────────
    //  关联关系
    // ──────────────────────────────────────────────

    /**
     * 已挂载的 Skill（多对多，通过 agent_skill）
     */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(
            SkillLibrary::class,
            'agent_skill',
            'agent_id',
            'skill_id'
        );
    }

    /**
     * MCP 配置（一对多）
     */
    public function mcpConfigs(): HasMany
    {
        return $this->hasMany(McpConfig::class, 'agent_id', 'id');
    }
}
