<?php

declare(strict_types=1);

namespace app\common\exception\handler;

use app\common\exception\AppException;
use app\common\util\JsonTable;
use Hyperf\Contract\StdoutLoggerInterface;
use Hyperf\ExceptionHandler\ExceptionHandler;
use Hyperf\HttpMessage\Stream\SwooleStream;
use Psr\Http\Message\ResponseInterface;
use Throwable;

use function Hyperf\Config\config;

class AppExceptionHandler extends ExceptionHandler
{
    /**
     * @var StdoutLoggerInterface
     */
    protected $logger;

    public function __construct(StdoutLoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function handle(Throwable $throwable, ResponseInterface $response)
    {
        $this->logger->error(sprintf('%s[%s] in %s', $throwable->getMessage(), $throwable->getLine(), $throwable->getFile()));
        $this->logger->error($throwable->getTraceAsString());

        $table = $throwable instanceof AppException
            ? JsonTable::withError($throwable->getMessage(), $throwable->getState(), $throwable->getData())
            : JsonTable::withError('系统异常，请稍后再试', 1);

        if (in_array((string) config('config.app_env', 'dev'), ['dev', 'pre'], true)) {
            $data = is_array($table->data) ? $table->data : ['data' => $table->data];
            $data['trace'] = $throwable->getTrace();
            $table->data = $data;
        }

        $this->stopPropagation();
        return $response
            ->withHeader('content-type', 'application/json; charset=utf-8')
            ->withBody(new SwooleStream($table->toJson()));
    }

    public function isValid(Throwable $throwable): bool
    {
        return true;
    }
}
