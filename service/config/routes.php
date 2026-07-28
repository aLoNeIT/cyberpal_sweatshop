<?php

declare(strict_types=1);

use Hyperf\HttpServer\Router\Router;

/*
|--------------------------------------------------------------------------
| 路由说明
|--------------------------------------------------------------------------
|
| 路由按应用端（app_type）分组，URL 首段决定应用类型：
|   /admin/*       -> 管理后台 (app_type=1)
|   /user/*        -> 用户端 (app_type=4)
|   /home/*        -> 公共首页 (app_type=0)
|   /open_platform/* -> 开放平台 (app_type=7)
|
| 兼容旧路由：/api/* 和 /chat 等直接路径保持原有行为。
| 新业务接口请优先使用应用端分组路由。
*/

// ===================================================================
// 兼容旧路由（Pi-Agent API，保留向后兼容）
// ===================================================================

// 聊天页面
Router::addRoute(['GET', 'HEAD'], '/', 'app\http\user\controller\v1\ChatController@index');

// SSE 聊天端点
Router::addRoute(['GET', 'POST'], '/chat', 'app\http\user\controller\v1\ChatController@chat');

// Auth API
Router::addGroup('/api/auth', function () {
    Router::post('/register', 'app\http\user\controller\v1\AuthController@register');
    Router::post('/login', 'app\http\user\controller\v1\AuthController@login');
    Router::post('/logout', 'app\http\user\controller\v1\AuthController@logout');
    Router::get('/me', 'app\http\user\controller\v1\AuthController@me');
});

// Agent CRUD
Router::addGroup('/api/agents', function () {
    Router::get('', 'app\http\user\controller\v1\AgentController@index');
    Router::post('', 'app\http\user\controller\v1\AgentController@store');
    Router::get('/{id}', 'app\http\user\controller\v1\AgentController@show');
    Router::put('/{id}', 'app\http\user\controller\v1\AgentController@update');
    Router::delete('/{id}', 'app\http\user\controller\v1\AgentController@destroy');
    Router::get('/{id}/skills', 'app\http\user\controller\v1\AgentController@listSkills');
    Router::post('/{id}/skills', 'app\http\user\controller\v1\AgentController@mountSkills');
    Router::get('/{id}/mcp', 'app\http\user\controller\v1\McpController@index');
    Router::post('/{id}/mcp', 'app\http\user\controller\v1\McpController@store');
    Router::put('/{id}/mcp/{mid}', 'app\http\user\controller\v1\McpController@update');
    Router::delete('/{id}/mcp/{mid}', 'app\http\user\controller\v1\McpController@destroy');
});

// Skill 库浏览
Router::addGroup('/api/skills', function () {
    Router::get('', 'app\http\user\controller\v1\SkillLibraryController@index');
    Router::get('/{id}', 'app\http\user\controller\v1\SkillLibraryController@show');
});

// SSE 聊天端点（正式版）
Router::addRoute(['GET'], '/api/chat/stream', 'app\http\user\controller\v1\ChatController@stream');

// Session 管理
Router::addGroup('/api/sessions', function () {
    Router::get('', 'app\http\user\controller\v1\SessionController@index');
    Router::post('', 'app\http\user\controller\v1\SessionController@store');
    Router::get('/history', 'app\http\user\controller\v1\SessionController@history');
    Router::get('/{id}', 'app\http\user\controller\v1\SessionController@show');
    Router::get('/{id}/detail', 'app\http\user\controller\v1\SessionController@detail');
    Router::post('/{id}/resume', 'app\http\user\controller\v1\SessionController@resume');
    Router::post('/{id}/fork', 'app\http\user\controller\v1\SessionController@fork');
    Router::post('/{id}/archive', 'app\http\user\controller\v1\SessionController@archive');
    Router::delete('/{id}', 'app\http\user\controller\v1\SessionController@destroy');
});

// Billing
Router::addGroup('/api/billing', function () {
    Router::get('/summary', 'app\http\user\controller\v1\BillingController@summary');
    Router::get('/records', 'app\http\user\controller\v1\BillingController@records');
});

// Profile
Router::addGroup('/api/profile', function () {
    Router::get('', 'app\http\user\controller\v1\ProfileController@show');
    Router::put('', 'app\http\user\controller\v1\ProfileController@update');
});

// ===================================================================
// 新框架路由（应用端分组，占位，后续逐步迁移）
// ===================================================================

