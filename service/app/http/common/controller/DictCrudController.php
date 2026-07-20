<?php

declare(strict_types=1);

namespace app\http\common\controller;

use app\common\annotation\PermissionAnnotation;
use app\common\logic\{DictLogic, SessionLogic};
use app\common\util\Dict;
use app\common\util\JsonTable;
use Closure;
use Hyperf\DbConnection\Db;
use Hyperf\Di\Annotation\Inject;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;

abstract class DictCrudController extends BaseController
{
    /**
     * 字典id
     *
     * @var integer
     */
    protected int $dictId = 0;
    /**
     * 固定用的过滤属性，会覆盖前端提交过来的参数
     *
     * @var array
     */
    protected array $filter = [];
    /**
     * 事务开关，1刷新；2新增；4修改；8读取；16删除
     *
     * @var integer
     */
    protected int $transaction = 0;
    /**
     * 不需要处理前缀的字段数组
     * @var array
     */
    protected array $excludePrefix = [];
    /**
     * 排序信息
     *
     * @var array
     */
    protected ?array $order = null;
    /**
     * 字典逻辑类
     *
     * @var DictLogic
     */
    #[Inject()]
    protected DictLogic $dictLogic;
    /**
     * 会话逻辑类
     *
     * @var SessionLogic
     */
    #[Inject()]
    protected SessionLogic $sessionLogic;
    /** @inheritDoc */
    protected function procCondition(?string $prefix = null, array $excludePrefix = []): array
    {
        $dict = $this->dictLogic->getDict($this->dictId, $this->request->getAppType());
        $prefix = !\is_null($prefix) ? $prefix : $dict->prefix;
        $excludePrefix = !empty($excludePrefix) ? $excludePrefix : $this->excludePrefix;
        return parent::procCondition($prefix, $excludePrefix);
    }
    /**
     * 过滤条件合并处理
     *
     * @param array $filter 过滤表达式
     * @param array $condition 条件表达式
     * @return array 返回合并后的表达式
     */
    protected function filterCondition(array $filter, array $condition): array
    {
        $merged = [];
        foreach (\array_merge($condition, $filter) as $key => $item) {
            if (!\is_array($item)) {
                continue;
            }
            if (isset($item[2]) && \is_callable($item[2])) {
                $item[2] = \call_user_func($item[2]);
            }
            $merged[$key] = $item;
        }
        return array_values($merged);
    }
    /**
     * 检查当前操作是否需要开启事务
     *
     * @param int $curd 操作类型
     * @return boolean
     */
    protected function checkTransaction(int $curd): bool
    {
        return $curd > 0 && $curd === ($curd & $this->transaction);
    }

    /**
     * 执行事务操作
     *
     * @param integer $curd crud类型
     * @param callable $callback 回调函数
     * @return JsonTable 返回JsonTable对象结果
     */
    protected function executeTransaction(int $curd, Closure $callback): JsonTable
    {
        if (! $this->checkTransaction($curd)) {
            return $callback();
        }
        return Db::transaction(function () use ($callback) {
            return $callback();
        });
    }
    /**
     * 列表页
     *
     * @return JsonTable|PsrResponseInterface 返回数据并输出给浏览器
     */
    #[PermissionAnnotation(code: '01')]
    public function index(): JsonTable|PsrResponseInterface
    {
        return $this->executeTransaction(1, function (): JsonTable {
            return $this->doIndex();
        });
    }

