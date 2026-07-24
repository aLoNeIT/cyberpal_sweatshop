<?php

declare(strict_types=1);

namespace App\Model;

/**
 * 用户模型（对应 cs_user 表，单一用户表）
 *
 * 设计约束（2026-07-22 裁定）：
 * - 全平台仅一张用户表 cs_user，由 usr_app_type 区分账户类型：
 *   0=首页; 1=管理后台(admin); 4=用户端(user); 7=开放平台(open_platform)。
 * - 不存在独立的 users / cs_users 表。早期 users 模型为代码漂移，已删除。
 * - 用户端登录/资料/偏好统一走本模型。
 *
 * 密码方案：用户端(app_type=4)使用 bcrypt，哈希存入 usr_pwd；usr_salt 对用户端登录不使用。
 * 管理后台(app_type=1)沿用框架盐值方案（usr_pwd + usr_salt），由独立登录链路处理。
 *
 * 时间列：cs_user 使用 BIGINT 的 usr_create_time / usr_update_time，非 Eloquent 默认
 * created_at/updated_at，故关闭 $timestamps 并手动维护。
 *
 * @property int    $usr_id
 * @property int    $usr_app_type        0=home;1=admin;4=user;7=open_platform
 * @property string $usr_account         登录账号（用户端即邮箱）
 * @property string $usr_pwd             密码哈希（用户端 bcrypt）
 * @property string $usr_salt            盐值（用户端登录未使用）
 * @property string $usr_real_name       显示名称
 * @property int    $usr_state           0=关闭 1=开启
 * @property string $theme_pref          light|dark|system
 * @property int    $auto_archive_enabled 0|1
 * @property int    $auto_archive_days
 * @property int    $usr_create_time
 * @property int    $usr_update_time
 */
class CsUser extends Model
{
    /**
     * 表名（DB_PREFIX=cs_ 时解析为 cs_user）。
     */
    protected ?string $table = 'user';

    /**
     * cs_user 使用 BIGINT 时间列，关闭 Eloquent 自动时间戳，手动维护。
     */
    public $timestamps = false;

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
    ];

    protected array $hidden = [
        'usr_pwd',
        'usr_salt',
    ];

    protected array $casts = [
        'usr_app_type'         => 'integer',
        'usr_state'            => 'integer',
        'auto_archive_enabled' => 'integer',
        'auto_archive_days'    => 'integer',
        'usr_create_time'      => 'integer',
        'usr_update_time'      => 'integer',
    ];

    protected array $attributes = [
        'usr_app_type'         => 4,
        'usr_state'            => 1,
        'usr_salt'             => '',
        'theme_pref'           => 'system',
        'auto_archive_enabled' => 1,
        'auto_archive_days'    => 30,
    ];
}
