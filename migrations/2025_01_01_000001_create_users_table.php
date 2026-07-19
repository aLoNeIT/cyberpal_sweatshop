<?php

declare(strict_types=1);

use Hyperf\Database\Schema\Schema;
use Hyperf\Database\Schema\Blueprint;
use Hyperf\Database\Migrations\Migration;

/**
 * 创建 users 表
 *
 * 对应架构文档 §3.1
 */
class CreateUsersTable extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('email', 191)->nullable(false)->comment('登录邮箱');
            $table->string('password_hash', 255)->nullable(false)->comment('bcrypt 哈希');
            $table->string('display_name', 64)->nullable()->default('')->comment('显示名称');
            $table->enum('theme_pref', ['light', 'dark', 'system'])->default('system')->comment('主题偏好');
            $table->tinyInteger('auto_archive_enabled')->default(1)->comment('自动归档开关 0/1');
            $table->integer('auto_archive_days')->default(30)->comment('归档天数阈值');
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();

            $table->unique('email', 'uk_users_email');
        });

        Schema::getConnection()->statement('ALTER TABLE `users` ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci');
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
}
