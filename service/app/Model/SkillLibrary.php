<?php

declare(strict_types=1);

namespace App\Model;

use Hyperf\Database\Model\SoftDeletes;

/**
 * Skill 库模型（平台托管）
 *
 * 对应架构文档 §3.7 skill_library 表。
 *
 * 时间戳：create_time / update_time / delete_time 均为 BIGINT 秒级时间戳（项目统一约定）。
 *
 * @property string $id          UUID
 * @property string $name        Skill 名称
 * @property string $description 描述
 * @property string $path        磁盘目录路径
 * @property int    $enabled     是否启用 0/1
 * @property int    $create_time 创建时间（秒级时间戳）
 * @property int    $update_time 更新时间（秒级时间戳）
 * @property int    $delete_time 删除时间（软删，秒级时间戳）
 */
class SkillLibrary extends Model
{
    use SoftDeletes;

    protected ?string $table = 'skill_library';

    protected string $keyType = 'string';
    public bool $incrementing = false;

    public const CREATED_AT = 'create_time';
    public const UPDATED_AT = 'update_time';
    public const DELETED_AT = 'delete_time';

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
