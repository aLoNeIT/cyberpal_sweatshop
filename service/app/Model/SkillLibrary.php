<?php

declare(strict_types=1);

namespace App\Model;

/**
 * Skill 库模型（平台托管）
 *
 * 对应架构文档 §3.7 skill_library 表。
 *
 * @property string $id          UUID
 * @property string $name        Skill 名称
 * @property string $description 描述
 * @property string $path        磁盘目录路径
 * @property int    $enabled     是否启用 0/1
 * @property string $created_at
 */
class SkillLibrary extends Model
{
    protected ?string $table = 'skill_library';

    protected string $keyType = 'string';
    public bool $incrementing = false;
    public const UPDATED_AT = null;

    protected array $fillable = [
        'id',
        'name',
        'description',
        'path',
        'enabled',
    ];

    protected array $casts = [
        'id'      => 'string',
        'enabled' => 'integer',
    ];

    protected array $attributes = [
        'enabled' => 1,
    ];
}