    /**
     * 获取当前 CRUD 操作实际使用的字典。
     *
     * @param int $curd CRUD 操作类型
     * @param array $context 当前 action 局部上下文
     * @return int|string|Dict 字典 ID、表名或当前 action 使用的字典对象
     */
    protected function resolveCrudDict(int $curd, array $context = []): int|string|Dict
    {
        return $this->dictId;
    }
    /**
     * 列表页操作前处理
     *
     * @param array $condition 条件表达式
     * @return JsonTable 返回JsonTable对象
     */
    protected function beforeIndex(array &$condition): JsonTable
    {
        return JsonTable::withSuccess();
    }
    /**
     * 执行列表查询功能
     *
     * @return JsonTable 返回JsonTable对象
     */
    protected function doIndex(): JsonTable
    {
        $condition = $this->procCondition();
        $jResult = $this->beforeIndex($condition);
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        $dict = $this->resolveCrudDict(1, ['condition' => $condition]);
        $orderValue = $this->request->query('order', null);
        $order = \is_scalar($orderValue) ? (string) $orderValue : null;
        $currPage = (int) $this->request->query('p', 1);
        $pageNum = (int) $this->request->query('num', 20);
        $fuzzyValue = $this->request->query('key', null);
        $fuzzy = \is_scalar($fuzzyValue) ? (string) $fuzzyValue : null;
        if (!\is_null($order)) {
            $order = \json_decode(\base64_decode($order), true);
            $order = empty($order) ? $this->order : array_merge($this->order ?? [], $order);
        }
        $jResult = $this->dictLogic->select(
            $dict,
            $this->filterCondition($this->filter, $condition),
            $order,
            $fuzzy,
            $currPage,
            $pageNum,
            $this->request->getAppType()
        );
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        $msg = $jResult->msg;
        $data = $jResult->data;
        $jResult = $this->afterIndex($msg, $data);
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        return JsonTable::withSuccess($msg, $data);
    }
    /**
     * 列表后操作处理
     *
     * @param string|array $msg 提示信息
     * @param array $data 数据
     * @return JsonTable 返回JsonTable对象
     */
    protected function afterIndex(string|array &$msg, array &$data): JsonTable
    {
        return JsonTable::withSuccess();
    }
    /**
     * 数据保存
     *
     * @return JsonTable|PsrResponseInterface 返回JsonTable对象或响应对象
     */
    #[PermissionAnnotation(code: '02')]
    public function save(): JsonTable|PsrResponseInterface
    {
        return $this->executeTransaction(2, function (): JsonTable {
            return $this->doSave();
        });
    }
    /**
     * 数据保存前处理
     *
     * @param array $data 数据
     * @return JsonTable 返回JsonTable对象
     */
    protected function beforeSave(array &$data): JsonTable
    {
        return JsonTable::withSuccess();
    }
    /**
     * 执行数据保存功能
     *
     * @return JsonTable 返回JsonTable对象
     */
    protected function doSave(): JsonTable
    {
        $data = $this->request->post();
        if (\is_null($data) || empty($data)) {
            return $this->errCodeLogic->getError(20);
        }
        $jResult = $this->beforeSave($data);
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        $dict = $this->resolveCrudDict(2, ['data' => $data]);
        $jResult = $this->dictLogic->save($dict, $data, $this->request->getAppType());
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        $pkValue = $jResult->msg;
        $data = $jResult->data;
        $jResult = $this->afterSave($jResult->msg, $data);
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        return JsonTable::withSuccess($pkValue, $data);
    }
    /**
     * 数据保存后处理
     *
     * @param string|int $id 主键id
     * @param array $data 请求传递的保存数据
     * @return JsonTable 返回JsonTable对象
     */
    protected function afterSave(string|int $id, array &$data): JsonTable
    {
        return JsonTable::withSuccess();
    }
    /**
     * 数据读取
     *
     * @param integer|string $id 数据主键值
     * @return JsonTable|PsrResponseInterface 返回JsonTable对象或响应对象
     */
    #[PermissionAnnotation(code: '05')]
    public function read(string|int $id): JsonTable|PsrResponseInterface
    {
        return $this->executeTransaction(8, function () use ($id): JsonTable {
            return $this->doRead($id);
        });
    }
    /**
     * 数据读取前处理
     *
     * @param integer|string $id 数据主键值
     * @return JsonTable 返回JsonTable对象
     */
    protected function beforeRead(string|int &$id): JsonTable
    {
        return JsonTable::withSuccess();
    }
    /**
     * 执行数据查询操作
     *
     * @param integer|string $id 数据主键值
     * @return JsonTable 返回JsonTable对象
     */
    protected function doRead(string|int $id): JsonTable
    {
        $dict = $this->dictLogic->getDict($this->dictId);
        $pk = $dict->getPrimaryKey();
        if (\is_null($pk)) {
            return $this->errCodeLogic->getError(41);
        }
        $jResult = $this->beforeRead($id);
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        $dict = $this->resolveCrudDict(8, ['id' => $id]);
        $condition = [
            [$pk->fieldname, '=', $id],
        ];
        $jResult = $this->dictLogic->find(
            $dict,
            $this->filterCondition($this->filter, $condition),
            null,
            $this->request->getAppType()
        );
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        $data = $jResult->data;
        $jResult = $this->afterRead($id, $data);
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        return JsonTable::withSuccessByData($data);
    }
    /**
     * 数据读取后处理
     *
     * @param mixed $id 主键
     * @param array $data 查询到的数据
     * @return JsonTable 返回JsonTable对象
     */
    protected function afterRead($id, array &$data): JsonTable
    {
        return JsonTable::withSuccess();
    }
    /**
     * 数据更新
     *
     * @param integer|string $id 数据主键值
     * @return JsonTable|PsrResponseInterface 返回JsonTable对象或响应对象
     */
    #[PermissionAnnotation(code: '03')]
    public function update(string|int $id): JsonTable|PsrResponseInterface
    {
        return $this->executeTransaction(4, function () use ($id): JsonTable {
            return $this->doUpdate($id);
        });
    }
    /**
     * 数据更新前处理
     *
     * @param integer|string $id 数据主键值
     * @param array $data 请求传递的更新数据
     * @return JsonTable 返回JsonTable对象
     */
    protected function beforeUpdate(string|int $id, array &$data): JsonTable
    {
        return JsonTable::withSuccess();
    }
    /**
     * 执行数据更新操作
     *
     * @param integer|string $id 数据主键值
     * @return JsonTable 返回JsonTable对象
     */
    protected function doUpdate(string|int $id): JsonTable
    {
        $dict = $this->dictLogic->getDict($this->dictId);
        $pk = $dict->getPrimaryKey();
        if (\is_null($pk)) {
            return $this->errCodeLogic->getError(41);
        }
        $data = $this->request->post();
        if (\is_null($data) || empty($data)) {
            return $this->errCodeLogic->getError(20);
        }
        $originalData = $data;
        $jResult = $this->beforeUpdate($id, $data);
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        $dict = $this->resolveCrudDict(4, [
            'id' => $id,
            'data' => $data,
            'original_data' => $originalData,
        ]);
        $condition = [
            [$pk->fieldname, '=', $id],
        ];
        $jResult = $this->dictLogic->update(
            $dict,
            $data,
            $this->filterCondition($this->filter, $condition),
            $this->request->getAppType()
        );
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        $data = $jResult->data;
        $jResult = $this->afterUpdate($id, $data);
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        return JsonTable::withSuccessByData($data);
    }
    /**
     * 数据更新后
     *
     * @param integer|string $id 数据主键值
     * @param array $data 请求传递的更新数据
     * @return JsonTable 返回JsonTable对象
     */
    protected function afterUpdate(string|int $id, array &$data): JsonTable
    {
        return JsonTable::withSuccess();
    }

