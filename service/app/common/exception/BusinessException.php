<?php

declare(strict_types=1);

namespace app\common\exception;

use app\common\util\JsonTable;
use RuntimeException;
use Throwable;

class BusinessException extends RuntimeException
{
    protected int $state;

    /**
     * @var mixed
     */
    protected $data;

    /**
     * @param mixed $data
     */
    public function __construct(string $message = '', int $state = 1, $data = [], ?Throwable $previous = null)
    {
        parent::__construct($message, $state, $previous);

        $this->state = $state;
        $this->data = $data;
    }

    public function getState(): int
    {
        return $this->state;
    }

    /**
     * @return mixed
     */
    public function getData()
    {
        return $this->data;
    }

    public static function fromJsonTable(JsonTable $table): self
    {
        $message = is_scalar($table->msg) || $table->msg === null ? (string) $table->msg : 'business error';
        $data = $table->data;

        if (! is_scalar($table->msg) && $table->msg !== null) {
            if (is_array($data)) {
                $data['msg'] = $table->msg;
            } else {
                $data = [
                    'data' => $data,
                    'msg' => $table->msg,
                ];
            }
        }

        return new self($message, (int) $table->state, $data);
    }
}
