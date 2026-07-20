<?php

declare(strict_types=1);

namespace app\http\middleware;

use app\common\util\JsonTable;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/**
 * 中间件基础类。
 */
abstract class BaseMiddleware implements MiddlewareInterface
{
    /**
     * 执行中间件主流程。
     *
     * @param ServerRequestInterface $request 当前请求对象
     * @param RequestHandlerInterface $handler 下游请求处理器
     * @return PsrResponseInterface 响应对象
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): PsrResponseInterface
    {
        $before = $this->before($request, $handler);
        if (!$before->isSuccess()) {
            return $this->jsonResponse($before);
        }
        /** @var \Hyperf\HttpServer\Response $response */
        $response = $handler->handle($request);

        $after = $this->after($request, $response);
        if (!$after->isSuccess()) {
            return $response->json($after);
        }

        return $response;
    }

    /**
     * 请求进入下游处理器之前的预处理钩子。
     *
     * @param ServerRequestInterface $request 当前请求对象
     * @param RequestHandlerInterface $handler 下游请求处理器
     * @return JsonTable 处理结果
     */
    protected function before(ServerRequestInterface $request, RequestHandlerInterface $handler): JsonTable
    {
        return JsonTable::withSuccess();
    }

    /**
     * 请求完成下游处理后的收尾钩子。
     *
     * @param ServerRequestInterface $request 当前请求对象
     * @param PsrResponseInterface $response 下游返回的响应对象
     * @return JsonTable 处理结果
     */
    protected function after(ServerRequestInterface $request, PsrResponseInterface $response): JsonTable
    {
        return JsonTable::withSuccess();
    }
}
