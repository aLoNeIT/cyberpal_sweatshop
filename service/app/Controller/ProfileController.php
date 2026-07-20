<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\ProfileService;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;

/**
 * 用户 Profile 控制器
 *
 * GET /api/profile — 获取当前用户资料
 * PUT /api/profile — 更新资料（display_name / theme_pref / auto_archive 设置）
 */
class ProfileController extends AbstractController
{
    #[Inject]
    private ProfileService $profileService;

    /**
     * 获取当前用户 Profile
     *
     * GET /api/profile
     */
    public function show(RequestInterface $request, ResponseInterface $response)
    {
        $userId  = (int) $request->getAttribute('user_id', 0);
        $profile = $this->profileService->getProfile($userId);

        if ($profile === null) {
            return $this->error($response, '用户不存在', 404);
        }

        return $this->success($response, ['user' => $profile]);
    }

    /**
     * 更新用户 Profile
     *
     * PUT /api/profile
     * Body: { "display_name": "...", "theme_pref": "light|dark|system", "auto_archive_enabled": true, "auto_archive_days": 30 }
     */
    public function update(RequestInterface $request, ResponseInterface $response)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $data = [];
        if ($request->has('display_name')) {
            $dn = trim($request->input('display_name', ''));
            if (mb_strlen($dn) > 64) {
                return $this->error($response, '昵称不能超过 64 个字符', 422);
            }
            $data['display_name'] = $dn;
        }
        if ($request->has('theme_pref')) {
            $tp = $request->input('theme_pref');
            if (!in_array($tp, ['light', 'dark', 'system'], true)) {
                return $this->error($response, 'theme_pref 必须为 light/dark/system', 422);
            }
            $data['theme_pref'] = $tp;
        }
        if ($request->has('auto_archive_enabled')) {
            $data['auto_archive_enabled'] = (int) (bool) $request->input('auto_archive_enabled');
        }
        if ($request->has('auto_archive_days')) {
            $days = (int) $request->input('auto_archive_days');
            if ($days < 1 || $days > 365) {
                return $this->error($response, '归档天数必须在 1-365 之间', 422);
            }
            $data['auto_archive_days'] = $days;
        }

        if (empty($data)) {
            return $this->error($response, '无有效更新字段', 422);
        }

        try {
            $profile = $this->profileService->updateProfile($userId, $data);
            return $this->success($response, ['user' => $profile], '更新成功');
        } catch (\RuntimeException $e) {
            return $this->error($response, $e->getMessage(), 404);
        }
    }

    // ──────────────────────────────────────────────
    //  统一响应
    // ──────────────────────────────────────────────

    private function success(ResponseInterface $response, mixed $data, string $message = 'ok')
    {
        return $response->json([
            'code'    => 0,
            'data'    => $data,
            'message' => $message,
        ]);
    }

    private function error(ResponseInterface $response, string $message, int $code = 400)
    {
        return $response->json([
            'code'    => $code,
            'data'    => null,
            'message' => $message,
        ])->withStatus($code >= 100 && $code < 600 ? $code : 400);
    }
}
