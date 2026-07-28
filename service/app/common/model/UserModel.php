<?php

declare(strict_types=1);

namespace app\common\model;

/**
 * 用户模型（对应 cs_user 表）
 *
 * 供 DictCrudController 的 DictLogic::getModel 使用。
 * tablename = "User" → Helper::model("User") → UserModel → 表 "user" + DB_PREFIX cs_
 */
class UserModel extends BaseModel
{
    protected ?string $table = 'user';
    protected string $primaryKey = 'usr_id';
    public bool $timestamps = false;

    protected array $fillable = [
        'usr_app_type',
        'usr_account',
        'usr_pwd',
        'usr_salt',
        'usr_real_name',
        'usr_state',
        'theme_pref',
        'auto_archive_enabled',
        'auto_archive_days',
        'usr_create_time',
        'usr_update_time',
    ];
}
