<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\CsUser;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Hyperf\Contract\ConfigInterface;
use Psr\Log\LoggerInterface;
use RuntimeException;

/**
 * 账号认证服务
 *
 * 提供 bcrypt 密码哈希/校验、JWT 签发/验证。
 * 对应架构文档 §4.1 的 /api/auth/* 端点背后的逻辑。
 *
 * 用户统一存于 cs_user；JWT 的 user_id / sub 均使用 cs_user.usr_id。
 */
class AuthService
{
    /** JWT 签名算法 */
    private const ALGORITHM = 'HS256';

    /** bcrypt 哈希 cost */
    private const BCRYPT_COST = 12;

    private string $jwtSecret;
    private int $jwtTtl;
    private string $jwtIssuer;

    public function __construct(
        private ConfigInterface $config,
        private LoggerInterface $logger,
    ) {
        $this->jwtSecret = $this->config->get('jwt.secret', '');
        $this->jwtTtl     = (int) $this->config->get('jwt.ttl', 604800);
        $this->jwtIssuer  = $this->config->get('jwt.issuer', 'pi-agent');

        if (empty($this->jwtSecret)) {
            throw new RuntimeException('JWT secret is not configured.');
        }
    }

    // ──────────────────────────────────────────────
    //  密码哈希
    // ──────────────────────────────────────────────

    /**
     * 对明文密码进行 bcrypt 哈希
     *
     * @param string $password 明文密码
     * @return string 哈希后的密码
     */
    public function hashPassword(string $password): string
    {
        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => self::BCRYPT_COST]);
        if ($hash === false) {
            throw new RuntimeException('Password hashing failed.');
        }
        return $hash;
    }

    /**
     * 校验明文密码与哈希是否匹配
     *
     * @param string $password      明文密码
     * @param string $passwordHash  数据库中的哈希值（cs_user.usr_pwd，bcrypt）
     * @return bool 是否匹配
     */
    public function verifyPassword(string $password, string $passwordHash): bool
    {
        return password_verify($password, $passwordHash);
    }

    // ──────────────────────────────────────────────
    //  JWT 签发 / 验证
    // ──────────────────────────────────────────────

    /**
     * 为用户签发 JWT
     *
     * @param CsUser $user 用户模型实例
     * @return string JWT 字符串
     */
    public function issueToken(CsUser $user): string
    {
        $now = time();

        $payload = [
            'iss'        => $this->jwtIssuer,       // 签发者
            'iat'        => $now,                    // 签发时间
            'exp'        => $now + $this->jwtTtl,    // 过期时间
            'sub'        => (string) $user->usr_id,  // 主体 = usr_id
            'user_id'    => $user->usr_id,           // 业务字段
            'email'      => $user->usr_account,
            'app_type'   => $user->usr_app_type,
        ];

        $this->logger->info('[Auth] Issuing JWT', ['user_id' => $user->usr_id, 'email' => $user->usr_account]);

        return JWT::encode($payload, $this->jwtSecret, self::ALGORITHM);
    }

    /**
     * 验证并解码 JWT
     *
     * @param string $token JWT 字符串
     * @return array{user_id: int, email: string, sub: string} 解码后的 payload
     *
     * @throws RuntimeException 当 token 无效或过期时
     */
    public function verifyToken(string $token): array
    {
        try {
            $decoded = (array) JWT::decode($token, new Key($this->jwtSecret, self::ALGORITHM));
        } catch (\Firebase\JWT\ExpiredException $e) {
            $this->logger->warning('[Auth] JWT expired');
            throw new RuntimeException('Token has expired.', 401);
        } catch (\Throwable $e) {
            $this->logger->warning('[Auth] JWT invalid: ' . $e->getMessage());
            throw new RuntimeException('Invalid token.', 401);
        }

        if (!isset($decoded['user_id'])) {
            throw new RuntimeException('Token payload missing user_id.', 401);
        }

        return [
            'user_id' => (int) $decoded['user_id'],
            'email'   => $decoded['email'] ?? '',
            'sub'     => $decoded['sub'] ?? '',
        ];
    }
}
