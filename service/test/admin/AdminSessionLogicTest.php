<?php

declare(strict_types=1);

namespace HyperfTest\admin;

use app\common\constants\CommonConst;
use app\common\util\JsonTable;
use app\http\admin\logic\AdminSessionLogic;
use Hyperf\Contract\SessionInterface;
use Mockery;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

/**
 * AdminSessionLogic 单元测试。
 *
 * 覆盖登录成功/失败场景、密码工具方法、登出、Session 控制器 profile 等。
 *
 * @internal
 * @covers \app\http\admin\logic\AdminSessionLogic
 */
class AdminSessionLogicTest extends TestCase
{
    /**
     * 种子数据：admin / RzyL
     *
     * md5(md5('admin') . 'RzyL') = '4a2d0a43c3a7b6bd18c1d1092f9571ad'
     *
     * 注意：PRD 文档中声称的种子哈希 68b6b4ab792a4476db8f6937bb4c4d12
     * 与实际计算不符，此处使用正确计算值。
     */
    private const SEED_ACCOUNT = 'admin';
    private const SEED_PASSWORD = 'admin';
    private const SEED_SALT = 'RzyL';
    private const SEED_HASH = '4a2d0a43c3a7b6bd18c1d1092f9571ad';

    /**
     * 标准用户数据（状态正常）。
     */
    private function makeUserData(
        string $account = 'admin',
        string $hash = self::SEED_HASH,
        string $salt = self::SEED_SALT,
        int $state = 1,
    ): array {
        return [
            'id'        => 1,
            'account'   => $account,
            'real_name' => 'Administrator',
            'usr_pwd'   => $hash,
            'usr_salt'  => $salt,
            'usr_state' => $state,
            'functions' => [],
        ];
    }

    /**
     * 创建被测对象的 partial mock，注入 mock SessionInterface。
     */
    private function makeLogic(?SessionInterface $session = null): AdminSessionLogic
    {
        $session ??= Mockery::mock(SessionInterface::class);

        $logic = Mockery::mock(AdminSessionLogic::class)->makePartial();
        $logic->shouldAllowMockingProtectedMethods();

        // 注入 session（绕过 #[Inject]）
        $ref = new ReflectionClass($logic);
        $prop = $ref->getProperty('session');
        $prop->setAccessible(true);
        $prop->setValue($logic, $session);

        return $logic;
    }

    // ===================================================================
    // 1. 正常登录
    // ===================================================================

    public function testLoginSuccessReturnsTokenAndUser(): void
    {
        $userData = $this->makeUserData();
        $logic = $this->makeLogic();

        // mock: 找到用户 → 密码校验通过 → doLogin 返回成功
        $logic->shouldReceive('findUserByAccount')
            ->once()
            ->with(self::SEED_ACCOUNT, CommonConst::APP_TYPE_ADMIN)
            ->andReturn($userData);

        $logic->shouldReceive('doLogin')
            ->once()
            ->with($userData, CommonConst::APP_TYPE_ADMIN)
            ->andReturn(JsonTable::withSuccess('success', [
                'token'         => 'mock-token',
                'refresh_token' => 'mock-refresh',
                'expire_in'     => 7200,
                'user'          => [
                    'id'        => 1,
                    'app_type'  => CommonConst::APP_TYPE_ADMIN,
                    'account'   => 'admin',
                    'real_name' => 'Administrator',
                ],
            ]));

        $result = $logic->login(self::SEED_ACCOUNT, self::SEED_PASSWORD, CommonConst::APP_TYPE_ADMIN);

        $this->assertTrue($result->isSuccess());
        $this->assertSame(0, $result->state);
        $this->assertSame('success', $result->msg);
        $this->assertArrayHasKey('token', (array) $result->data);
        $this->assertArrayHasKey('user', (array) $result->data);
        $this->assertSame('mock-token', $result->data['token']);
    }

    // ===================================================================
    // 2. 密码验证正确性（真实 md5 运算）
    // ===================================================================

    public function testRealHashMatchesSeedData(): void
    {
        $expected = self::SEED_HASH;
        $actual = md5(md5(self::SEED_PASSWORD) . self::SEED_SALT);

        $this->assertSame($expected, $actual);
    }

    // ===================================================================
    // 3. 空账号 → 错误码 6
    // ===================================================================

