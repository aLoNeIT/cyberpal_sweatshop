<?php

declare(strict_types=1);

namespace app\common\model;

/**
 * MCP 模板模型（对应 cs_mcp_template 表）
 *
 * tablename = "McpTemplate" → Helper::model("McpTemplate") → McpTemplateModel
 */
class McpTemplateModel extends BaseModel
{
    protected ?string $table = 'mcp_template';
    protected string $primaryKey = 'id';
    protected string $keyType = 'string';
    public bool $incrementing = false;
    public bool $timestamps = false;

    protected array $fillable = [
        'id',
        'name',
        'description',
        'transport',
        'command',
        'args_json',
        'url',
        'env_json',
        'headers_json',
        'enabled',
        'create_time',
        'update_time',
    ];
}
