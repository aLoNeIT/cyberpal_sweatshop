<?php

declare(strict_types=1);

namespace App\Controller;

use App\Model\User;
use App\Service\AuthService;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;
use Psr\Log\LoggerInterface;

/**
 * 账号认证控制器
 *
 * 对应架构文档 §4.1 的 /api/auth/* 端点。
 * 提供注册、登录、登出、查询当前用户功能。
 */
class AuthController extends AbstractController
{
    #[Inject]
    private AuthService $authService;

    #[Inject]
    private LoggerInterface $logger;

    /**
     * 用户注册
     *
     * POST /api/auth/register
     * Body: { "email": "...", "password": "...", "display_name": "..." }
     */
    public function register(RequestInterface $request, ResponseInterface $response)
    {
        $email    = trim($request->input('email', ''));
        $password = $request->input('password', '');
        $display  = trim($request->input('display_name', ''));

        // 手动校验（避免引入 hyperf/validation 依赖）
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->error($response, '请输入有效的邮箱地址', 422);
        }
        if (strlen($email) > 191) {
            return $this->error($response, '邮箱长度不能超过 191 个字符', 422);
        }
        if (strlen($password) < 6) {
            return $this->error($response, '密码长度不能少于 6 位', 422);
        }
        if (strlen($password) > 128) {
            return $this->error($response, '密码长度不能超过 128 位', 422);
        }
        if ($display !== '' && mb_strlen($display) > 64) {
            return $this->error($response, '显示名称不能超过 64 个字符', 422);
        }

        // 检查邮箱是否已注册
        $existing = User::query()->where('email', $email)->first();
        if ($existing !== null) {
            return $this->error($response, '该邮箱已被注册', 409);
        }

        // 创建用户
        $user = User::create([
            'email'         => $email,
            'password_hash' => $this->authService->hashPassword($password),
            'display_name'  => $display,
        ]);

        $this->logger->info('[Auth] User registered', ['user_id' => $user->id]);

        // 签发 JWT
        $token = $this->authService->issueToken($user);

        return $this->success($response, [
            'token' => $token,
            'user'  => $this->formatUser($user),
        ], '注册成功');
    }

    /**
     * 用户登录
     *
     * POST /api/auth/login
     * Body: { "email": "...", "password": "..." }
     */
    public function login(RequestInterface $request, ResponseInterface $response)
    {
        $email    = trim($request->input('email', ''));
        $password = $request->input('password', '');

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->error($response, '请输入有效的邮箱地址', 422);
        }
        if ($password === '') {
            return $this->error($response, '请输入密码', 422);
        }

        $user = User::query()->where('email', $email)->first();
        if ($user === null || !$this->authService->verifyPassword($password, $user->password_hash)) {
            return $this->error($response, '邮箱或密码错误', 401);
        }

        $this->logger->info('[Auth] User logged in', ['user_id' => $user->id]);

        $token = $this->authService->issueToken($user);

        return $this->success($response, [
            'token' => $token,
            'user'  => $this->formatUser($user),
        ], '登录成功');
    }

    /**
     * 用户登出（客户端丢弃 token 即可，服务端无状态）
     *
     * POST /api/auth/logout
     */
    public function logout(RequestInterface $request, ResponseInterface $response)
    {
        // JWT 无状态，登出只需客户端丢弃 token。
        // 若后续引入黑名单机制，可在此将 token 加入 Redis 黑名单。
        $userId = $request->getAttribute('user_id', 0);
        $this->logger->info('[Auth] User logged out', ['user_id' => $userId]);

        return $this->success($response, null, '已登出');
    }

    /**
     * 查询当前登录用户信息
     *
     * GET /api/auth/me
     */
    public function me(RequestInterface $request, ResponseInterface $response)
    {
        $userId = $request->getAttribute('user_id', 0);

        $user = User::query()->find($userId);
        if ($user === null) {
            return $this->error($response, '用户不存在', 404);
        }

        return $this->success($response, [
            'user' => $this->formatUser($user),
        ]);
    }

    // ──────────────────────────────────────────────
    //  辅助方法
    // ──────────────────────────────────────────────

    /**
     * 格式化用户数据（去除敏感字段）
     */
    private function formatUser(User $user): array
    {
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
     * 统一成功响应
     */
    private function success(ResponseInterface $response, mixed $data, string $message = 'ok')
    {
        return $response->json([
            'code'    => 0,
            'data'    => $data,
            'message' => $message,
        ]);
    }

    /**
     * 统一错误响应
     */
    private function error(ResponseInterface $response, string $message, int $code = 400)
    {
        return $response->json([
            'code'    => $code,
            'data'    => null,
            'message' => $message,
        ])->withStatus($code >= 100 && $code < 600 ? $code : 400);
    }
}