    public function testLoginWithEmptyAccountReturnsParamError(): void
    {
        $logic = $this->makeLogic();

        // 不应调用 findUserByAccount / doLogin
        $logic->shouldNotReceive('findUserByAccount');
        $logic->shouldNotReceive('doLogin');

        $result = $logic->login('', 'any-password', CommonConst::APP_TYPE_ADMIN);

        $this->assertFalse($result->isSuccess());
        $this->assertSame(6, $result->state);
    }

    // ===================================================================
    // 4. 空密码 → 错误码 6
    // ===================================================================

    public function testLoginWithEmptyPasswordReturnsParamError(): void
    {
        $logic = $this->makeLogic();

        $logic->shouldNotReceive('findUserByAccount');
        $logic->shouldNotReceive('doLogin');

        $result = $logic->login('admin', '', CommonConst::APP_TYPE_ADMIN);

        $this->assertFalse($result->isSuccess());
        $this->assertSame(6, $result->state);
    }

    // ===================================================================
    // 5. 账号不存在 → 错误码 25，"账号不存在"
    // ===================================================================

    public function testLoginWithNonexistentAccountReturnsNotFound(): void
    {
        $logic = $this->makeLogic();

        $logic->shouldReceive('findUserByAccount')
            ->once()
            ->with('nonexistent', CommonConst::APP_TYPE_ADMIN)
            ->andReturn(null);

        $logic->shouldNotReceive('doLogin');

        $result = $logic->login('nonexistent', 'any-password', CommonConst::APP_TYPE_ADMIN);

        $this->assertFalse($result->isSuccess());
        $this->assertSame(25, $result->state);
        $this->assertStringContainsString('账号不存在', $result->msg);
    }

    // ===================================================================
    // 6. 密码错误 → 错误码 25，"密码错误"
    // ===================================================================

    public function testLoginWithWrongPasswordReturnsPasswordError(): void
    {
        $userData = $this->makeUserData();
        $logic = $this->makeLogic();

        $logic->shouldReceive('findUserByAccount')
            ->once()
            ->with(self::SEED_ACCOUNT, CommonConst::APP_TYPE_ADMIN)
            ->andReturn($userData);

        $logic->shouldNotReceive('doLogin');

        $result = $logic->login(self::SEED_ACCOUNT, 'wrong-password', CommonConst::APP_TYPE_ADMIN);

        $this->assertFalse($result->isSuccess());
        $this->assertSame(25, $result->state);
        $this->assertStringContainsString('密码错误', $result->msg);
    }

    // ===================================================================
    // 7. 账号已禁用（usr_state=0）→ 错误码 25，"账号已禁用"
    // ===================================================================

    public function testLoginWithDisabledAccountReturnsDisabledError(): void
    {
        $userData = $this->makeUserData(state: 0);
        $logic = $this->makeLogic();

        $logic->shouldReceive('findUserByAccount')
            ->once()
            ->with(self::SEED_ACCOUNT, CommonConst::APP_TYPE_ADMIN)
            ->andReturn($userData);

        // 不应走到密码验证或 doLogin
        $logic->shouldNotReceive('doLogin');

        $result = $logic->login(self::SEED_ACCOUNT, self::SEED_PASSWORD, CommonConst::APP_TYPE_ADMIN);

        $this->assertFalse($result->isSuccess());
        $this->assertSame(25, $result->state);
        $this->assertStringContainsString('账号已禁用', $result->msg);
    }

    // ===================================================================
    // 8. hashPassword 正确性
    // ===================================================================

    public function testHashPasswordMatchesSeedHash(): void
    {
        $logic = $this->makeLogic();

        $hash = $logic->hashPassword(self::SEED_PASSWORD, self::SEED_SALT);

        $this->assertSame(self::SEED_HASH, $hash);
    }

    public function testHashPasswordIsDeterministic(): void
    {
        $logic = $this->makeLogic();

        $hash1 = $logic->hashPassword('test123', 'Ab12');
        $hash2 = $logic->hashPassword('test123', 'Ab12');

        $this->assertSame($hash1, $hash2);
    }

    public function testHashPasswordWithDifferentPasswordProducesDifferentHash(): void
    {
        $logic = $this->makeLogic();

        $hash1 = $logic->hashPassword('password1', self::SEED_SALT);
        $hash2 = $logic->hashPassword('password2', self::SEED_SALT);

        $this->assertNotSame($hash1, $hash2);
    }

