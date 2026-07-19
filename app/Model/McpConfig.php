<?php

declare(strict_types=1);

namespace App\Model;

/**
 * MCP 配置模型
 *
 * 对应架构文档 §3.8 mcp_config 表。
 * per-agent 的 MCP server 条目，最终由 McpConfigGenerator 生成 .omp/mcp.json。
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
 * @property string      $created_at
 * @property string      $updated_at
 */
class McpConfig extends Model
{
    protected ?string $table = 'mcp_config';

    protected string $keyType = 'string';
    public bool $incrementing = false;

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
