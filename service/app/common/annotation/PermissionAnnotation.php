<?php

declare(strict_types=1);

namespace app\common\annotation;

use Attribute;
use Hyperf\Di\Annotation\AbstractAnnotation;
use InvalidArgumentException;

/**
 * 控制器类或方法权限注解。
 *
 * 类注解用于声明资源权限前缀，方法注解用于声明完整权限码或动作权限后缀。
 */
#[Attribute(Attribute::TARGET_CLASS | Attribute::TARGET_METHOD)]
class PermissionAnnotation extends AbstractAnnotation
{
    public const OPERATION_AND = 1;

    public const OPERATION_OR = 2;

    /**
     * @var array<int, string>
     */
    public array $code = [];

    public int $operation = self::OPERATION_OR;

    public bool $usePrefix = true;

    /**
     * @param array<string, mixed>|null $value 注解原始值
     * @param string|array<int, string> $code 权限码
     * @param int $operation 多权限关系
     * @param bool $usePrefix 是否拼接控制器类权限前缀
     */
    public function __construct($value = null, string|array $code = [], int $operation = self::OPERATION_OR, bool $usePrefix = true)
    {
        if (is_array($value)) {
            $code = $value['code'] ?? $value['value'] ?? $code;
            $operation = (int) ($value['operation'] ?? $operation);
            $usePrefix = (bool) ($value['usePrefix'] ?? $value['use_prefix'] ?? $usePrefix);
        }

        $codes = is_array($code) ? $code : [$code];
        $codes = array_values(array_filter(array_map(
            static fn (mixed $item): string => trim((string) $item),
            $codes
        ), static fn (string $item): bool => $item !== ''));

        if ($codes === []) {
            throw new InvalidArgumentException('PermissionAnnotation requires at least one permission code.');
        }

        if (! in_array($operation, [self::OPERATION_AND, self::OPERATION_OR], true)) {
            throw new InvalidArgumentException('PermissionAnnotation operation is invalid.');
        }

        $this->code = array_values(array_unique($codes));
        $this->operation = $operation;
        $this->usePrefix = $usePrefix;
    }
}
