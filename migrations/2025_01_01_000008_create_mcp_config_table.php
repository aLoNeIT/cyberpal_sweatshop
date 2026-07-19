<?php

declare(strict_types=1);

use Hyperf\Database\Schema\Schema;
use Hyperf\Database\Schema\Blueprint;
use Hyperf\Database\Migrations\Migration;

/**
 * 创建 mcp_config 表
 *
 * 对应架构文档 §3.8
 */
class CreateMcpConfigTable extends Migration
{
    public function up(): void
    {
        Schema::create('mcp_config', function (Blueprint $table) {
            $table->string('id', 36)->primary()->comment('UUID');
            $table->string('agent_id', 36)->nullable(false)->comment('所属 Agent');
            $table->string('name', 128)->nullable(false)->comment('MCP Server 名称');
            $table->enum('transport', ['stdio', 'http', 'sse'])->nullable(false)->comment('传输方式');
            $table->string('command', 255)->nullable()->comment('stdio: 可执行文件');
            $table->json('args_json')->nullable()->comment('stdio: 参数数组');
            $table->string('url', 512)->nullable()->comment('http/sse: 地址');
            $table->json('env_json')->nullable()->comment('环境变量');
            $table->json('headers_json')->nullable()->comment('http/sse 鉴权头');
            $table->tinyInteger('enabled')->default(1)->comment('是否启用 0/1');
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();

            $table->index(['agent_id', 'enabled'], 'idx_mcp_agent_enabled');
            $table->foreign('agent_id')->references('id')->on('agents')->onDelete('cascade');
        });

        Schema::getConnection()->statement('ALTER TABLE `mcp_config` ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci');
    }

    public function down(): void
    {
        Schema::dropIfExists('mcp_config');
    }
}
