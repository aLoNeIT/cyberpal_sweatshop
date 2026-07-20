<?php

declare(strict_types=1);

namespace app\common\logic;

use app\common\constants\CommonConst;
use app\common\exception\AppException;
use app\common\model\BaseModel;
use app\common\util\Dict;
use app\common\util\DictItem;
use app\common\util\Helper;
use app\common\util\JsonTable;
use Hyperf\Cache\Annotation\Cacheable;
use Hyperf\Database\Model\Builder;
use Hyperf\Database\Query\Expression;
use Hyperf\DbConnection\Db;
use Hyperf\Di\Annotation\Inject;
use Hyperf\Stringable\Str;
use Throwable;
use function Hyperf\Config\config;

/**
 * 字典处理类
 *
 * 负责基于数据字典的通用 CRUD 数据操作。
 * 字典数据依赖 dict 和 dict_item 表，若当前项目未使用字典体系则不触发。
 */
class DictLogic extends BaseLogic
{
    #[Inject()]
    protected ErrCodeLogic $errCodeLogic;
    /**
     * 缓存的字典数据
     *
     * @var array
     */
    protected array $item = [];

    /**
     * 索引是表名的字典数据
     *
     * @var array
     */
    protected array $itemName = [];

    /**
     * 获取指定字典对象
     *
     * @param integer|Dict|string $dict 字典id或者字典对象
     * @param integer $appType 应用类型
     * @param bool $cloned 是否返回克隆后的字典对象
     * @return Dict 返回字典对象
     * @throws AppException
     */
    public function getDict($dict, int $appType = 0, bool $cloned = false): Dict
    {
        if ($dict instanceof Dict) {
            return $cloned ? unserialize(serialize($dict)) : $dict;
        }
        // 字典未初始化时返回基础对象（由子类按需注入实际字典数据）
        $dictObject = new Dict();
        return $dictObject;
    }

    /**
     * 获取字典项
     *
     * @param integer|Dict|string $dict 字典id或字典对象
     * @param string $fieldName 字典项字段名
     * @param integer $appType 应用类型
     * @return DictItem 字典项对象
     * @throws AppException 字典项不存在
     */
    public function getDictItem($dict, string $fieldName, int $appType = 0): DictItem
    {
        $dictObject = $this->getDict($dict, $appType);
        $fieldName = Helper::delPrefix($fieldName, (string) $dictObject->prefix);
        $dictItemObject = $dictObject->getItem($fieldName);
        if (\is_null($dictItemObject)) {
            throw AppException::fromJsonTable(
                $this->errCodeLogic->getError(41, [
                    'id' => $dictObject->id,
                    'name' => Helper::delPrefix($fieldName, $dictObject->prefix),
                ])
            );
        }
        return $dictItemObject;
    }

    /**
     * 获取模型对象
     *
     * @param integer|Dict|string $dict 字典id或字典对象
     * @param integer $appType 应用类型
     * @return BaseModel 实例化的模型
     * @throws AppException 找不到模型异常
     */
    public function getModel($dict, int $appType = 0): BaseModel
    {
        $dictObject = $this->getDict($dict, $appType);
        $modelName = $dictObject->tablename;
        $moduleName = CommonConst::APP_TYPE_MAP[$appType] ?? null;
        $model = Helper::model($modelName, true, $moduleName);
        if (\is_null($model)) {
            throw AppException::fromJsonTable(
                $this->errCodeLogic->getError(27, ['name' => $modelName])
            );
        }
        return $model;
    }

