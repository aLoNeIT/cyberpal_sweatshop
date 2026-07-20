<?php

declare(strict_types=1);

use Hyperf\Database\Schema\Schema;
use Hyperf\Database\Schema\Blueprint;
use Hyperf\Database\Migrations\Migration;

/**
 * 创建 agent_skill 多对多关联表
 *
 * 对应架构文档 §3.9
 */
class CreateAgentSkillTable extends Migration
{
    public function up(): void
    {
        Schema::create('agent_skill', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('agent_id', 36)->nullable(false)->comment('Agent ID');
            $table->string('skill_id', 36)->nullable(false)->comment('Skill ID');

            $table->unique(['agent_id', 'skill_id'], 'uk_agent_skill');
            $table->foreign('agent_id')->references('id')->on('agents')->onDelete('cascade');
            $table->foreign('skill_id')->references('id')->on('skill_library')->onDelete('cascade');
        });

        Schema::getConnection()->statement('ALTER TABLE `agent_skill` ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci');
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_skill');
    }
}
