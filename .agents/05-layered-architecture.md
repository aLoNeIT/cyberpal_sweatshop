# 项目分层规范

本文档用于统一项目分层模型和各层职责边界，避免控制器、逻辑层和模型层职责混用。

项目分层采用 `C`、`L`、`M`、`V` 模式。

## 1. C：Controller 控制器层

- 负责请求参数过滤和校验。
- 负责响应数据格式化输出。
- 类内部只包含路由函数。
- 对外接口方法统一通过 `public` 方法声明，返回值一般情况下为 `JsonTable` 对象；返回图片、文件流等二进制内容时，可返回框架约定的特定 `Response` 对象。
- `public` 接口方法命名使用 `snake_case` 风格，并以 `index`、`save`、`update`、`delete`、`read` 作为最后一个单词标记 RESTful 类型。
- `protected`、`private` 方法仅作为控制器内部辅助方法使用，命名使用 `camelCase` 风格，不得作为路由接口暴露。
- 控制器负责读取 HTTP 上下文中的请求、会话、文件、Header、Cookie 等数据，并将过滤校验后的普通参数传递给 `Logic` 层。
- 除 `SessionLogic` 外，`Logic`、`Model`、`Transaction`、`Process`、`Listener` 等非 Controller 层代码不得直接访问 HTTP 相关对象或上下文方法，避免在后台进程、定时任务等非 HTTP 场景中产生环境依赖。

### 1.1 DictCrudController 标准 CRUD 开发模式

新增控制器时，必须优先保证继承链路中最终包含 `DictCrudController`，利用其提供的标准 CRUD 模板快速完成开发。

#### 1.1.1 设计思路

`DictCrudController` 的核心设计是基于数据字典的模板方法模式：

- `index`、`save`、`read`、`update`、`delete` 作为固定对外入口，负责权限标记、事务包装和标准流程调度。
- `doIndex`、`doSave`、`doRead`、`doUpdate`、`doDelete` 作为标准 CRUD 模板，统一调用 `DictLogic` 完成字典驱动的数据查询、写入、读取、更新和删除。
- `before*`、`after*` 作为业务扩展点，子类通过覆写钩子完成参数补充、业务校验、固定数据隔离、返回数据修饰和关联副作用处理。
- `dictId` 指向数据字典主配置，字段前缀、主键、可增删改查字段、校验规则、外键显示等元数据由字典配置和 `DictLogic` 统一处理。
- 前端和控制器侧优先使用去前缀字段名，`DictLogic` 在保存时会根据字典前缀补齐真实表字段，在返回时会删除字段前缀。
- `filter` 固定过滤条件用于补充数据范围，避免前端通过条件绕过数据隔离。

因此，围绕 dict 机制开发普通 CRUD 时，控制器通常只需要设置字典编号和少量钩子，不应重复实现通用增删改查逻辑。

#### 1.1.2 核心属性

- `dictId`（**必填**）：字典 ID，对应数据字典配置中的主数据定义。
- `filter`：固定过滤条件，参与 `filterCondition()` 合并。适用于按应用类型、归属主体等维度做数据隔离。过滤项结构为 `['字段名', '比较符', '值']`，数组键只用于区分过滤项。
- `transaction`：事务开关，按位控制各操作是否需要事务。位掩码定义：
  - `1` — 列表（`index`）
  - `2` — 新增（`save`）
  - `4` — 修改（`update`）
  - `8` — 读取（`read`）
  - `16` — 删除（`delete`）
- `excludePrefix`：不需要自动添加字段前缀的字段名数组。
- `order`：排序规则。当前实现仅在请求包含 `order` 参数时进行解码、合并或兜底；未传 `order` 时会将 `null` 传给 `DictLogic`。新增接口若强依赖默认排序，需要结合前端参数或在必要时谨慎扩展 `doIndex()`。
- `dictLogic`：注入的字典逻辑类，标准 CRUD 的数据访问统一通过它完成。
- `sessionLogic`：注入的会话逻辑类，子类可在钩子中读取当前用户、归属主体等登录上下文。

#### 1.1.3 内部函数用途

