<?php

declare(strict_types=1);

use Hyperf\Database\Schema\Schema;
use Hyperf\Database\Schema\Blueprint;
use Hyperf\Database\Migrations\Migration;

/**
 * 创建 events 表
 *
 * 对应架构文档 §3.5
 */
class CreateEventsTable extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('session_id', 36)->nullable(false)->comment('所属会话');
            $table->unsignedBigInteger('message_id')->nullable()->comment('关联 message');
            $table->enum('event_type', ['tool_call', 'usage', 'error', 'meta'])->nullable(false)->comment('事件类型');
            $table->integer('seq')->nullable(false)->comment('会话内顺序');
            $table->json('payload')->nullable(false)->comment('结构化数据');
            $table->dateTime('created_at')->nullable();

            $table->index(['session_id', 'seq'], 'idx_events_session_seq');
            $table->index(['session_id', 'event_type'], 'idx_events_session_type');
            $table->foreign('session_id')->references('id')->on('sessions')->onDelete('cascade');
        });

        Schema::getConnection()->statement('ALTER TABLE `events` ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci');
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
}
