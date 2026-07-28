<?php

declare(strict_types=1);

namespace app\common\logic;

use app\common\util\JsonTable;
use function Ella123\HyperfCaptcha\captcha_create;
use function Ella123\HyperfCaptcha\captcha_verify;

/**
 * 验证码逻��� — 封装 ella123/hyperf-captcha 包。
 */
class CaptchaLogic extends BaseLogic
{
    /**
     * 创建验证码。
     *
     * @return JsonTable data 包含 key 和 img（base64）
     */
    public function create(): JsonTable
    {
        $captcha = captcha_create();

        return JsonTable::withSuccess('success', [
            'key' => (string) ($captcha['key'] ?? ''),
            'img' => (string) ($captcha['img'] ?? ''),
        ]);
    }

    /**
     * 校验验证码。
     *
     * @param string $code 用户输入的验证码
     * @param string $key  会话中保存的验证码 key
     * @return JsonTable
     */
    public function validate(string $code, string $key): JsonTable
    {
        $code = trim($code);
        $key  = trim($key);
        if ($code === '' || $key === '') {
            return JsonTable::withError('captcha invalid', 104);
        }

        return captcha_verify($code, $key)
            ? JsonTable::withSuccess()
            : JsonTable::withError('captcha invalid', 104);
    }
}
