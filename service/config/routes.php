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
    // Session 登录
    Router::post('/v1/session/login', 'app\http\admin\controller\v1\SessionController@login');
    Router::get('/v1/session/logout', 'app\http\admin\controller\v1\SessionController@logout');
    Router::get('/v1/session/profile', 'app\http\admin\controller\v1\SessionController@profile');
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
});

Router::get('/favicon.ico', function () {
    return '';
});
