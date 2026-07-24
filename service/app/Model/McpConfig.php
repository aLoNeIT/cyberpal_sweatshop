<?php

declare(strict_types=1);

namespace App\Model;

use Hyperf\Database\Model\SoftDeletes;

/**
 * MCP 配置模型
 *
 * 对应架构文档 §3.8 mcp_config 表。
 * per-agent 的 MCP server 条目，最终由 McpConfigGenerator 生成 .omp/mcp.json。
 *
 * 时间戳：create_time / update_time / delete_time 均为 BIGINT 秒级时间戳（项目统一约定）。
 *
 * @property string      $id           UUID
 * @property string      $agent_id     所属 Agent
 * @property string      $name         MCP Server 名称
 * @property string      $transport    stdio|http|sse
 * @property string|null $command      stdio: 可执行文件
 * @property array|null  $args_json    stdio: 参数数组
 * @property string|null $url          http/sse: 地址
 * @property array|null  $env_json     环境变量
 * @property array|null  $headers_json http/sse 鉴权头
 * @property int         $enabled      是否启用 0/1
 * @property int         $create_time  创建时间（秒级时间戳）
 * @property int         $update_time  更新时间（秒级时间戳）
 * @property int         $delete_time  删除时间（软删，秒级时间戳）
 */
class McpConfig extends Model
{
    use SoftDeletes;

    protected ?string $table = 'mcp_config';

    protected string $keyType = 'string';
    public bool $incrementing = false;

    public const CREATED_AT = 'create_time';
    public const UPDATED_AT = 'update_time';
    public const DELETED_AT = 'delete_time';

    protected array $fillable = [
        'id',
        'agent_id',
        'name',
        'transport',
        'command',
        'args_json',
        'url',
        'env_json',
        'headers_json',
        'enabled',
    ];

    protected array $casts = [
        'id'           => 'string',
        'enabled'      => 'integer',
        'args_json'    => 'json',
        'env_json'     => 'json',
        'headers_json' => 'json',
    ];

    protected array $attributes = [
        'enabled' => 1,
    ];
}