    /**
     * 校验数据
     *
     * @param integer|Dict|string $dict 字典id或字典对象
     * @param integer $curd 操作类型
     * @param array $data 数据
     * @param bool $batch 是否批量
     * @param integer $appType 应用类型
     * @return JsonTable
     */
    public function checkData($dict, int $curd, array $data, bool $batch = false, int $appType = 0)
    {
        $dictObject = $this->getDict($dict, $appType);
        $errors = [];

        $dictObject->eachItem(function (string $fieldName, DictItem $item) use ($curd, $data, $batch, &$errors) {
            try {
                if (($item->pk && $item->autoed) || ($item->show_dict > 0)) {
                    return true;
                }
                if ($curd !== ($curd & $item->curd)) {
                    return true;
                }

                if ($this->isRequiredForOperation($item, $curd) && (!isset($data[$fieldName]) || '' === $data[$fieldName])) {
                    throw AppException::fromJsonTable(
                        $this->errCodeLogic->getError(33, ['name' => $item->name])
                    );
                }

                if (!isset($data[$fieldName]) || (string) $item->show_table !== '') {
                    return true;
                }
                $itemData = $data[$fieldName];
                $this->assertItemType($item, $itemData, $curd);
                if ($this->isEmptyOptionalValue($item, $itemData, $curd)) {
                    return true;
                }
                $value = 0;
                if ($item->max >= $item->min) {
                    switch ($item->type) {
                        case 6:
                            $value = Str::length($itemData);
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                            if ($value > $item->max) {
                                throw AppException::fromJsonTable(
                                    $this->errCodeLogic->getError(30, ['name' => $item->name, 'max' => $item->max])
                                );
                            }
                            if ($value < $item->min) {
                                throw AppException::fromJsonTable(
                                    $this->errCodeLogic->getError(31, ['name' => $item->name, 'min' => $item->min])
                                );
                            }
                            break;
                        default:
                            break;
                    }
                }
                if (6 == $item->type && '' != $item->regex) {
                    if ((isset($data[$fieldName]) && '' !== $data[$fieldName]) && (0 === preg_match($item->regex, $itemData))) {
                        throw AppException::fromJsonTable(
                            $this->errCodeLogic->getError(32, ['name' => $item->name, 'content' => $item->regex_msg])
                        );
                    }
                }
            } catch (AppException $ex) {
                if (false === $batch) {
                    $errors = [
                        'state' => $ex->getState(),
                        'msg' => $ex->getMessage(),
                        'data' => $ex->getData(),
                    ];
                    return false;
                } else {
                    $errors[$ex->getState()] = $ex->getMessage();
                }
            }
        });

        return empty($errors)
            ? JsonTable::withSuccess()
            : ($batch
                ? JsonTable::withError('error', 1, $errors)
                : JsonTable::withError($errors['msg'], $errors['state'], $errors['data']));
    }

    /**
     * 根据字典项配置清洗数据。
     */
    public function normalizeData($dict, int $curd, array $data, int $appType = 0): array
    {
        $dictObject = $this->getDict($dict, $appType);
        $normalized = $data;

        $dictObject->eachItem(function (string $fieldName, DictItem $item) use ($curd, &$normalized) {
            if (! array_key_exists($fieldName, $normalized)) {
                return true;
            }
            if (($item->pk && $item->autoed) || ($item->show_dict > 0) || (string) $item->show_table !== '') {
                return true;
            }
            if ($curd !== ($curd & $item->curd)) {
                return true;
            }
            if ($this->isEmptyOptionalValue($item, $normalized[$fieldName], $curd)) {
                unset($normalized[$fieldName]);
                return true;
            }
            return true;
        });

        return $normalized;
    }

    /**
     * 校验字典项数据类型。
     */
    protected function assertItemType(DictItem $item, mixed $value, int $curd): void
    {
        if ($this->isEmptyOptionalValue($item, $value, $curd)) {
            return;
        }

        $valid = match ((int) $item->type) {
            1, 3, 4, 5 => $this->isIntegerLike($value),
            2 => $this->isNumericLike($value),
            7 => is_bool($value) || $this->isIntegerLike($value),
            default => true,
        };

        if (! $valid) {
            throw AppException::fromJsonTable(
                $this->errCodeLogic->getError(6, ['param' => $item->name])
            );
        }
    }

    /**
     * 判断是否为可选字段的空值。
     */
    protected function isEmptyOptionalValue(DictItem $item, mixed $value, int $curd): bool
    {
        return '' === $value
            && ! $this->isRequiredForOperation($item, $curd)
            && $this->isStrictNumericType($item);
    }

    /**
     * 判断字典项是否在当前操作中必填。
     */
    protected function isRequiredForOperation(DictItem $item, int $curd): bool
    {
        return $curd === ($curd & 6)
            && $curd === ($curd & (int) $item->required);
    }

    protected function isIntegerLike(mixed $value): bool
    {
        return is_int($value)
            || (is_string($value) && preg_match('/^-?\d+$/', $value) === 1);
    }

    protected function isNumericLike(mixed $value): bool
    {
        return is_int($value)
            || is_float($value)
            || (is_string($value) && is_numeric($value));
    }

    protected function isStrictNumericType(DictItem $item): bool
    {
        return in_array((int) $item->type, [1, 2, 3, 4, 5, 7], true);
    }

    /**
     * 查询数据
     */
    public function select(
        $dict,
        array $condition = [],
        ?array $order = null,
        ?string $fuzzy = null,
        int $currPage = 1,
        int $pageNum = 20,
        int $appType = 0
    ) {
        try {
            $query = $this->build($dict, 1, $condition, $order, $fuzzy, $appType);
            $totalCount = $query->count();
            $totalPage = 1;
            if ($pageNum > 0) {
                $totalPage = \max(\ceil($totalCount / $pageNum), $totalPage);
                $currPage = \min($currPage, $totalPage);
                $query = $query->offset(($currPage - 1) * $pageNum)->limit($pageNum);
            }
            $data = $query->get();
            return JsonTable::withSuccess([
                'curr' => $currPage,
                'page' => $totalPage,
                'num' => $pageNum,
                'count' => $totalCount,
            ], $data->toArray());
        } catch (Throwable $ex) {
            return Helper::logListenException(static::class, __FUNCTION__, $ex);
        }
    }

