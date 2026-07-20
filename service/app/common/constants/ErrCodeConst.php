<?php

declare(strict_types=1);

namespace app\common\constants;

use Hyperf\Constants\AbstractConstants;
use Hyperf\Constants\Annotation\Constants;

#[Constants]
class ErrCodeConst extends AbstractConstants
{
    public const SERVER_ERROR = 500;

    public const PARAM_ERROR = 6;

    public const APP_TYPE_NOT_FOUND = 8;

    public const NO_DATA_SUBMITTED = 20;

    public const RECORD_NOT_FOUND = 25;

    public const FIELD_EXCEEDS_MAX = 30;

    public const FIELD_BELOW_MIN = 31;

    public const FIELD_REGEX_FAILED = 32;

    public const REQUIRED_FIELD_MISSING = 33;

    public const DICT_NOT_FOUND = 40;

    public const DICT_ITEM_NOT_FOUND = 41;

    public const DICT_RANGE_ERROR = 43;

    public const FILE_ACCESS_DENIED = 60;

    public const SESSION_INVALID = 80;

    public const ACCESS_DENIED = 81;

    public const CAPTCHA_INVALID = 104;

    public const FEATURE_NOT_IMPLEMENTED = 501;

    protected static array $messages = [
        self::SERVER_ERROR => 'server error',
        self::PARAM_ERROR => 'param error',
        self::APP_TYPE_NOT_FOUND => 'app type not found',
        self::NO_DATA_SUBMITTED => 'no data submitted',
        self::RECORD_NOT_FOUND => 'record not found',
        self::FIELD_EXCEEDS_MAX => 'field exceeds max limit',
        self::FIELD_BELOW_MIN => 'field below min limit',
        self::FIELD_REGEX_FAILED => 'field regex validation failed',
        self::REQUIRED_FIELD_MISSING => 'required field missing',
        self::DICT_NOT_FOUND => 'dict not found',
        self::DICT_ITEM_NOT_FOUND => 'dict item not found',
        self::DICT_RANGE_ERROR => 'dict range error',
        self::FILE_ACCESS_DENIED => 'file access denied',
        self::SESSION_INVALID => 'session invalid',
        self::ACCESS_DENIED => 'access denied',
        self::CAPTCHA_INVALID => 'captcha invalid',
        self::FEATURE_NOT_IMPLEMENTED => 'not implemented',
    ];

    public static function messageFor(int $code, array $param = []): string
    {
        $message = self::$messages[$code] ?? 'error';
        foreach ($param as $key => $value) {
            $message = str_replace('{' . $key . '}', (string) $value, $message);
        }

        return $message;
    }
}
