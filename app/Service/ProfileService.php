<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\User;
use Psr\Log\LoggerInterface;

/**
 * 用户 Profile 服务
 *
 * 提供个人资料的读取和更新。
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
     * @param int $userId 租户 ID
     * @return array|null
     */
    public function getProfile(int $userId): ?array
    {
        $user = User::query()->find($userId);
        if ($user === null) {
            return null;
        }

        return [
            'id'                   => $user->id,
            'email'                => $user->email,
            'display_name'         => $user->display_name ?? '',
            'theme_pref'           => $user->theme_pref ?? 'system',
            'auto_archive_enabled' => (bool) ($user->auto_archive_enabled ?? true),
            'auto_archive_days'    => (int) ($user->auto_archive_days ?? 30),
            'created_at'           => $user->created_at,
            'updated_at'           => $user->updated_at,
        ];
    }

    /**
     * 更新用户 Profile
     *
     * 只更新传入的非 null 字段。
     *
     * @param int   $userId 租户 ID
     * @param array $data   可包含：display_name / theme_pref / auto_archive_enabled / auto_archive_days
     * @return array 更新后的完整 Profile
     */
    public function updateProfile(int $userId, array $data): array
    {
        $user = User::query()->find($userId);
        if ($user === null) {
            throw new \RuntimeException('用户不存在');
        }

        $updatable = ['display_name', 'theme_pref', 'auto_archive_enabled', 'auto_archive_days'];

        foreach ($updatable as $field) {
            if (array_key_exists($field, $data)) {
                $user->{$field} = $data[$field];
            }
        }

        $user->save();

        $this->logger->info('[Profile] Updated', ['user_id' => $userId]);

        return $this->getProfile($userId);
    }
}
