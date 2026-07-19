<?php

declare(strict_types=1);

namespace App\Constants;

/**
 * SSE 事件类型常量（前后端共用）
 *
 * 对应架构文档 §8.4 的事件类型约定。
 * 前端 EventSource 按这些事件名注册监听。
 */
class EventType
{
    /** 文本增量（delta） */
    public const DELTA = 'delta';

    /** 思考过程增量 */
    public const THINKING = 'thinking';

    /** 工具调用开始 */
    public const TOOL_START = 'tool_start';

    /** 工具调用结束 */
    public const TOOL_END = 'tool_end';

    /** 工具执行中 */
    public const TOOL_EXEC = 'tool_exec';

    /** Token 用量信息 */
    public const USAGE = 'usage';

    /** 对话完成 */
    public const DONE = 'done';

    /** 错误事件 */
    public const ERROR = 'error';

    /** 连接关闭 */
    public const CLOSE = 'close';

    /** stdin 写入类型：发送用户消息 */
    public const SEND_PROMPT = 'send_prompt';

    /**
     * 所有 SSE 事件类型列表
     *
     * @return string[]
     */
    public static function all(): array
    {
        return [
            self::DELTA,
            self::THINKING,
            self::TOOL_START,
            self::TOOL_END,
            self::TOOL_EXEC,
            self::USAGE,
            self::DONE,
            self::ERROR,
            self::CLOSE,
        ];
    }
}