| 函数 | 类型 | 用途 |
|------|------|------|
| `procCondition(?string $prefix = null, array $excludePrefix = [])` | 条件预处理 | 获取当前 `dictId` 对应字典前缀，并委托父类解析前端 `condition` 参数；条件字段会按字典前缀自动补齐，`excludePrefix` 中的字段不补前缀。 |
| `filterCondition(array $filter, array $condition)` | 条件合并 | 将前端条件和固定过滤条件合并为查询条件；非数组项会被忽略；第三个元素为闭包时会在当前请求中执行，用于避免控制器单例模式下缓存请求级数据。 |
| `checkTransaction(int $curd)` | 事务判断 | 使用位掩码判断当前操作是否启用事务，例如 `22` 表示 `save(2) + update(4) + delete(16)`。 |
| `executeTransaction(int $curd, Closure $callback)` | 事务执行 | 当前操作命中事务位时通过 `Db::transaction()` 执行回调，否则直接执行回调；回调必须返回 `JsonTable`。 |
| `index()` | 对外入口 | 列表查询入口，权限码 `01`，按事务位 `1` 包装后调用 `doIndex()`。 |
| `doIndex()` | 标准模板 | 解析查询条件、执行 `beforeIndex()`、读取 `order` / `p` / `num` / `key` 参数、调用 `DictLogic::select()`、执行 `afterIndex()`，最后返回分页列表。 |
| `beforeIndex(array &$condition)` | 前置钩子 | 列表查询前校验或改写条件。返回非成功 `JsonTable` 时会中断查询。 |
| `afterIndex(string|array &$msg, array &$data)` | 后置钩子 | 列表查询后改写分页信息或列表数据。返回非成功 `JsonTable` 时会中断返回。 |
| `save()` | 对外入口 | 新增入口，权限码 `02`，按事务位 `2` 包装后调用 `doSave()`。 |
| `doSave()` | 标准模板 | 读取 POST 数据、执行 `beforeSave()`、调用 `DictLogic::save()` 写入数据、执行 `afterSave()`，最后返回主键值和新增后的数据。 |
| `beforeSave(array &$data)` | 前置钩子 | 新增前补充默认字段、强制写入数据范围、校验业务规则或清理非法字段。 |
| `afterSave(string|int $id, array &$data)` | 后置钩子 | 新增成功后处理关联数据、审计记录、后置通知或返回数据修饰。 |
| `read(string|int $id)` | 对外入口 | 详情入口，权限码 `05`，按事务位 `8` 包装后调用 `doRead()`。 |
| `doRead(string|int $id)` | 标准模板 | 从字典配置获取主键字段，执行 `beforeRead()`，使用主键条件和固定过滤调用 `DictLogic::find()`，执行 `afterRead()`，最后返回详情数据。 |
| `beforeRead(string|int &$id)` | 前置钩子 | 详情查询前校验或改写主键；也可按需调整字典项显示配置。 |
| `afterRead($id, array &$data)` | 后置钩子 | 详情查询后补充派生字段、脱敏或格式化返回数据。 |
| `update(string|int $id)` | 对外入口 | 更新入口，权限码 `03`，按事务位 `4` 包装后调用 `doUpdate()`。 |
| `doUpdate(string|int $id)` | 标准模板 | 从字典配置获取主键字段，读取 POST 数据，执行 `beforeUpdate()`，使用主键条件和固定过滤调用 `DictLogic::update()`，执行 `afterUpdate()`，最后返回更新后的数据。 |
| `beforeUpdate(string|int $id, array &$data)` | 前置钩子 | 更新前校验业务规则、清理禁止更新字段、补充上下文字段或转换参数。 |
| `afterUpdate(string|int $id, array &$data)` | 后置钩子 | 更新成功后处理关联数据、审计记录、缓存刷新或返回数据修饰。 |
| `delete(string|int $id)` | 对外入口 | 删除入口，权限码 `04`，按事务位 `16` 包装后调用 `doDelete()`。 |
| `doDelete(string|int $id)` | 标准模板 | 从字典配置获取主键字段，执行 `beforeDelete()`，使用主键条件和固定过滤调用 `DictLogic::delete()`，执行 `afterDelete()`，最后返回成功响应。 |
| `beforeDelete(string|int $id)` | 前置钩子 | 删除前校验数据归属、业务状态和关联占用情况。 |
| `afterDelete(string|int $id)` | 后置钩子 | 删除成功后处理关联清理、审计记录、缓存刷新或后置通知。 |

