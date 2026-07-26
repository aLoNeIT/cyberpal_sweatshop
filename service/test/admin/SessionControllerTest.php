<?php

declare(strict_types=1);

namespace HyperfTest\admin;

use app\common\logic\ErrCodeLogic;
use app\common\util\JsonTable;
use app\http\admin\controller\v1\SessionController;
use app\http\admin\logic\AdminSessionLogic;
use Hyperf\Contract\SessionInterface;
use Mockery;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

/**
 * SessionController 单元测试。
 *
 * 覆盖 profile（未登录）、logout 等场景。
 *
 * @internal
 * @covers \app\http\admin\controller\v1\SessionController
 */
class SessionControllerTest extends TestCase
{
    /**
     * 创建被测控制器实例并注入 mock 依赖。
     */
    private function makeController(
        ?AdminSessionLogic $sessionLogic = null,
        ?ErrCodeLogic $errCodeLogic = null,
    ): SessionController {
        $controller = Mockery::mock(SessionController::class)->makePartial();
        $controller->shouldAllowMockingProtectedMethods();
        $ref = new ReflectionClass($controller);

        // 注入 sessionLogic
        if ($sessionLogic !== null) {
            $prop = $ref->getProperty('sessionLogic');
            $prop->setAccessible(true);
            $prop->setValue($controller, $sessionLogic);
        }

        // 注入 errCodeLogic
        if ($errCodeLogic !== null) {
            $prop = $ref->getProperty('errCodeLogic');
            $prop->setAccessible(true);
            $prop->setValue($controller, $errCodeLogic);
        }

        return $controller;
    }

    // ===================================================================
    // profile：未登录 → 错误码 80 (SESSION_INVALID)
    // ===================================================================

    public function testProfileWhenNotLoggedInReturnsSessionInvalid(): void
    {
        // sessionLogic->getUser() 返回 0（未登录）
        $sessionLogic = Mockery::mock(AdminSessionLogic::class);
        $sessionLogic->shouldReceive('getUser')
            ->once()
            ->andReturn(0);

        // errCodeLogic->getError(80) 返回 SESSION_INVALID
        $errCodeLogic = Mockery::mock(ErrCodeLogic::class);
        $errCodeLogic->shouldReceive('getError')
            ->once()
            ->with(80)
            ->andReturn(JsonTable::withError('登录态无效，请重新登录', 80));

        $controller = $this->makeController($sessionLogic, $errCodeLogic);

        $result = $controller->profile();

        $this->assertFalse($result->isSuccess());
        $this->assertSame(80, $result->state);
        $this->assertStringContainsString('登录', $result->msg);
    }

    // ===================================================================
    // profile：已登录 → 返回用户信息
    // ===================================================================

    public function testProfileWhenLoggedInReturnsUserInfo(): void
    {
        $sessionLogic = Mockery::mock(AdminSessionLogic::class);
        $sessionLogic->shouldReceive('getUser')
            ->once()
            ->andReturn(1);
        $sessionLogic->shouldReceive('getUsrAppType')
            ->once()
            ->andReturn(1); // APP_TYPE_ADMIN

        $controller = $this->makeController($sessionLogic);

        $result = $controller->profile();

        $this->assertTrue($result->isSuccess());
        $this->assertSame(0, $result->state);
        $this->assertSame(1, $result->data['user_id']);
        $this->assertSame(1, $result->data['app_type']);
    }

    // ===================================================================
    // logout：调用 sessionLogic->logout()
    // ===================================================================

    public function testLogoutDelegatesToSessionLogic(): void
    {
        $sessionLogic = Mockery::mock(AdminSessionLogic::class);
        $sessionLogic->shouldReceive('logout')
            ->once()
            ->andReturn(JsonTable::withSuccess());

        $controller = $this->makeController($sessionLogic);

        $result = $controller->logout();

        $this->assertTrue($result->isSuccess());
        $this->assertSame(0, $result->state);
    }

    // ===================================================================
    // tearDown
    // ===================================================================

    protected function tearDown(): void
    {
        parent::tearDown();
        Mockery::close();
    }
}
