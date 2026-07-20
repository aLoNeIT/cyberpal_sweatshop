<?php

declare(strict_types=1);

use Hyperf\Database\Schema\Schema;
use Hyperf\Database\Schema\Blueprint;
use Hyperf\Database\Migrations\Migration;

/**
 * 创建 billing_records 表
 *
 * 对应架构文档 §3.6
 */
class CreateBillingRecordsTable extends Migration
{
    public function up(): void
    {
        Schema::create('billing_records', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->nullable(false)->comment('租户');
            $table->string('session_id', 36)->nullable(false)->comment('所属会话');
            $table->string('agent_id', 36)->nullable(false)->comment('所属 Agent');
            $table->string('model', 64)->nullable()->default('')->comment('模型');
            $table->string('provider', 64)->nullable()->default('')->comment('提供商');
            $table->integer('input_tokens')->default(0)->comment('输入 token');
            $table->integer('output_tokens')->default(0)->comment('输出 token');
            $table->integer('cache_read_tokens')->default(0)->comment('缓存读取 token');
            $table->integer('cache_write_tokens')->default(0)->comment('缓存写入 token');
            $table->decimal('cost_estimate', 10, 6)->default(0.000000)->comment('估算费用（USD）');
            $table->enum('source', ['usage', 'estimate', 'provider_api'])->nullable(false)->comment('数据来源');
            $table->dateTime('created_at')->nullable();

            $table->index(['user_id', 'created_at'], 'idx_billing_user_created');
            $table->index('session_id', 'idx_billing_session_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::getConnection()->statement('ALTER TABLE `billing_records` ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci');
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_records');
    }
}
