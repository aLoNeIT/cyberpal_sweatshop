<?php

declare(strict_types=1);

namespace app\common\constants;

use Hyperf\Constants\AbstractConstants;
use Hyperf\Constants\Annotation\Constants;

#[Constants]
class CommonConst extends AbstractConstants
{
    public const APP_TYPE_HOME = 0;
    public const APP_TYPE_ADMIN = 1;
    public const APP_TYPE_USER = 4;
    public const APP_TYPE_OPEN_PLATFORM = 7;

    public const APP_TYPE_NAME_ADMIN = 'admin';
    public const APP_TYPE_NAME_HOME = 'home';
    public const APP_TYPE_NAME_USER = 'user';
    public const APP_TYPE_NAME_OPEN_PLATFORM = 'open_platform';
    public const REQUEST_ATTRIBUTE_APP_TYPE = 'request.app_type';
    public const REQUEST_ATTRIBUTE_APP_TYPE_NAME = 'request.app_type_name';
    public const KEY_CAPTCHA_LOGIN = 'captcha_login_key:';

    /**
     * 应用类型映射
     */
    public const APP_TYPE_MAP = [
        self::APP_TYPE_HOME => self::APP_TYPE_NAME_HOME,
        self::APP_TYPE_ADMIN => self::APP_TYPE_NAME_ADMIN,
        self::APP_TYPE_USER => self::APP_TYPE_NAME_USER,
        self::APP_TYPE_OPEN_PLATFORM => self::APP_TYPE_NAME_OPEN_PLATFORM,
    ];
    /**
     * 应用类型名称映射
     */
    public const APP_TYPE_NAME_MAP = [
        self::APP_TYPE_NAME_HOME => self::APP_TYPE_HOME,
        self::APP_TYPE_NAME_ADMIN => self::APP_TYPE_ADMIN,
        self::APP_TYPE_NAME_USER => self::APP_TYPE_USER,
        self::APP_TYPE_NAME_OPEN_PLATFORM => self::APP_TYPE_OPEN_PLATFORM,
    ];
}
