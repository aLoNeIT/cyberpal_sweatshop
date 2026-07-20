# 测试规范

本文档用于统一测试目录结构、接口测试组织方式、执行入口、断言要求和风险控制原则。

## 1. 测试目录结构

`test` 目录下的业务测试统一收敛到 `test/cases/`，按"测试入口先区分共享与 HTTP，再按应用与控制器拆分"的方式组织，所有目录名一律使用小写。

推荐结构如下：

```text
test/
├─ bootstrap.php
├─ tmp/
├─ testcase/
│  └─ ApiTestCase.php
├─ support/
│  ├─ config/
│  ├─ helper/
│  └─ assertion/
└─ cases/
   ├─ common/
   │  └─ json_table/
   │     └─ JsonTableTest.php
   └─ http/
      ├─ home/
      │  ├─ index/
      │  │  ├─ IndexTest.php
      │  │  └─ RootHealthTest.php
      │  └─ sms/
      │     └─ SmsTest.php
      ├─ admin/
      │  └─ session/
      │     └─ SessionTest.php
      └─ user/
         └─ session/
            └─ SessionTest.php
```

说明：

- `test/cases/common/`：共享的非 HTTP 测试目录，放纯单元测试或跨应用公共测试。
- `test/cases/http/<app>/<controller>/`：真实接口测试主目录，按应用目录拆分，再按控制器目录拆分。
- 冒烟测试不再使用顶层 `Smoke` 目录，而是与对应控制器测试同目录放置。
- `test/testcase/`：测试基类目录，放 HTTP 请求封装、公共断言和环境初始化逻辑。
- `test/support/`：测试辅助目录，放公共配置、辅助方法和断言工具，不放业务测试入口。

## 2. 接口测试组织方式

- 后续新增接口测试统一基于 Hyperf 3.1 官方测试框架 `hyperf/testing` 开发，参考文档：`https://hyperf.wiki/3.1/#/zh-cn/testing`。
- 接口测试主方案使用 `Hyperf\Testing\Client` 模拟 HTTP 请求，不要求启动 Hyperf Server。
- 基于 `Hyperf\Testing\Client` 的方案属于项目默认标准方案，后续新增接口测试优先通过该方案完成快速验证，不再以真实 `curl` 请求、手工拼接 HTTP 报文或依赖外部启动端口作为常规入口。
- 项目已提供 `hyperf_test\http_test_case` 作为 HTTP 测试基类，新增接口测试优先继承该基类，并使用 `$this->get()`、`$this->post()`、`$this->json()`、`$this->file()`、`$this->request()` 发起请求。
- 业务接口默认按 JSON 数据交互编写测试，优先使用 `$this->json()` 提交请求体；仅在接口明确约定 `application/x-www-form-urlencoded`、文件上传或历史兼容场景时才使用 `$this->post()`。
- 不再使用 Guzzle、curl 或 `TEST_BASE_URI` 请求真实端口作为常规接口测试主方案；真实端口测试仅作为专项端到端验证补充。
- 接口测试文件按"应用 -> 控制器 -> 测试文件"组织，例如：
  - `test/cases/http/admin/session/SessionTest.php`
  - `test/cases/http/admin/user/UserTest.php`
  - `test/cases/http/user/session/SessionTest.php`
- 一个资源模块原则上对应一个测试文件。
- 单个控制器拥有独立的小写目录；该控制器下的接口以测试方法形式归档在对应测试文件内，不为每个接口单独建文件。

测试方法命名规范：

- `testLoginCodeReadReturnsUnifiedResponse`
- `testIndexReturnsListResponse`
- `testSaveWithEmptyBodyReturnsValidationError`

补充要求：

- 编写接口测试时，优先把"请求参数预定义 + 统一响应断言 + 登录态准备"放在同一个测试文件内完成，不依赖外部脚本或手动 curl。
- 需要连续请求的场景，例如"先获取验证码再登录""先登录再访问业务接口"，统一通过 `Hyperf\Testing\Client` 在测试内串联完成。
- 登录态、Cookie、Header 传递优先通过 `request()` 获取原始 Response 后读取 Header，再在后续请求中显式透传，不要求启动真实 Server 验证。
- 只有当需求明确要验证 Nginx、网关、容器网络、跨服务回调、真实静态资源输出等端到端链路时，才允许补充真实端口或 curl 级别测试。

## 3. 请求地址与环境约定

- 测试代码中只写相对路径，例如 `/admin/v1/session/login_code`。
- `Hyperf\Testing\Client` 会在不启动 Server 的情况下走路由、中间件、控制器和响应转换流程。
- 多端口服务测试如需指定 server，可按官方文档通过 `make(Client::class, ['server' => 'serverName'])` 创建客户端。
- 默认高阶方法会使用 `JsonPacker` 将响应 Body 解析为数组；如接口返回非 JSON 字符串，需按官方文档为 `Client` 指定自定义 `Packer`。
- 需要断言 Cookie、原始 Header、HTTP 状态码或响应 Body 时，使用 `$this->request()`、`initRequest()`、`sendRequest()` 等低阶能力获取 PSR-7 Response。

