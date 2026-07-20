<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Model\Agent;
use App\Model\Session;
use Hyperf\Di\Annotation\Inject;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerInterface;

/**
 * 租户归属校验中间件
 *
 * 对路径中包含 {agent_id} 或 {session_id} 的请求进行二次校验，
 * 确保当前用户是资源的合法所有者，杜绝越权访问。
 *
 * 对应架构文档 §8.5：
 *   TenantInjectMiddleware 对路径 {agent_id}/{session_id} 二次校验归属。
 *
 * 此中间件应在 JwtAuthMiddleware 之后执行（依赖 request attribute user_id）。
 */
class TenantInjectMiddleware implements MiddlewareInterface
{
    #[Inject]
    private LoggerInterface $logger;

    /**
     * 需要进行租户校验的路由参数名 → 对应 Model 类映射
     */
    private const RESOURCE_MAP = [
        'agent_id'   => Agent::class,
        'session_id' => Session::class,
        'id'         => null, // 用于 /agents/{id} 等，由实际路由决定
    ];

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $path     = $request->getUri()->getPath();
        $userId   = $request->getAttribute('user_id', 0);

        // 如果没有 user_id（未经过 JwtAuthMiddleware），直接放行
        if ($userId === 0) {
            return $handler->handle($request);
        }

        // 提取路由参数中的 agent_id
        $agentId = $this->extractRouteParam($request, 'agent_id');
        if ($agentId !== null) {
            if (!$this->validateAgentOwnership($agentId, $userId)) {
                return $this->forbidden('无权访问该 Agent');
            }
        }

        // 提取路由参数中的 session_id
        $sessionId = $this->extractRouteParam($request, 'session_id');
        if ($sessionId !== null) {
            if (!$this->validateSessionOwnership($sessionId, $userId)) {
                return $this->forbidden('无权访问该会话');
            }
        }

        // /api/agents/{id} 路由参数名可能是 "id" 而非 "agent_id"
        $agentById = $this->extractRouteParam($request, 'id');
        if ($agentById !== null && $this->isAgentRoute($path)) {
            if (!$this->validateAgentOwnership($agentById, $userId)) {
                return $this->forbidden('无权访问该 Agent');
            }
        }

        return $handler->handle($request);
    }

    /**
     * 校验 Agent 是否属于当前用户
     */
    private function validateAgentOwnership(string $agentId, int $userId): bool
    {
        $agent = Agent::query()->where('id', $agentId)->where('user_id', $userId)->first();
        if ($agent === null) {
            $this->logger->warning('[Tenant] Agent ownership mismatch', [
                'agent_id' => $agentId,
                'user_id'  => $userId,
            ]);
            return false;
        }
        return true;
    }

    /**
     * 校验 Session 是否属于当前用户
     */
    private function validateSessionOwnership(string $sessionId, int $userId): bool
    {
        $session = Session::query()->where('id', $sessionId)->where('user_id', $userId)->first();
        if ($session === null) {
            $this->logger->warning('[Tenant] Session ownership mismatch', [
                'session_id' => $sessionId,
                'user_id'    => $userId,
            ]);
            return false;
        }
        return true;
    }

    /**
     * 提取路由参数（兼容 Hyperf 的 attribute 存放方式）
     */
    private function extractRouteParam(ServerRequestInterface $request, string $name): ?string
    {
        $value = $request->getAttribute($name);
        if (is_string($value) && $value !== '') {
            return $value;
        }
        return null;
    }

    /**
     * 判断当前路径是否为 Agent 资源路由
     */
    private function isAgentRoute(string $path): bool
    {
        // /api/agents/{id} 或 /api/agents/{id}/... 形式
        return (bool) preg_match('#^/api/agents/[a-zA-Z0-9\-_]+#', $path);
    }

    /**
     * 返回 403 禁止访问响应
     */
    private function forbidden(string $message): ResponseInterface
    {
        $response = new \Hyperf\HttpMessage\Server\Response();
        $body = json_encode([
            'code'    => 403,
            'data'    => null,
            'message' => $message,
        ], JSON_UNESCAPED_UNICODE);

        return $response
            ->withHeader('Content-Type', 'application/json; charset=utf-8')
            ->withStatus(403)
            ->withBody(new \Hyperf\HttpMessage\Stream\SwooleStream($body));
    }
}
