<?php

declare(strict_types=1);

namespace App\Model;

use Hyperf\Database\Model\SoftDeletes;

/**
 * 用户模型（同时也是租户）
 *
 * 对应架构文档 §3.1 users 表。
 * 首版单用户租户：tenant_id == user_id。
 *
 * @property int         $id
 * @property string      $email
 * @property string      $password_hash
 * @property string|null $display_name
 * @property string      $theme_pref           light|dark|system
 * @property int         $auto_archive_enabled 0|1，默认 1
 * @property int         $auto_archive_days    默认 30
 * @property string      $created_at
 * @property string      $updated_at
 */
class User extends Model
{
    /**
     * The table associated with the model.
     */
    protected ?string $table = 'users';

    /**
     * The attributes that are mass assignable.
     */
    protected array $fillable = [
        'email',
        'password_hash',
        'display_name',
        'theme_pref',
        'auto_archive_enabled',
        'auto_archive_days',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected array $hidden = [
        'password_hash',
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected array $casts = [
        'id'                   => 'integer',
        'auto_archive_enabled' => 'integer',
        'auto_archive_days'    => 'integer',
    ];

    /**
     * 默认属性值
     */
    protected array $attributes = [
        'theme_pref'           => 'system',
        'auto_archive_enabled' => 1,
        'auto_archive_days'    => 30,
    ];
}
