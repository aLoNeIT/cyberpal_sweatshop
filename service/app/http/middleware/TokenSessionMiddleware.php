<?php

declare(strict_types=1);

namespace app\http\middleware;

use app\common\util\TokenSessionManager;
use Carbon\Carbon;
use Hyperf\Contract\ConfigInterface;
use Hyperf\Contract\SessionInterface;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpMessage\Cookie\Cookie;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/**
 * 自定义会话中间件。
 */
class TokenSessionMiddleware implements MiddlewareInterface
{
    /**
     * 自定义会话管理器。
     */
    #[Inject]
    protected TokenSessionManager $sessionManager;

    /**
     * 配置读取器。
     */
    #[Inject]
    protected ConfigInterface $config;

    /**
     * 处理请求并维护会话上下文。
     *
     * @param ServerRequestInterface $request 当前请求对象
     * @param RequestHandlerInterface $handler 下游请求处理器
     * @return ResponseInterface 响应对象
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if (! $this->isSessionAvailable()) {
            return $handler->handle($request);
        }

        $session = $this->sessionManager->start($request);

        try {
            $response = $handler->handle($request);
        } finally {
            $this->sessionManager->end($session);
        }

        return $this->addCookieToResponse($request, $response, $session);
    }

    /**
     * 判断 session 功能是否启用。
     *
     * @return bool 是否可用
     */
    protected function isSessionAvailable(): bool
    {
        return $this->config->has('session.handler');
    }

    /**
     * 获取 Cookie 过期时间。
     *
     * @return int Cookie 过期时间戳
     */
    protected function getCookieExpirationDate(): int
    {
        if ($this->config->get('session.options.expire_on_close')) {
            $expirationDate = 0;
        } else {
            $expireSeconds = $this->config->get('session.options.cookie_lifetime', 5 * 60 * 60);
            $expirationDate = Carbon::now()->addSeconds($expireSeconds)->getTimestamp();
        }

        return $expirationDate;
    }

    /**
     * 将会话 Cookie 写入响应。
     *
     * @param ServerRequestInterface $request 当前请求对象
     * @param ResponseInterface $response 响应对象
     * @param SessionInterface $session 当前会话对象
     * @return ResponseInterface 写入 Cookie 后的响应对象
     */
    protected function addCookieToResponse(
        ServerRequestInterface $request,
        ResponseInterface $response,
        SessionInterface $session
    ): ResponseInterface {
        $uri = $request->getUri();
        $path = '/';
        $secure = strtolower($uri->getScheme()) === 'https';
        $domain = $this->config->get('session.options.domain') ?? $uri->getHost();
        $sameSite = $this->config->get('session.options.cookie_same_site');

        $cookie = new Cookie($session->getName(), $session->getId(), $this->getCookieExpirationDate(), $path, $domain, $secure, true, false, $sameSite);
        if (! method_exists($response, 'withCookie')) {
            return $response->withHeader('Set-Cookie', (string) $cookie);
        }

        return $response->withCookie($cookie);
    }
}
