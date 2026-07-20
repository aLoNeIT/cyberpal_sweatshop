<?php

declare(strict_types=1);

namespace app\http\middleware;

use app\common\constants\ErrCodeConst as ErrorCode;
use app\common\contract\SessionLogicContract;
use app\common\exception\AppException;
use FastRoute\Dispatcher;
use Hyperf\Contract\ConfigInterface;
use Hyperf\HttpServer\Router\Dispatched;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/**
 * 基于方法注解与白名单的接口权限中间件。
 */
class PermissionMiddleware implements MiddlewareInterface
{
    private const SKIP_LOGIN = 1;

    public function __construct(
        protected ConfigInterface $config,
        protected SessionLogicContract $sessionLogic
    ) {}

    /**
     * 执行权限校验。
     *
     * @param ServerRequestInterface $request 当前请求
     * @param RequestHandlerInterface $handler 下游处理器
     * @return ResponseInterface
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $target = $this->resolveTarget($request);
        if ($target === null) {
            return $handler->handle($request);
        }

        $whitelistValue = $this->matchedWhitelistValue($request->getUri()->getPath());
        if (! $this->shouldSkipLogin($whitelistValue) && ! $this->sessionLogic->logined()) {
            throw new AppException(ErrorCode::messageFor(ErrorCode::SESSION_INVALID), ErrorCode::SESSION_INVALID);
        }

        return $handler->handle($request);
    }

    /**
     * 解析当前请求对应的控制器方法。
     *
     * @param ServerRequestInterface $request 当前请求
     * @return array{0:string,1:string}|null
     */
    protected function resolveTarget(ServerRequestInterface $request): ?array
    {
        $dispatched = $request->getAttribute(Dispatched::class);
        if (! $dispatched instanceof Dispatched || $dispatched->status !== Dispatcher::FOUND || $dispatched->handler === null) {
            return null;
        }

        $callback = $dispatched->handler->callback;
        if (is_array($callback) && isset($callback[0], $callback[1]) && is_string($callback[0]) && is_string($callback[1])) {
            return [$callback[0], $callback[1]];
        }

        if (is_string($callback) && str_contains($callback, '::')) {
            /** @var array{0:string,1:string} $target */
            $target = explode('::', $callback, 2);

            return $target;
        }

        return null;
    }

    /**
     * 获取匹配请求路径的白名单位标记值。
     *
     * @param string $path 请求路径
     * @return int 白名单位标记值，未命中时返回 0
     */
    protected function matchedWhitelistValue(string $path): int
    {
        $whitelist = $this->config->get('permission.whitelist', []);
        if (! is_array($whitelist)) {
            return 0;
        }

        foreach ($whitelist as $pattern => $value) {
            if (! is_string($pattern) || $pattern === '') {
                continue;
            }

            if (preg_match($this->wildcardToRegex($pattern), $path) === 1) {
                return (int) $value;
            }
        }

        return 0;
    }

    /**
     * 将通配符模式转换为正则表达式。
     *
     * @param string $pattern 白名单模式
     * @return string
     */
    protected function wildcardToRegex(string $pattern): string
    {
        return '/^' . str_replace('\*', '.*', preg_quote($pattern, '/')) . '$/';
    }

    /**
     * 判断白名单位标记是否跳过登录校验。
     *
     * @param int $whitelistValue 白名单位标记值
     * @return bool 是否跳过登录校验
     */
    protected function shouldSkipLogin(int $whitelistValue): bool
    {
        return ($whitelistValue & self::SKIP_LOGIN) === self::SKIP_LOGIN;
    }
}
