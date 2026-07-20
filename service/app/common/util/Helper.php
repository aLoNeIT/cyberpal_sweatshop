<?php

declare(strict_types=1);

namespace app\common\util;

use app\common\exception\AppException;
use app\common\model\BaseModel;
use DateTime;
use DOMDocument;
use DOMElement;
use Hyperf\Context\RequestContext;
use Hyperf\Logger\LoggerFactory;
use Hyperf\Stringable\Str;
use SplTempFileObject;
use Throwable;

use function Hyperf\Config\config;
use function Hyperf\Support\make;

class Helper
{
    /**
     * 判断当前是否 CLI 运行环境。
     */
    public static function isCli(): bool
    {
        return preg_match('/cli/i', php_sapi_name()) === 1;
    }

    /**
     * 兼容旧版下划线命名的 CLI 环境判断。
     */
    public static function is_cli(): bool
    {
        return static::isCli();
    }

    /**
     * 将内容编码为 Unicode 字符串片段。
     */
    public static function unicodeEncode(string $str): string
    {
        $pattern = '/([\[\]\{\}])/i';
        $replacement = '\\\\${1}';
        $str = preg_replace($pattern, $replacement, $str) ?? $str;
        $str = '{"str":"' . $str . '"}';
        $encode = json_encode($str, JSON_UNESCAPED_UNICODE);

        return substr((string) $encode, 12, -4);
    }

    /**
     * 兼容旧版下划线命名的 Unicode 编码方法。
     */
    public static function unicode_encode(string $str): string
    {
        return static::unicodeEncode($str);
    }

    /**
     * 解析 Unicode 字符串片段。
     */
    public static function unicodeDecode(string $unicode_str, int $cutLen = 6): string
    {
        $cutPosCheck = strrpos($unicode_str, '\u');
        if ($cutPosCheck !== false && strlen($unicode_str) - $cutPosCheck < $cutLen) {
            $unicode_str = substr($unicode_str, 0, $cutPosCheck);
        }
        if (substr($unicode_str, -1) === '\\' && substr($unicode_str, -2, 1) !== '\\') {
            $unicode_str = substr($unicode_str, 0, -1);
        }

        $json = '{"str":"' . $unicode_str . '"}';
        $obj = json_decode($json);

        return empty($obj) ? '' : (string) $obj->str;
    }

    /**
     * 兼容旧版下划线命名的 Unicode 解码方法。
     */
    public static function unicode_decode(string $unicodeStr, int $cutLen = 6): string
    {
        return static::unicodeDecode($unicodeStr, $cutLen);
    }

    /**
     * md5 盐值加密。
     *
     * @param mixed $str
     * @param mixed $salt
     * @param mixed $md5
     */
    public static function md5Salt($str, $salt = 'cms', $md5 = false): string
    {
        return $md5 ? md5((string) $str . (string) $salt) : md5(md5((string) $str) . (string) $salt);
    }

    /**
     * 删除数组键名前缀。
     */
    public static function delPrefixArr(array $data = [], ?string $prefix = null, array $exclude = []): array
    {
        if ($prefix === null) {
            return $data;
        }

        $result = [];
        foreach ($data as $key => $value) {
            if (! in_array($key, $exclude, true)) {
                $result[static::delPrefix((string) $key, $prefix)] = $value;
            }
        }

        return $result;
    }

    /**
     * 删除字段前缀。
     */
    public static function delPrefix(string $key, ?string $prefix = null): string
    {
        if (static::existsPrefix($key, $prefix)) {
            return substr($key, strlen((string) $prefix));
        }

        return $key;
    }

    /**
     * 添加字段前缀。
     */
    public static function addPrefix(string $key, ?string $prefix = null, array $exclude = []): string
    {
        if ($prefix === null) {
            return $key;
        }
        if (static::existsPrefix($key, $prefix) || in_array($key, $exclude, true)) {
            return $key;
        }

        return $prefix . $key;
    }

    /**
     * 为数组键名添加前缀。
     */
    public static function addPrefixArr(array $data, ?string $prefix = null, array $exclude = []): array
    {
        if ($prefix === null) {
            return $data;
        }

        $result = [];
        foreach ($data as $key => $value) {
            if (! in_array($key, $exclude, true)) {
                $result[static::addPrefix((string) $key, $prefix)] = $value;
            }
        }

        return $result;
    }

