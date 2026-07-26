<?php

declare(strict_types=1);

/**
 * Minimal bootstrap for unit tests that don't require Hyperf/Swoole runtime.
 *
 * Strategy:
 * 1. Register a container with config() support
 * 2. Pre-instantiate ErrCodeLogic via reflection to avoid DI issues
 * 3. Store it in the container so make() can resolve it
 */
! defined('BASE_PATH') && define('BASE_PATH', dirname(__DIR__, 1));

require BASE_PATH . '/vendor/autoload.php';

use Hyperf\Config\Config;
use Hyperf\Context\ApplicationContext;
use Hyperf\Contract\ConfigInterface;

// ===================================================================
// 1. Config setup
// ===================================================================
$errMessages = require BASE_PATH . '/config/autoload/errcode.php';

$config = new Config([
    'errcode' => $errMessages,
]);

// ===================================================================
// 2. Pre-build ErrCodeLogic instance (bypass DI)
// ===================================================================
$errCodeRefl = new ReflectionClass(\app\common\logic\ErrCodeLogic::class);
$errCodeLogic = $errCodeRefl->newInstanceWithoutConstructor();

// Inject JsonTable (BaseLogic requires it)
$jtProp = $errCodeRefl->getProperty('jsonTable');
$jtProp->setAccessible(true);
$jtProp->setValue($errCodeLogic, new \app\common\util\JsonTable());

// ===================================================================
// 3. Build a container that can serve ConfigInterface + ErrCodeLogic
// ===================================================================
$container = new class($config, $errCodeLogic) implements \Psr\Container\ContainerInterface {
    private Config $config;
    private object $errCodeLogic;

    public function __construct(Config $config, object $errCodeLogic)
    {
        $this->config = $config;
        $this->errCodeLogic = $errCodeLogic;
    }

    public function get(string $id)
    {
        if ($id === ConfigInterface::class || $id === Config::class) {
            return $this->config;
        }
        if ($id === \app\common\logic\ErrCodeLogic::class) {
            return $this->errCodeLogic;
        }
        throw new \RuntimeException("Test container cannot resolve: {$id}");
    }

    public function has(string $id): bool
    {
        return in_array($id, [
            ConfigInterface::class,
            Config::class,
            \app\common\logic\ErrCodeLogic::class,
        ], true);
    }
};

ApplicationContext::setContainer($container);
