<?php

declare(strict_types=1);

namespace app\http\admin\controller\v1;

use app\http\admin\controller\BaseController;

/**
 * MCP 模板管理 (MN0402) — 对应 dict_id=504
 *
 * 依据 09-admin-ops-modules PRD §FR-2：
 *   - 超管可 CRUD + 启用/禁用
 *   - 运营/客服仅查看
 *
 * 继承 DictCrudController 标准模式。
 */
class McpTemplateController extends BaseController
{
    protected int $dictId = 504;

    protected int $transaction = 22;
}
