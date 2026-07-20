<?php

declare(strict_types=1);

namespace app\common\util;

use Hyperf\Session\SessionManager;
use Psr\Http\Message\ServerRequestInterface;

/**
 * 自定义会话管理器。
 *
 * 仅从请求头和 Cookie 中解析会话 ID，解析顺序为 header 优先，其次 cookie。
 */
class TokenSessionManager extends SessionManager
{
    /**
     * 解析会话 ID。
     *
     * 优先读取与 session_name 同名的请求头，其次读取同名 Cookie。
     * 不从请求体读取任何数据。
     *
     * @param ServerRequestInterface $request 当前请求对象
     * @return string|null 会话 ID
     */
    protected function parseSessionId(ServerRequestInterface $request): ?string
    {
        $sessionName = $this->getSessionName();
        $sessionId = $request->getHeaderLine($sessionName);
        if ($sessionId !== '') {
            return $sessionId;
        }

        $cookieSessionId = $request->getCookieParams()[$sessionName] ?? null;
        return $cookieSessionId !== null ? (string) $cookieSessionId : null;
    }
}
