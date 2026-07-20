<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Service\AuthService;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface as HttpResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerInterface;

/**
 * JWT 鉴权中间件
 *
 * 解析请求头中的 Bearer token，验证后将 user_id 注入到请求属性中。
 * 对应架构文档 §8.5 租户标识传递：
 *   JWT → JwtAuthMiddleware 解析出 user_id → 注入 request 属性 tenant_id。
 */
class JwtAuthMiddleware implements MiddlewareInterface
{
    #[Inject]
    private AuthService $authService;

    #[Inject]
    private LoggerInterface $logger;

    /**
     * 不需要鉴权的路径白名单
     */
    private const PUBLIC_PATHS = [
        '/api/auth/register',
        '/api/auth/login',
    ];

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $path = $request->getUri()->getPath();

        // 白名单路径直接放行
        foreach (self::PUBLIC_PATHS as $publicPath) {
            if ($path === $publicPath) {
                return $handler->handle($request);
            }
        }

        // 从 Authorization 头提取 Bearer token
        $authHeader = $request->getHeaderLine('Authorization');
        $token = '';

        if (!empty($authHeader) && str_starts_with($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
        }

        // 兜底：从 query `_token` 取值（SSE EventSource 不支持自定义 header）
        if (empty($token)) {
            $queryParams = $request->getQueryParams();
            $token = $queryParams['_token'] ?? '';
        }

        if (empty($token)) {
            return $this->unauthorized('缺少认证信息');
        }

        try {
            $payload = $this->authService->verifyToken($token);
        } catch (\RuntimeException $e) {
            return $this->unauthorized($e->getMessage());
        }

        $userId = $payload['user_id'];

        // 注入到请求属性（租户标识 == user_id）
        $request = $request->withAttribute('user_id', $userId);
        $request = $request->withAttribute('tenant_id', $userId);

        $this->logger->debug('[JWT] Authenticated', ['user_id' => $userId, 'path' => $path]);

        return $handler->handle($request);
    }

    /**
     * 返回 401 未授权响应
     */
    private function unauthorized(string $message): ResponseInterface
    {
        $response = new \Hyperf\HttpMessage\Server\Response();
        $body = json_encode([
            'code'    => 401,
            'data'    => null,
            'message' => $message,
        ], JSON_UNESCAPED_UNICODE);

        return $response
            ->withHeader('Content-Type', 'application/json; charset=utf-8')
            ->withStatus(401)
            ->withBody(new \Hyperf\HttpMessage\Stream\SwooleStream($body));
    }
}
