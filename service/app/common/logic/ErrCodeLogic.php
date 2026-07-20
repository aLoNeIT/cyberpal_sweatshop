<?php

declare(strict_types=1);

namespace app\common\logic;

use app\common\util\JsonTable;
use function Hyperf\Config\config;

/**
 * 错误码处理逻辑
 */
class ErrCodeLogic extends BaseLogic
{

    /**
     * 获取错误信息
     *
     * @param string|integer $state 错误码
     * @param array $param 错误信息参数，部分错误支持
     * @return JsonTable 返回错误信息数组
     */
    public function getError(string|int $state, array $params = [], array $data = []): JsonTable
    {
        $msg = $this->getContent($state, $params);
        return JsonTable::withError($msg, $state, $data);
    }

    /**
     * 判断错误码是否存在
     *
     * @param int $state 错误码
     * @return bool
     */
    public function exists($state)
    {
        return isset($this->errorCode[strval($state)]);
    }
    /**
     * 获取错误内容
     *
     * @param string|integer $state 错误码
     * @param array $params 错误信息参数，部分错误支持
     * @return string 返回错误内容
     */
    public function getContent(string|int $state, array $params = []): string
    {
        $state = strval($state);
        $msg = config("errcode.{$state}", '');
        return $this->parseContent($msg, $params);
    }

    /**
     * 内容解析
     *
     * @param string $content 内容模板
     * @param array $params 参数
     * @return string 解析后的的内容字符串
     */
    protected function parseContent(string $content, array $params): string
    {
        if (\array_is_list($params)) {
            return \sprintf($content, ...$params);
        }
        // 关联索引解析
        $replace = array_keys($params);
        foreach ($replace as &$v) {
            $v = "{:{$v}}";
        }
        return str_replace($replace, $params, $content);
    }
}
