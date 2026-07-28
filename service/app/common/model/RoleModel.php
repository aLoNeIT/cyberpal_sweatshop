<?php

declare(strict_types=1);

namespace app\common\model;

/**
 * 角色模型（对应 cs_role 表）
 *
 * tablename = "Role" → Helper::model("Role") → RoleModel → 表 "role" + DB_PREFIX cs_
 */
class RoleModel extends BaseModel
{
    protected ?string $table = 'role';
    protected string $primaryKey = 'r_id';
    public bool $timestamps = false;

    protected array $fillable = [
        'r_app_type',
        'r_level',
        'r_systemed',
        'r_name',
        'r_mark',
        'r_parent',
        'r_state',
        'r_create_user',
        'r_create_time',
        'r_update_time',
    ];
}
