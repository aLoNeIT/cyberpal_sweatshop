<?php

declare(strict_types=1);

namespace app\common\model;

use Hyperf\DbConnection\Model\Model as HyperfModel;

/**
 * 通用基础模型。
 */
abstract class BaseModel extends HyperfModel
{
    /** @inheritDoc */
    protected ?string $dateFormat = 'U';

    /**
     * 表中字段前缀
     *
     * @var string
     */
    protected string $prefix = '';
    /**
     * 获取表中字段前缀
     *
     * @return string
     */
    public function getPrefix(): string
    {
        return $this->prefix;
    }

    /**
     * 获取表中字段前缀。
     *
     * @return string
     */
    public function getFieldPrefix(): string
    {
        return $this->getPrefix();
    }

    /**
     * 获取主键字段名
     *
     * @return string
     */
    public function getPk(): string
    {
        return $this->getKeyName();
    }
}
