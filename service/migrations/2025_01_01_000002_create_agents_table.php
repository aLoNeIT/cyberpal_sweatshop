<?php

declare(strict_types=1);

use Hyperf\Database\Schema\Schema;
use Hyperf\Database\Schema\Blueprint;
use Hyperf\Database\Migrations\Migration;

/**
 * 创建 agents 表
 *
 * 对应架构文档 §3.2
 */
class CreateAgentsTable extends Migration
{
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->string('id', 36)->primary()->comment('UUID');
            $table->unsignedBigInteger('user_id')->nullable(false)->comment('租户归属');
            $table->string('name', 128)->nullable(false)->comment('Agent 名称');
            $table->string('description', 512)->nullable()->default('')->comment('描述');
            $table->text('system_prompt')->nullable()->comment('系统提示词');
            $table->text('append_system_prompt')->nullable()->comment('追加系统提示词');
            $table->string('provider', 64)->default('openai')->comment('LLM 提供商');
            $table->string('model', 64)->nullable(false)->comment('模型名');
            $table->string('thinking', 16)->default('medium')->comment('思考深度');
            $table->text('tools_whitelist')->nullable()->comment('工具白名单（逗号分隔，NULL=全部）');
            $table->text('tools_blacklist')->nullable()->comment('工具黑名单（逗号分隔）');
            $table->string('profile_name', 64)->nullable(false)->comment('OMP --profile 值，唯一派生 tenant_{user_id}');
            $table->enum('status', ['offline', 'online', 'error'])->default('offline')->comment('Agent 状态');
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();

            $table->index('user_id', 'idx_agents_user_id');
            $table->unique(['user_id', 'name'], 'uk_agents_user_name');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::getConnection()->statement('ALTER TABLE `agents` ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci');
    }

    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
}
