<?php

declare(strict_types=1);

use Hyperf\Database\Schema\Schema;
use Hyperf\Database\Schema\Blueprint;
use Hyperf\Database\Migrations\Migration;

/**
 * 创建 sessions 表
 *
 * 对应架构文档 §3.3
 */
class CreateSessionsTable extends Migration
{
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id', 36)->primary()->comment('UUID');
            $table->unsignedBigInteger('user_id')->nullable(false)->comment('租户归属');
            $table->string('agent_id', 36)->nullable(false)->comment('绑定 Agent');
            $table->string('title', 255)->nullable()->default('')->comment('会话标题（首条消息派生）');
            $table->string('omp_session_id', 128)->nullable()->comment('OMP 原生 session 文件 id');
            $table->enum('status', ['active', 'archived', 'deleted'])->default('active')->comment('会话状态');
            $table->enum('mode', ['normal', 'resumed', 'forked'])->default('normal')->comment('会话模式');
            $table->string('parent_session_id', 36)->nullable()->comment('fork 来源');
            $table->integer('message_count')->default(0)->comment('消息计数');
            $table->json('last_usage')->nullable()->comment('最近一次 usage 快照');
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
            $table->dateTime('archived_at')->nullable()->comment('归档时间');

            $table->index(['user_id', 'status'], 'idx_sessions_user_status');
            $table->index('agent_id', 'idx_sessions_agent_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('agent_id')->references('id')->on('agents')->onDelete('cascade');
        });

        Schema::getConnection()->statement('ALTER TABLE `sessions` ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci');
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
}