#### 1.1.4 标准开发步骤

**步骤一：设置初始化参数**

在子类 `initialize()` 方法中设置初始化参数。若父类或应用级 `BaseController` 已经实现初始化逻辑，必须调用 `parent::initialize()`，并根据父类是否依赖 `dictId` 决定设置顺序。

子类对父类已声明的全局配置变量赋值时，统一在 `initialize()` 方法中执行，例如 `dictId`、`transaction`、`filter`、`order`、`excludePrefix` 等；除非该变量需要通过 `#[Inject]` 或构造注入等依赖注入机制实例化，否则禁止通过子类属性默认值覆盖父类配置。

示例：

```php
protected function initialize(): void
{
    $this->dictId = 100;  // 必填，先声明本控制器使用的数据字典
    parent::initialize();
    $this->filter = [
        'app_type' => ['app_type', '=', function () {
            return $this->request->getAttribute(CommonConst::REQUEST_ATTRIBUTE_APP_TYPE);
        }],
    ];
    $this->transaction = 22;  // save(2) + update(4) + delete(16)
}
```

过滤值依赖当前请求、登录态、租户、应用类型等运行时上下文时，推荐使用闭包延迟读取，避免控制器单例模式下复用旧请求数据。

**步骤二：围绕五个标准 CRUD 操作实现业务**

五个标准操作为：

| 操作     | 前置钩子                    | 后置钩子                    | 说明     |
| -------- | --------------------------- | --------------------------- | -------- |
| `index`  | `beforeIndex(&$condition)`  | `afterIndex(&$msg, &$data)` | 列表查询 |
| `save`   | `beforeSave(&$data)`        | `afterSave($id, &$data)`    | 新增数据 |
| `update` | `beforeUpdate($id, &$data)` | `afterUpdate($id, &$data)`  | 修改数据 |
| `read`   | `beforeRead(&$id)`          | `afterRead($id, &$data)`    | 读取单条 |
| `delete` | `beforeDelete($id)`         | `afterDelete($id)`          | 删除数据 |

**步骤三：按需覆写钩子方法**

- 业务校验、参数预处理等逻辑放在 `before*` 钩子中。
- 数据追加、关联操作、后置通知等逻辑放在 `after*` 钩子中。
- 钩子参数带 `&` 的，允许直接改写参数，并由后续标准流程继续使用。
- 钩子必须返回 `JsonTable`；返回 `JsonTable::withSuccess()` 表示继续执行，返回错误 `JsonTable` 表示中断当前 CRUD。
- 覆写钩子时如需要保留应用级 `BaseController` 的通用行为，例如自动写入 `create_user`，必须调用对应的 `parent::before*()` 或 `parent::after*()` 并处理其返回结果。
- `beforeSave()` 适合强制写入 `app_type`、`create_user` 等字段，防止前端伪造上下文。
- `beforeUpdate()` 适合 `unset()` 不允许前端更新的字段，例如 `app_type`、创建人等。
- 钩子中使用 `unset()`、白名单过滤或忽略调用方传入字段时，必须通过注释、参数校验或接口文档说明原因，避免调用方误以为字段已持久化。
- `beforeDelete()` 适合校验业务状态和关联占用；不要把删除后的清理放在 `beforeDelete()` 中。
- **没有特殊情况，不需要在 Logic 层为这些标准 CRUD 操作额外编写代码**。父类 `DictCrudController` 已提供了完整的 `doIndex`、`doSave`、`doUpdate`、`doRead`、`doDelete` 实现，子类只需覆写钩子即可完成绝大多数业务定制。

**步骤四：非标准业务逻辑放 Logic 层**

除以上五个标准 CRUD 操作的钩子外，其他业务处理逻辑（如批量操作、导出、复杂的数据聚合计算等）应写在 `Logic` 层，然后在 `Controller` 中按需调用。

```php
// 示例：非标准操作 - 调用 Logic 层处理
public function role_index(int $id): JsonTable|ResponseInterface
{
    return UserLogic::instance()->userRoleList($id, ...);
}
```

#### 1.1.5 继承开发约束