    /**
     * 为数组或二维数组键名添加前缀。
     */
    public static function addPrefixArrAll(array $array, string $prefix = ''): array
    {
        $add = [];
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $ad = [];
                foreach ($value as $k => $v) {
                    $ad[$prefix . $k] = $v;
                }
                $add[] = $ad;
            } else {
                $add[$prefix . $key] = $value;
            }
        }

        return $add;
    }

    /**
     * 判断键名是否包含指定前缀。
     */
    public static function existsPrefix(string $key, ?string $prefix = null): bool
    {
        return $prefix === null ? false : Str::startsWith($key, $prefix);
    }

    /**
     * 替换字段前缀。
     */
    public static function updatePrefix(string $key, ?string $prefix = null, ?string $newPre = null): string
    {
        if (static::existsPrefix($key, $prefix)) {
            return (string) $newPre . substr($key, strlen((string) $prefix));
        }

        return (string) $newPre . $key;
    }

    /**
     * 替换数组键名前缀。
     */
    public static function updatePrefixArr(array $data, ?string $prefix = null, ?string $newPre = null, array $exclude = []): array
    {
        if ($prefix === null) {
            return $data;
        }

        $result = [];
        foreach ($data as $key => $value) {
            if (! in_array($key, $exclude, true)) {
                $result[static::updatePrefix((string) $key, $prefix, $newPre)] = $value;
            }
        }

        return $result;
    }

    /**
     * 生成随机字符串。
     */
    public static function randStr(int $length = 16, int $type = 5): string
    {
        $chars = '';
        if ((1 & $type) === 1) {
            $chars .= 'abcdefghijklmnopqrstuvwxyz';
        }
        if ((2 & $type) === 2) {
            $chars .= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        if ((4 & $type) === 4) {
            $chars .= '0123456789';
        }
        if ((8 & $type) === 8) {
            $chars .= '!@#$%^&*()_ []{}<>~`+=,.;:/?|';
        }

        $randStr = '';
        $maxIndex = strlen($chars) - 1;
        for ($i = 0; $i < $length; ++$i) {
            $randStr .= $chars[mt_rand(0, $maxIndex)];
        }

        return $randStr;
    }

    /**
     * 生成 UUID 风格字符串。
     */
    public static function makeUUID(string $splitChar = ''): string
    {
        $chars = md5(uniqid(random_bytes(16), true));

        return substr($chars, 0, 8)
            . $splitChar . substr($chars, 8, 4)
            . $splitChar . substr($chars, 12, 4)
            . $splitChar . substr($chars, 16, 4)
            . $splitChar . substr($chars, 20, 12);
    }

    /**
     * JsonTable 失败时抛出异常。
     */
    public static function throwifJError(JsonTable $jsonTable): JsonTable
    {
        if (!$jsonTable->isSuccess()) {
            throw AppException::fromJsonTable($jsonTable);
        }
        return $jsonTable;
    }

    /**
     * 生成旧版数组形态 JsonTable 响应。
     *
     * @param mixed $state 状态码
     * @param mixed $msg 响应消息
     * @param mixed $data 响应数据
     * @return array 响应数组
     */
    public static function jtable($state = 0, $msg = 'success', $data = []): array
    {
        return JsonTable::withMessage($msg, $state, $data)->toArray();
    }

    /**
     * 生成旧版成功响应数组。
     *
     * @param mixed $msg 响应消息
     * @param mixed $data 响应数据
     * @return array 响应数组
     */
    public static function jsuccess($msg = 'success', $data = []): array
    {
        return static::jtable(0, $msg, $data);
    }

    /**
     * 生成旧版失败响应数组。
     *
     * @param mixed $msg 响应消息
     * @param mixed $data 响应数据
     * @return array 响应数组
     */
    public static function jerror($msg = 'failed', int $state = 1, $data = []): array
    {
        return static::jtable($state, $msg, $data);
    }

    /**
     * 派发日志事件。
     *
     * @param mixed $data
     */
    public static function logListen(string $channel, string $msg, $data = null, string $level = 'info'): array
    {
        $request = RequestContext::getOrNull();
        $logData = [
            'channel' => $channel,
            'msg' => $msg,
            'level' => $level,
            'request_id' => $request?->getHeaderLine('x-request-id') ?: '',
            'origin_id' => $request?->getHeaderLine('x-origin-id') ?: '',
            'data' => $data,
        ];
        make(LoggerFactory::class)->get($channel)->log($level, $msg, $logData);
        return $logData;
    }

    /**
     * debug 级别日志。
     *
     * @param mixed $data
     */
    public static function logListenDebug(string $channel, string $msg, $data = null): array
    {
        return static::logListen($channel, $msg, $data, 'debug');
    }

    /**
     * error 级别日志。
     *
     * @param mixed $data
     */
    public static function logListenError(string $channel, string $msg, $data = null): array
    {
        return static::logListen($channel, $msg, $data, 'error');
    }

    /**
     * warning 级别日志。
     *
     * @param mixed $data
     */
    public static function logListenWarning(string $channel, string $msg, $data = null): array
    {
        return static::logListen($channel, $msg, $data, 'warning');
    }

    /**
     * critical 级别日志。
     *
     * @param mixed $data
     */
    public static function logListenCritical(string $channel, string $msg, $data = null): array
    {
        return static::logListen($channel, $msg, $data, 'critical');
    }

    /**
     * 记录异常并返回 JsonTable。
     */
    public static function logListenException(string $class, string $function, Throwable $ex, array $data = []): JsonTable
    {
        if ($ex->getPrevious() === null) {
            if ($ex instanceof AppException) {
                static::logListenError($class, $function . ':' . $ex->getMessage(), [
                    'trace' => $ex->getTrace(),
                    'exception_data' => $ex->getData(),
                    'origin_data' => $data,
                ]);
            } else {
                static::logListenCritical($class, $function . ':' . $ex->getMessage(), [
                    'trace' => $ex->getTrace(),
                    'origin_data' => $data,
                ]);
            }
        }
        $table = $ex instanceof AppException
            ? JsonTable::withError($ex->getMessage(), $ex->getState(), $ex->getData())
            : JsonTable::withError('系统异常，请稍后再试', 1, Helper::isDevEnv() ? ['trace' => $ex->getTrace()] : []);
        $table->setProperty('exception', $ex);
        return $table;
    }

    /**
     * 字符串转十六进制。
     *
     * @param mixed $str
     */
    public static function str2hex($str): string
    {
        $hex = '';
        $str = (string) $str;
        for ($i = 0, $length = mb_strlen($str); $i < $length; ++$i) {
            $hex .= dechex(ord($str[$i]));
        }

        return $hex;
    }

    /**
     * 十六进制转字符串。
     */
    public static function hex2str(string $hex): string
    {
        $str = '';
        foreach (str_split($hex, 2) as $bit) {
            $str .= chr((int) hexdec($bit));
        }

        return $str;
    }

    /**
     * 抛出业务异常。
     *
     * @param mixed $msg
     * @param mixed $state
     * @param mixed $data
     */
    public static function exception($msg = 'error', $state = 1, $data = null): void
    {
        if ($msg instanceof JsonTable) {
            throw AppException::fromJsonTable($msg);
        }

        throw new AppException((string) $msg, (int) $state, $data);
    }

    /**
     * 快捷实例化模型。
     */
    public static function model(string $name, bool $newInstance = true, ?string $layer = null): ?BaseModel
    {
        $layer = $layer ?: 'common';
        $clazz = "\\app\\{$layer}\\model\\{$name}Model";
        if (! class_exists($clazz) && $layer === 'common') {
            return null;
        }
        $clazz = "\\app\\common\\model\\{$name}Model";
        if (! class_exists($clazz)) {
            return null;
        }
        try {
            /** @var BaseModel $instance */
            $instance = $newInstance ? new $clazz() : make($clazz);
        } catch (Throwable) {
            $instance = null;
        }

        return $instance;
    }

    /**
     * 下划线字符串转换为小驼峰。
     */
    public static function toCamelCase(string $value): string
    {
        return lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $value))));
    }

    /**
     * 小驼峰字符串转换为下划线。
     */
    public static function camelCaseToUnderscore(string $value): string
    {
        return strtolower((string) preg_replace('/(?<!^)[A-Z]/', '_$0', $value));
    }

    /**
     * 脱敏字符串。
     */
    public static function stringConfident(string $str, string $keys = 'cert'): string
    {
        if ($str === '') {
            return $str;
        }
        $len = strlen($str);
        if ($keys === 'cert' || $keys === 'certcode') {
            if ($len > 15) {
                return substr($str, 0, 4) . '***********' . substr($str, $len - 4, 4);
            }
            $tag = (int) ($len / 3);

            return substr($str, 0, $tag) . '***********' . substr($str, $len - $tag, $tag);
        }
        if ($keys === 'card') {
            if ($len > 13) {
                return substr($str, 0, 6) . '******' . substr($str, $len - 4, 4);
            }
            $tag = (int) ($len / 3);

            return substr($str, 0, $tag) . '******' . substr($str, $len - $tag, $tag);
        }
        if ($len === 8) {
            return substr($str, 0, 3) . '****' . substr($str, $len - 4, 4);
        }
        if ($len === 11) {
            return substr($str, 0, 4) . '****' . substr($str, $len - 4, 4);
        }

        return substr($str, 0, 4) . '******' . substr($str, $len - 4, 4);
    }

    /**
     * 从数组中按点分隔键名逐级读取配置值。
     *
     * @param array<string, mixed> $array 源数组
     * @param string|null $name 点分隔键名，例如 `a.b.c`
     * @param mixed $default 缺失或类型不匹配时的默认值
     * @return mixed 查找到的值或默认值
     */
    public static function arrayGet(array $array, ?string $name = null, mixed $default = null): mixed
    {
        if ($name === null || $name === '') {
            return $array;
        }

        $value = $array;
        foreach (explode('.', $name) as $segment) {
            if (! is_array($value) || ! array_key_exists($segment, $value)) {
                return $default;
            }
            $value = $value[$segment];
        }

        return $value;
    }

    /**
     * 是否测试环境
     *
     * @return boolean
     */
    public static function isDevEnv(): bool
    {
        return in_array((string) config('config.app_env', 'dev'), ['dev', 'pre'], true);
    }
}
