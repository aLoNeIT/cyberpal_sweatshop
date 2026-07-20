<?php

declare(strict_types=1);

namespace app\http\common\controller;

use app\common\logic\ErrCodeLogic;
use app\common\util\Helper;
use app\http\common\Request;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;
use Psr\Container\ContainerInterface;

/**
 * 基础控制器类
 */
abstract class BaseController
{
    #[Inject()]
    protected ContainerInterface $container;
    /**
     * 请求对象
     *
     * @var \app\http\common\Request
     */
    #[Inject(RequestInterface::class)]
    protected Request $request;

    /**
     * 响应对象。
     *
     * @var \Hyperf\HttpServer\Response 实际注入类位于 vendor/hyperf/http-server/src/Response.php
     */
    #[Inject()]
    protected ResponseInterface $response;
    /**
     * 错误码逻辑类
     *
     * @var ErrCodeLogic
     */
    #[Inject()]
    protected ErrCodeLogic $errCodeLogic;

    public function __construct()
    {
        $this->initialize();
    }
    /**
     * 初始化控制器基础状态。
     *
     * @return void
     */
    protected function initialize(): void {}

    /**
     * 处理前端condition条件
     *
     * @param string|null $prefix 待补充的字段前缀
     * @param array $excludePrefix 不需要处理前缀的字段集合
     * @return array 返回处理后的参数数组
     */
    protected function procCondition(?string $prefix = null, array $excludePrefix = []): array
    {
        $condition = [];
        if ($this->request->has('condition')) {
            $condition = json_decode(base64_decode((string) $this->request->query('condition', '')), true) ?? [];
            if (!\is_null($prefix)) {
                foreach ($condition as &$item) {
                    if (is_array($item[0])) {
                        continue;
                    }
                    $item[0] = Helper::addPrefix($item[0], $prefix, $excludePrefix);
                }
            }
        }
        return $condition;
    }
}