    /**
     * 数据删除
     *
     * @param integer|string $id 数据主键值
     * @return JsonTable|PsrResponseInterface 返回JsonTable对象或响应对象
     */
    #[PermissionAnnotation(code: '04')]
    public function delete(string|int $id): JsonTable|PsrResponseInterface
    {
        return $this->executeTransaction(16, function () use ($id): JsonTable {
            return $this->doDelete($id);
        });
    }
    /**
     * 数据删除前
     *
     * @param integer|string $id 数据主键值
     * @return JsonTable 返回JsonTable对象
     */
    protected function beforeDelete(string|int $id): JsonTable
    {
        return JsonTable::withSuccess();
    }
    /**
     * 执行数据删除操作
     *
     * @param integer|string $id 数据主键值
     * @return JsonTable 返回JsonTable对象
     */
    protected function doDelete(string|int $id): JsonTable
    {
        $dict = $this->dictLogic->getDict($this->dictId);
        $pk = $dict->getPrimaryKey();
        if (\is_null($pk)) {
            return $this->errCodeLogic->getError(41);
        }
        $jResult = $this->beforeDelete($id);
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        $dict = $this->resolveCrudDict(16, ['id' => $id]);
        $condition = [
            [$pk->fieldname, '=', $id],
        ];
        $jResult = $this->dictLogic->delete(
            $dict,
            $this->filterCondition($this->filter, $condition),
            $this->request->getAppType()
        );
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        $jResult = $this->afterDelete($id);
        if (!$jResult->isSuccess()) {
            return $jResult;
        }
        return JsonTable::withSuccess();
    }
    /**
     * 数据删除后
     *
     * @param integer|string $id 数据主键值
     * @return JsonTable 返回JsonTable对象
     */
    protected function afterDelete(string|int $id): JsonTable
    {
        return JsonTable::withSuccess();
    }
}
