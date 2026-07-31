<?php

declare(strict_types=1);

namespace app\http\admin\controller\v1;

use app\http\admin\controller\BaseController;

/**
 * Skill 库管理 (MN0401) — 对应 dict_id=503
 *
 * 依据 09-admin-ops-modules PRD §FR-1：
 *   - 超管可 CRUD + 启用/禁用
 *   - 运营/客服仅查看（前端隐藏 + 后端 403）
 *
 * 继承 DictCrudController 标准模式，无需额外钩子。
 */
class SkillController extends BaseController
{
    protected int $dictId = 532;

    protected int $transaction = 22;
}
