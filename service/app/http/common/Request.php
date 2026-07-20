<?php

declare(strict_types=1);

namespace app\http\common;

use app\common\constants\CommonConst;
use Hyperf\HttpServer\Request as HyperfRequest;

/**
 * 项目自定义请求对象。
 */
class Request extends HyperfRequest
{
    /**
     * 获取应用类型。
     *
     * @return int
     */
    public function getAppType(): int
    {
        return (int) $this->getAttribute(CommonConst::REQUEST_ATTRIBUTE_APP_TYPE);
    }

    /**
     * 获取应用类型名称。
     *
     * @return string|null
     */
    public function getAppTypeName(): ?string
    {
        return $this->getAttribute(CommonConst::REQUEST_ATTRIBUTE_APP_TYPE_NAME);
    }
}