    public function testHashPasswordWithDifferentSaltProducesDifferentHash(): void
    {
        $logic = $this->makeLogic();

        $hash1 = $logic->hashPassword(self::SEED_PASSWORD, 'SaltA');
        $hash2 = $logic->hashPassword(self::SEED_PASSWORD, 'SaltB');

        $this->assertNotSame($hash1, $hash2);
    }

    // ===================================================================
    // 9. generateSalt 长度（4 字符）
    // ===================================================================

    public function testGenerateSaltReturnsFourCharacters(): void
    {
        $logic = $this->makeLogic();

        $salt = $logic->generateSalt();

        $this->assertIsString($salt);
        $this->assertSame(4, strlen($salt));
    }

    public function testGenerateSaltContainsOnlyAllowedCharacters(): void
    {
        $logic = $this->makeLogic();

        // 多次生成验证字符集
        for ($i = 0; $i < 20; $i++) {
            $salt = $logic->generateSalt();
            $this->assertMatchesRegularExpression('/^[a-zA-Z0-9]{4}$/', $salt);
        }
    }

    // ===================================================================
    // 10. verifyPassword（通过反射调用 protected 方法）
    // ===================================================================

    public function testVerifyPasswordReturnsTrueForCorrectPassword(): void
    {
        $logic = $this->makeLogic();
        $ref = new ReflectionClass($logic);
        $method = $ref->getMethod('verifyPassword');
        $method->setAccessible(true);

        $result = $method->invoke($logic, self::SEED_PASSWORD, self::SEED_HASH, self::SEED_SALT);

        $this->assertTrue($result);
    }

    public function testVerifyPasswordReturnsFalseForWrongPassword(): void
    {
        $logic = $this->makeLogic();
        $ref = new ReflectionClass($logic);
        $method = $ref->getMethod('verifyPassword');
        $method->setAccessible(true);

        $result = $method->invoke($logic, 'wrong', self::SEED_HASH, self::SEED_SALT);

        $this->assertFalse($result);
    }

    public function testVerifyPasswordReturnsFalseForWrongHash(): void
    {
        $logic = $this->makeLogic();
        $ref = new ReflectionClass($logic);
        $method = $ref->getMethod('verifyPassword');
        $method->setAccessible(true);

        $result = $method->invoke($logic, self::SEED_PASSWORD, 'ffffffffffffffffffffffffffffffff', self::SEED_SALT);

        $this->assertFalse($result);
    }

    // ===================================================================
    // 11. logout → session->invalidate() 被调用
    // ===================================================================

    public function testLogoutInvalidatesSession(): void
    {
        $session = Mockery::mock(SessionInterface::class);
        $session->shouldReceive('invalidate')
            ->once()
            ->andReturn(true);

        $logic = $this->makeLogic($session);

        $result = $logic->logout();

        $this->assertTrue($result->isSuccess());
        $this->assertSame(0, $result->state);
    }

    // ===================================================================
    // 12. 参数化测试：多种空参数组合
    // ===================================================================

    public function testLoginWithBothEmptyReturnsParamError(): void
    {
        $logic = $this->makeLogic();

        $logic->shouldNotReceive('findUserByAccount');
        $logic->shouldNotReceive('doLogin');

        $result = $logic->login('', '', CommonConst::APP_TYPE_ADMIN);

        $this->assertFalse($result->isSuccess());
        $this->assertSame(6, $result->state);
    }

    // ===================================================================
    // 13. 验证登录时默认 appType 为 APP_TYPE_ADMIN
    // ===================================================================

    public function testLoginUsesAdminAppTypeByDefault(): void
    {
        $userData = $this->makeUserData();
        $logic = $this->makeLogic();

        $logic->shouldReceive('findUserByAccount')
            ->once()
            ->with(self::SEED_ACCOUNT, CommonConst::APP_TYPE_ADMIN)
            ->andReturn($userData);

        $logic->shouldReceive('doLogin')
            ->once()
            ->with($userData, CommonConst::APP_TYPE_ADMIN)
            ->andReturn(JsonTable::withSuccess('success'));

        // 不传 appType，使用默认值
        $result = $logic->login(self::SEED_ACCOUNT, self::SEED_PASSWORD);

        $this->assertTrue($result->isSuccess());
    }

    // ===================================================================
    // tearDown：清理 Mockery
    // ===================================================================

    protected function tearDown(): void
    {
        parent::tearDown();
        Mockery::close();
    }
}