补充说明：

- `Hyperf\Testing\Client` 已足以覆盖绝大多数后端接口验证需求，包括路由匹配、中间件执行、请求参数解析、依赖注入、控制器返回、异常处理与统一响应结构。
- 该方案执行速度快、环境依赖少、定位问题直接，适合作为日常开发阶段的主验证方式。
- 后续需求文档、代码评审和提测说明中，如提到"已完成接口自测"，默认指已通过 `Hyperf\Testing\Client` 方案完成对应接口验证；若使用真实端口或 curl，应额外说明原因。

## 4. 请求数据与响应数据预定义

- 请求数据预定义、响应预期预定义必须直接写在测试文件内。
- 预定义数据使用独立变量存储，便于快速调整。
- 不将请求体和响应体拆到独立 `json` fixture 文件中。

推荐写法：

```php
public function testLoginCodeReadReturnsUnifiedResponse(): void
{
    $request = [
        'method' => 'GET',
        'uri' => '/admin/v1/session/login_code',
        'query' => [],
        'headers' => [],
        'body' => [],
    ];

    $expected = [
        'state' => 0,
        'msg' => 'success',
        'data' => [
            'captcha' => false,
        ],
    ];

    $response = $this->get($request['uri'], $request['query'], $request['headers']);

    $this->assertSame($expected['state'], $response['state'] ?? null);
    $this->assertSame($expected['msg'], $response['msg'] ?? null);
    $this->assertSame($expected['data'], $response['data'] ?? null);
}
```

要求：

- 请求参数集中在 `$request` 变量中维护。
- 断言目标集中在 `$expected` 变量中维护。
- 修改请求或响应预期时，不应在测试方法内四处分散硬编码。
- JSON 接口测试中的请求体字段统一放在 `$request['json']`、`$request['body']` 或等价的 JSON 语义变量中，不再使用 `form_params` 命名。
- 当测试依赖前置接口响应结果时，前置请求也应先收敛到独立变量中，例如 `$captchaRequest`、`$loginRequest`、`$headers`，避免在后续断言和请求中重复散写。

## 5. 测试执行入口

- 所有测试统一通过 `composer` 命令触发，不直接约定使用裸 `phpunit` 或 `co-phpunit` 命令作为日常入口。
- 项目标准入口为：`composer test`
- `composer test` 当前通过 `vendor/bin/co-phpunit` 执行，依赖 PHP 8.1+ 和 Swoole 协程环境。
- 宿主机 PHP/Swoole 不满足要求时，通过容器内 PHP 执行测试。

标准执行方式：

- 全量测试：`composer test`
- 仅跑 HTTP 测试目录：`composer test -- test/cases/http`
- 仅跑某个应用目录：`composer test -- test/cases/http/admin`
- 仅跑某个控制器测试文件：`composer test -- test/cases/http/admin/session/SessionTest.php`
- 仅跑某个具体接口测试方法：`composer test -- test/cases/http/admin/session/SessionTest.php --filter testLoginCodeReadReturnsUnifiedResponse`
- 仅跑共享非 HTTP 测试：`composer test -- test/cases/common`

说明：

- 后续如需增加 `composer test:api`、`composer test:smoke` 等脚本，可在不破坏 `composer test` 主入口的前提下补充。
- 新增测试规范时，必须保证全量运行、按模块运行、按单接口运行三种方式都可用。

## 6. 接口测试断言要求

- 使用 `$this->get()`、`$this->json()`、`$this->post()` 等高阶方法时，必须断言统一返回结构中的 `state`、`msg`、`data`。
- 需要验证 HTTP 状态码时，使用 `$this->request()` 或 `sendRequest()` 获取原始 Response 后断言状态码。
- 列表接口优先断言返回结构与分页字段格式。
- 详情接口优先断言主键、关键业务字段和空数据场景。
- 参数校验接口优先断言错误码、错误消息和字段提示。
- 未提供登录态、第三方凭据或测试样本时，应优先编写"可执行且不破坏数据"的校验类测试。
- 依赖固定账号、字典、角色等测试样本时，必须先确认测试环境数据满足前置条件；测试代码不得擅自修改共享环境中的账号密码或关键业务状态。

## 7. 风险控制要求

- 删除、初始化、状态流转、锁定、月结、真实文件上传、真实短信发送、真实第三方调用等接口，默认不得直接在共享环境执行破坏性测试。
- 这类接口如需测试，必须先确认测试环境、样本数据与回滚方案。
- 无开发账号时，优先覆盖：
  - 公共可访问接口
  - 登录类接口的缺参或错误参场景
  - 列表与详情类只读接口
  - 统一响应结构与错误处理行为