    /**
     * 获取指定条件的单一数据
     */
    public function find($dict, array $condition = [], ?array $order = null, int $appType = 0)
    {
        try {
            $query = $this->build($dict, 8, $condition, $order, null, $appType);
            $data = $query->first();
            if (\is_null($data)) {
                return JsonTable::withError('Record not found', 25);
            }
            return JsonTable::withSuccessByData($data->toArray());
        } catch (Throwable $ex) {
            return Helper::logListenException(static::class, __FUNCTION__, $ex);
        }
    }

    /**
     * 根据条件更新数据
     */
    public function update($dict, array $data, array $condition = [], int $appType = 0): JsonTable
    {
        try {
            $dictObject = $this->getDict($dict, $appType);
            $fixedData = Helper::addPrefixArr($data, (string) $dictObject->prefix);
            $jResult = $this->checkData($dictObject, 4, $fixedData, false, $appType);
            if (!$jResult->isSuccess()) {
                return $jResult;
            }
            $query = $this->build($dictObject, 4, $condition, null, null, $appType);
            $model = $query->first();
            if (\is_null($model)) {
                return $this->errCodeLogic->getError(25);
            }
            $fixedData = $this->normalizeData($dictObject, 4, $fixedData, $appType);
            $model->fillable($query->getModel()->getFillable());
            $model->fill($fixedData);
            $model->save();
            return JsonTable::withSuccessByData(Helper::delPrefixArr($model->toArray(), $dictObject->prefix));
        } catch (Throwable $ex) {
            return Helper::logListenException(static::class, __FUNCTION__, $ex);
        }
    }

    /**
     * 创建新数据
     */
    public function save($dict, array $data = [], int $appType = 0)
    {
        try {
            $dictObject = $this->getDict($dict, $appType);
            $fixedData = Helper::addPrefixArr($data, (string) $dictObject->prefix);
            $jResult = $this->checkData($dictObject, 2, $fixedData, false, $appType);
            if (! $jResult->isSuccess()) {
                return $jResult;
            }
            $fixedData = $this->normalizeData($dictObject, 2, $fixedData, $appType);
            $query = $this->build($dict, 2, [], null, null, $appType);
            $model = $query->getModel();
            $model->fill($fixedData);
            $model->save();
            return JsonTable::withSuccess(
                $model->getKey(),
                Helper::delPrefixArr($model->toArray(), $dictObject->prefix),
            );
        } catch (Throwable $ex) {
            return Helper::logListenException(static::class, __FUNCTION__, $ex);
        }
    }

    /**
     * 删除数据
     */
    public function delete($dict, array $condition = [], int $appType = 0): JsonTable
    {
        try {
            $query = $this->build($dict, 16, $condition, null, null, $appType);
            $model = $query->first();
            if (\is_null($model)) {
                return $this->errCodeLogic->getError(25);
            }
            return $model->delete()
                ? JsonTable::withSuccess()
                : $this->errCodeLogic->getError(23);
        } catch (Throwable $ex) {
            return Helper::logListenException(static::class, __FUNCTION__, $ex);
        }
    }

    /**
     * 返回构建后的Query对象
     */
    public function build(
        $dict,
        int $curd,
        array $condition = [],
        ?array $order = null,
        ?string $fuzzy = null,
        int $appType = 0
    ): Builder {
        $model = $this->getModel($dict, $appType);

        $query = $this->applyWhereConditions($model, $condition);

        if (!\is_null($order)) {
            foreach ($order as $field => $direction) {
                $query = $query->orderBy($field, $direction);
            }
        }

        return $query;
    }

    /**
     * 按条件表达式应用查询条件。
     */
    protected function applyWhereConditions(BaseModel $model, array $condition): Builder
    {
        $query = $model->newQuery();
        foreach ($condition as $item) {
            if (! is_array($item) || count($item) < 3) {
                continue;
            }

            $operator = strtolower((string) $item[1]);
            switch ($operator) {
                case 'in':
                    $query = $query->whereIn($item[0], (array) $item[2]);
                    break;
                case 'not in':
                    $query = $query->whereNotIn($item[0], (array) $item[2]);
                    break;
                case 'between':
                    $query = $query->whereBetween($item[0], (array) $item[2]);
                    break;
                case 'not between':
                    $query = $query->whereNotBetween($item[0], (array) $item[2]);
                    break;
                default:
                    $query = $query->where($item[0], $item[1], $item[2]);
                    break;
            }
        }

        return $query;
    }
}
