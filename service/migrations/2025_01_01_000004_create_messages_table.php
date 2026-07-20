<?php

declare(strict_types=1);

use Hyperf\Database\Schema\Schema;
use Hyperf\Database\Schema\Blueprint;
use Hyperf\Database\Migrations\Migration;

/**
 * 创建 messages 表
 *
 * 对应架构文档 §3.4
 */
class CreateMessagesTable extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('session_id', 36)->nullable(false)->comment('所属会话');
            $table->enum('role', ['user', 'assistant', 'system'])->nullable(false)->comment('消息角色');
            $table->mediumText('content')->nullable()->comment('正文（assistant 累积 delta）');
            $table->mediumText('thinking')->nullable()->comment('思考过程');
            $table->integer('seq')->nullable(false)->comment('会话内顺序');
            $table->dateTime('created_at')->nullable();

            $table->index(['session_id', 'seq'], 'idx_messages_session_seq');
            $table->foreign('session_id')->references('id')->on('sessions')->onDelete('cascade');
        });

        Schema::getConnection()->statement('ALTER TABLE `messages` ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci');
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
}