- 新增 dict CRUD 控制器时，优先继承对应应用目录下的 `BaseController`，例如 `app\http\admin\controller\BaseController`、`app\http\user\controller\BaseController`，由应用级父类间接继承 `DictCrudController`。
- 子类必须设置正确的 `dictId`，并确认该字典存在主键配置；`read`、`update`、`delete` 依赖 `Dict::getPrimaryKey()`，缺失主键会返回错误码 `41`。
- 标准 CRUD 不要重写 `index()`、`save()`、`read()`、`update()`、`delete()` 这五个 `public` 入口，避免绕过权限注解、事务包装和统一返回结构。
- 只有在标准查询流程无法满足时，才允许覆写 `doIndex()` 等 `do*` 模板方法；覆写时必须保留权限、过滤、事务、返回结构和数据范围语义，并补充说明原因。
- 普通字段校验、默认值填充、上下文隔离、禁止字段清理、返回数据加工，优先通过 `before*` / `after*` 钩子完成。
- 固定过滤条件必须覆盖所有数据范围边界；涉及当前请求上下文的过滤值优先使用闭包。
- 前端提交的 `condition` 字段应是 base64 编码后的 JSON 条件数组，控制器会按字典前缀补齐字段名；业务代码中不要重复手工拼接真实表字段前缀。
- 写入和更新的 POST 数据优先使用去前缀字段名，由 `DictLogic` 统一补前缀和按字典配置校验。
- 事务位只包裹当前标准 CRUD 的父类流程；如果钩子内包含关联写入、关联删除、审计记录等需要和主操作原子提交的逻辑，必须为对应操作开启事务位。
- 非标准接口必须按控制器命名规范新增独立 `public` 方法；复杂业务进入 `Logic` 或 `Transaction`，控制器只负责参数读取和响应转换。
- 不得在子类重复声明父类已有的 `request`、`dictLogic`、`sessionLogic`、`errCodeLogic` 等属性；需要使用时直接通过 `$this->request`、`$this->dictLogic`、`$this->sessionLogic` 访问。

## 2. L：Logic 逻辑层

- 负责非标准 CRUD 之外的业务逻辑处理（批量操作、导出、复杂数据聚合等）。
- 负责调度不同的 `M` 层。
- 负责对 `M` 层返回结果进行整合和处理。
- 向 `C` 层返回 `JsonTable` 对象。
- 所有查询、插入、更新、删除等数据库操作必须优先通过 `Model` 层完成；禁止为图省事直接使用 `Db::table()`、`Db::insert()`、`Db::update()`、原生 SQL 或查询构造器绕过模型。仅当复杂聚合、跨库查询、批量性能优化或框架模型能力明显不适用时，才允许使用 `Db` 或原生 SQL，并必须在代码注释或提交说明中写明原因。
- 新增或修改业务代码时，`Logic` 层不得直接使用 `Model::query()`、`where()`、`whereIn()`、`orderBy()`、`selectRaw()` 等方式拼接模型查询条件；涉及模型数据读取、更新、删除时，应调用 `Model` 层已定义的 `scopeXXX` 方法，并只传递业务参数。
- 新增或修改业务代码时，`Logic` 层原则上只调用 `Model` 层已定义的 `scopeXXX` 方法，并负责执行查询链最后一步的 `select()`、`first()`、`get()`、`pluck()`、`value()`、`update()`、`delete()`、`create()` 等终结操作。
- `Logic` 层自身不得使用 `Model::query()`、`where()`、`whereIn()`、`orderBy()`、`selectRaw()` 等方式拼接模型查询条件；需要组合查询条件时，应封装到 `Model` 层内部，对外提供 `scopeXXX` 调用。
- **标准 CRUD 操作（`index`、`save`、`update`、`read`、`delete`）的数据存取已由 `DictCrudController` 通过 `DictLogic` 统一实现，子类控制器只需覆写对应的 `before*` / `after*` 钩子方法，无需在 Logic 层为这些标准操作额外编写代码。**
- 所有业务编码生成必须通过 `GenerateCodeLogic` 统一入口，业务 Logic 或 Controller 不得自行查询最后编码、随机重试或拼接 Redis key 生成业务编码。

### 2.1 反过度封装

