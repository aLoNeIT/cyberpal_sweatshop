<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\CsUser;
use Psr\Log\LoggerInterface;

/**
 * 用户 Profile 服务
 *
 * 提供个人资料的读取和更新。用户统一存于 cs_user（usr_app_type=4）。
 * 对外 API 沿用 display_name / email 字段名，内部映射到 cs_user 的
 * usr_real_name / usr_account。
 */
class ProfileService
{
    public function __construct(
        private LoggerInterface $logger,
    ) {
    }

    /**
     * 获取用户 Profile
     *
     * @param int $userId cs_user.usr_id
     * @return array|null
     */
    public function getProfile(int $userId): ?array
    {
        $user = CsUser::query()->find($userId);
        if ($user === null) {
            return null;
        }

        return $this->toArray($user);
    }

    /**
     * 更新用户 Profile
     *
     * 只更新传入的非 null 字段。
     *
     * @param int   $userId cs_user.usr_id
     * @param array $data   可包含：display_name / theme_pref / auto_archive_enabled / auto_archive_days
     * @return array 更新后的完整 Profile
     */
    public function updateProfile(int $userId, array $data): array
    {
        $user = CsUser::query()->find($userId);
        if ($user === null) {
            throw new \RuntimeException('用户不存在');
        }

        // 对外字段名 → cs_user 列名
        $fieldMap = [
            'display_name'         => 'usr_real_name',
            'theme_pref'           => 'theme_pref',
            'auto_archive_enabled' => 'auto_archive_enabled',
            'auto_archive_days'    => 'auto_archive_days',
        ];

        foreach ($fieldMap as $apiField => $column) {
            if (array_key_exists($apiField, $data)) {
                $user->{$column} = $data[$apiField];
            }
        }

        $user->usr_update_time = time();
        $user->save();

        $this->logger->info('[Profile] Updated', ['user_id' => $userId]);

        return $this->toArray($user);
    }

    /**
     * 将 CsUser 模型转为对外 Profile 数组
     */
    private function toArray(CsUser $user): array
    {
        return [
            'id'                   => $user->usr_id,
            'email'                => $user->usr_account,
            'display_name'         => $user->usr_real_name ?? '',
            'theme_pref'           => $user->theme_pref ?? 'system',
            'auto_archive_enabled' => (bool) ($user->auto_archive_enabled ?? true),
            'auto_archive_days'    => (int) ($user->auto_archive_days ?? 30),
            'created_at'           => $user->usr_create_time,
            'updated_at'           => $user->usr_update_time,
        ];
    }
}
