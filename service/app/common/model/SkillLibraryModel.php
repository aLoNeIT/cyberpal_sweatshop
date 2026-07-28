<?php

declare(strict_types=1);

namespace app\common\model;

/**
 * Skill 库模型（对应 cs_skill_library 表）
 *
 * tablename = "SkillLibrary" → Helper::model("SkillLibrary") → SkillLibraryModel
 */
class SkillLibraryModel extends BaseModel
{
    protected ?string $table = 'skill_library';
    protected string $primaryKey = 'id';
    protected string $keyType = 'string';
    public bool $incrementing = false;
    public bool $timestamps = false;

    protected array $fillable = [
        'id',
        'name',
        'description',
        'category',
        'path',
        'enabled',
        'create_time',
        'update_time',
    ];
}
