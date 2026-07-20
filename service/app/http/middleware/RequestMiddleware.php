<?php

declare(strict_types=1);

namespace app\http\middleware;

use app\common\constants\CommonConst;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/**
 * 请求应用信息中间件。
 *
 * 根据请求路径首节点识别当前应用，将应用类型与应用类型名称写入请求对象。
 */
class RequestMiddleware implements MiddlewareInterface
{
    /**
     * 处理请求并写入应用信息。
     *
     * @param ServerRequestInterface $request 当前请求对象
     * @param RequestHandlerInterface $handler 下游请求处理器
     * @return ResponseInterface 响应对象
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $appTypeName = $this->resolveAppTypeName($request);
        $appType = CommonConst::APP_TYPE_NAME_MAP[$appTypeName] ?? CommonConst::APP_TYPE_HOME;
        /** @var \Hyperf\HttpMessage\Server\Request $request */
        $request = $request
            ->setAttribute(CommonConst::REQUEST_ATTRIBUTE_APP_TYPE, $appType)
            ->setAttribute(CommonConst::REQUEST_ATTRIBUTE_APP_TYPE_NAME, CommonConst::APP_TYPE_MAP[$appType] ?? CommonConst::APP_TYPE_NAME_HOME);

        return $handler->handle($request);
    }

    /**
     * 解析请求路径首节点对应的应用类型名称。
     *
     * @param ServerRequestInterface $request 当前请求对象
     * @return string 应用类型名称
     */
    protected function resolveAppTypeName(ServerRequestInterface $request): string
    {
        $path = trim($request->getUri()->getPath(), '/');
        if ($path === '') {
            return CommonConst::APP_TYPE_NAME_HOME;
        }

        $segments = explode('/', $path);
        $appTypeName = (string) ($segments[0] ?? '');

        return array_key_exists($appTypeName, CommonConst::APP_TYPE_NAME_MAP)
            ? $appTypeName
            : CommonConst::APP_TYPE_NAME_HOME;
    }
}
