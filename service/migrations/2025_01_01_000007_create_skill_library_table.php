<?php

declare(strict_types=1);

use Hyperf\Database\Schema\Schema;
use Hyperf\Database\Schema\Blueprint;
use Hyperf\Database\Migrations\Migration;

/**
 * 创建 skill_library 表
 *
 * 对应架构文档 §3.7
 */
class CreateSkillLibraryTable extends Migration
{
    public function up(): void
    {
        Schema::create('skill_library', function (Blueprint $table) {
            $table->string('id', 36)->primary()->comment('UUID');
            $table->string('name', 128)->nullable(false)->comment('Skill 名称');
            $table->string('description', 512)->nullable()->default('')->comment('描述');
            $table->string('path', 512)->nullable(false)->comment('磁盘 skill 目录路径');
            $table->tinyInteger('enabled')->default(1)->comment('是否启用 0/1');
            $table->dateTime('created_at')->nullable();
        });

        Schema::getConnection()->statement('ALTER TABLE `skill_library` ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci');
    }

    public function down(): void
    {
        Schema::dropIfExists('skill_library');
    }
}