- **禁止为单行模型调用创建包装方法**：`Logic` 层不得仅为 `Model::find($id)`、`Model::create($data)`、`Model::xxx()->first()` 等单行模型调用编写额外的 `protected` 或 `private` 包装函数。模型终结操作应直接在调用处内联执行。
- `SessionLogic` 派生类的 `buildSessionData()` 属于登录会话构造入口，本端会话字段写入等应集中在该函数内完成；没有复用可能且内联后函数不超过 100 行的逻辑，不应拆出只被 `buildSessionData()` 调用一次的私有或受保护方法。
- 仅当方法包含额外业务逻辑（参数校验、状态检查、权限判断、多步骤组装、日志记录等）时，才允许提取为独立方法。
- 服务工厂类（如 Facade 创建、容器解析）的调用链虽可能只有少量代码，但属于跨职责边界操作，允许保留为独立方法以支持测试替身注入。

### 2.2 内部参数传递优先使用 Model 对象

- `Logic` 层内部方法之间传递数据时，优先使用 `Model` 对象，无特殊情况禁止转换为 `array`。
- 仅在向 `Controller` 层返回数据、或与外部接口（第三方 API、队列消息等）交互时，按需将 `Model` 对象转换为数组。

### 2.3 异常处理模式

- `Logic` 层 `public` 方法（对外接口方法）必须使用 `try/catch(Throwable)` 包裹业务逻辑，通过 `Helper::logListenException(static::class, __FUNCTION__, $throwable)` 统一返回 `JsonTable`。该函数自动识别 `AppException` 与普通异常，分别记录对应级别的日志并返回带错误信息的 `JsonTable`。
- `Logic` 层 `protected` / `private` 方法（内部方法）在遇到错误条件时直接抛出 `AppException`，由外层 `public` 方法的 `catch` 块统一捕获处理。禁止内部方法返回 `JsonTable::withError()` 后由调用方逐层判断 `isSuccess()`。
- 此模式确保错误处理逻辑收敛于 `public` 方法入口，内部方法保持简洁的直线流程。

```php
// 正确示例：
class ExampleLogic extends BaseLogic
{
    public function doSomething(int $id, array $params): JsonTable
    {
        try {
            $record = Model::find($id);
            if ($record === null) {
                throw new AppException('记录不存在', 25);
            }
            $this->validateAccess($record, $params);
            // ... 业务处理

            return JsonTable::withSuccessByData($result);
        } catch (Throwable $throwable) {
            return Helper::logListenException(static::class, __FUNCTION__, $throwable);
        }
    }

    protected function validateAccess(Model $record, array $params): void
    {
        if ($record->state !== 1) {
            throw new AppException('状态不允许操作', 50);
        }
    }
}
```

## 3. M：Model 模型层

- 负责数据表定义、主键、字段前缀、时间戳、类型转换等模型元数据。
- 只负责查询条件定义，不负责获取、写入或加工查询结果。
- 新增或复用查询条件必须沉淀为 `scopeXXX` 方法；`scope` 注释需说明筛选条件、业务用途和返回的查询构造器，供 `Logic` 层或调用方按业务参数调用。
- 所有 `scopeXXX` 查询方法的返回值统一为 `Hyperf\Database\Model\Builder`。
- 禁止在 `Model` 内调用 `first()`、`find()`、`get()`、`value()`、`pluck()`、`count()`、`exists()`、`create()`、`update()`、`delete()`、`save()` 等终结查询或写入方法；数据是否读取、读取哪些字段、是否加锁、是否写入或删除，必须由调用方决定。
- 非框架要求、查询构造器闭包、模型元数据读取等特殊情况外，禁止在 `Model` 中新增静态方法；对外提供查询能力统一使用 `scopeXXX`。
- 字段映射、标签转换、可写字段白名单、状态判断等非查询条件能力，应放在 `constants`、`Logic` 或其他对应职责类中，不得以静态工具方法放在 `Model` 中。
- 涉及编码生成回填最后编码时，对应 Model 应提供 `scopeLastCodeByPrefix` 这类局部作用域封装前缀筛选和排序条件，供 `GenerateCodeLogic` 统一调用。
- 禁止对真实字段使用获取器和修改器。
- 可对虚拟字段使用获取器。

示例：

- 若表中存在真实字段 `user_certtype`，禁止直接为其定义获取器。
- 可增加 `user_certtype_name` 这类虚拟字段并为其定义获取器。

## 4. V：View 视图层

- 负责界面渲染。
- 当前前后端分离时，`V` 层由 ng-alain 前端承担，后端不负责视图渲染。