// 管理后台路由
Router::addGroup('/admin', function () {
    // Session（对齐 hongshan_cloudscript 框架模式）
    Router::post('/v1/session', 'app\http\admin\controller\v1\SessionController@save');
    Router::put('/v1/session/{id:[A-Za-z0-9]{40}}', 'app\http\admin\controller\v1\SessionController@update');
    Router::delete('/v1/session/{id:[A-Za-z0-9]{40}}', 'app\http\admin\controller\v1\SessionController@delete');
    Router::get('/v1/session/profile', 'app\http\admin\controller\v1\SessionController@profile');

    // ============================================================
    // Dashboard 仪表盘 — MN00
    // ============================================================
    Router::get('/v1/dashboard/index', 'app\http\admin\controller\v1\DashboardController@index');

    // ============================================================
    // 用户管理 — MN0101（DictCrudController 标准 + 自定义）
    // ============================================================
    Router::get('/v1/user/index', 'app\http\admin\controller\v1\UserController@index');
    Router::post('/v1/user/save', 'app\http\admin\controller\v1\UserController@save');
    Router::get('/v1/user/read/{id}', 'app\http\admin\controller\v1\UserController@read');
    Router::post('/v1/user/update/{id}', 'app\http\admin\controller\v1\UserController@update');
    Router::post('/v1/user/delete/{id}', 'app\http\admin\controller\v1\UserController@delete');
    Router::post('/v1/user/toggleStatus/{id}', 'app\http\admin\controller\v1\UserController@toggleStatus');
    Router::post('/v1/user/resetPassword/{id}', 'app\http\admin\controller\v1\UserController@resetPassword');

    // ============================================================
    // Agent 管理 — MN0201
    // ============================================================
    Router::get('/v1/agent/index', 'app\http\admin\controller\v1\AgentManagementController@index');
    Router::post('/v1/agent/stop/{id}', 'app\http\admin\controller\v1\AgentManagementController@stop');

    // ============================================================
    // 会话管理 — MN0301
    // ============================================================
    Router::get('/v1/session-mgmt/index', 'app\http\admin\controller\v1\SessionManagementController@index');
    Router::post('/v1/session-mgmt/terminate/{id}', 'app\http\admin\controller\v1\SessionManagementController@terminate');
    Router::get('/v1/session-mgmt/viewContent/{id}', 'app\http\admin\controller\v1\SessionManagementController@viewContent');

    // ============================================================
    // Skill 库 — MN0401（DictCrudController 标准）
    // ============================================================
    Router::get('/v1/skill/index', 'app\http\admin\controller\v1\SkillController@index');
    Router::post('/v1/skill/save', 'app\http\admin\controller\v1\SkillController@save');
    Router::get('/v1/skill/read/{id}', 'app\http\admin\controller\v1\SkillController@read');
    Router::post('/v1/skill/update/{id}', 'app\http\admin\controller\v1\SkillController@update');
    Router::post('/v1/skill/delete/{id}', 'app\http\admin\controller\v1\SkillController@delete');

    // ============================================================
    // MCP 模板 — MN0402（DictCrudController 标准）
    // ============================================================
    Router::get('/v1/mcp-template/index', 'app\http\admin\controller\v1\McpTemplateController@index');
    Router::post('/v1/mcp-template/save', 'app\http\admin\controller\v1\McpTemplateController@save');
    Router::get('/v1/mcp-template/read/{id}', 'app\http\admin\controller\v1\McpTemplateController@read');
    Router::post('/v1/mcp-template/update/{id}', 'app\http\admin\controller\v1\McpTemplateController@update');
    Router::post('/v1/mcp-template/delete/{id}', 'app\http\admin\controller\v1\McpTemplateController@delete');

    // ============================================================
    // 计费大盘 — MN0403
    // ============================================================
    Router::get('/v1/billing/index', 'app\http\admin\controller\v1\BillingController@index');

    // ============================================================
    // 管理员管理 — MN0501（DictCrudController + 自定义）
    // ============================================================
    Router::get('/v1/admin-account/index', 'app\http\admin\controller\v1\AdminAccountController@index');
    Router::post('/v1/admin-account/save', 'app\http\admin\controller\v1\AdminAccountController@save');
    Router::get('/v1/admin-account/read/{id}', 'app\http\admin\controller\v1\AdminAccountController@read');
    Router::post('/v1/admin-account/update/{id}', 'app\http\admin\controller\v1\AdminAccountController@update');
    Router::post('/v1/admin-account/delete/{id}', 'app\http\admin\controller\v1\AdminAccountController@delete');
    Router::post('/v1/admin-account/toggleStatus/{id}', 'app\http\admin\controller\v1\AdminAccountController@toggleStatus');
    Router::post('/v1/admin-account/resetPassword/{id}', 'app\http\admin\controller\v1\AdminAccountController@resetPassword');

    // ============================================================
    // 角色管理 — MN0502（DictCrudController + 权限配置）
    // ============================================================
    Router::get('/v1/role/index', 'app\http\admin\controller\v1\RoleController@index');
    Router::post('/v1/role/save', 'app\http\admin\controller\v1\RoleController@save');
    Router::get('/v1/role/read/{id}', 'app\http\admin\controller\v1\RoleController@read');
    Router::post('/v1/role/update/{id}', 'app\http\admin\controller\v1\RoleController@update');
    Router::post('/v1/role/delete/{id}', 'app\http\admin\controller\v1\RoleController@delete');
    Router::get('/v1/role/getPermission/{id}', 'app\http\admin\controller\v1\RoleController@getPermission');
    Router::post('/v1/role/savePermission/{id}', 'app\http\admin\controller\v1\RoleController@savePermission');

    // ============================================================
    // 全局配置 — MN0503
    // ============================================================
    Router::get('/v1/config/index', 'app\http\admin\controller\v1\ConfigController@index');
    Router::post('/v1/config/save', 'app\http\admin\controller\v1\ConfigController@save');

    // ============================================================
    // 审计日志 — MN0504
    // ============================================================
    Router::get('/v1/audit-log/index', 'app\http\admin\controller\v1\AuditLogController@index');
});

// 用户端路由
Router::addGroup('/user', function () {
    // Session 登录
    Router::post('/v1/session/login', 'app\http\user\controller\v1\SessionController@login');
    Router::get('/v1/session/logout', 'app\http\user\controller\v1\SessionController@logout');
});

// 公共路由
Router::addGroup('/home', function () {
    Router::get('/v1/index', 'app\http\home\controller\v1\IndexController@index');
    Router::get('/v1/captcha', 'app\http\home\controller\v1\CaptchaController@index');
});

Router::get('/favicon.ico', function () {
    return '';
});
