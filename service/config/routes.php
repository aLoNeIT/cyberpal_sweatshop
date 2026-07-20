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
Router::addRoute(['GET', 'HEAD'], '/', 'App\Controller\ChatController@index');

// SSE 聊天端点
Router::addRoute(['GET', 'POST'], '/chat', 'App\Controller\ChatController@chat');

// Auth API
Router::addGroup('/api/auth', function () {
    Router::post('/register', 'App\Controller\AuthController@register');
    Router::post('/login', 'App\Controller\AuthController@login');
    Router::post('/logout', 'App\Controller\AuthController@logout');
    Router::get('/me', 'App\Controller\AuthController@me');
});

// Agent CRUD
Router::addGroup('/api/agents', function () {
    Router::get('', 'App\Controller\AgentController@index');
    Router::post('', 'App\Controller\AgentController@store');
    Router::get('/{id}', 'App\Controller\AgentController@show');
    Router::put('/{id}', 'App\Controller\AgentController@update');
    Router::delete('/{id}', 'App\Controller\AgentController@destroy');
    Router::get('/{id}/skills', 'App\Controller\AgentController@listSkills');
    Router::post('/{id}/skills', 'App\Controller\AgentController@mountSkills');
    Router::get('/{id}/mcp', 'App\Controller\McpController@index');
    Router::post('/{id}/mcp', 'App\Controller\McpController@store');
    Router::put('/{id}/mcp/{mid}', 'App\Controller\McpController@update');
    Router::delete('/{id}/mcp/{mid}', 'App\Controller\McpController@destroy');
});

// Skill 库浏览
Router::addGroup('/api/skills', function () {
    Router::get('', 'App\Controller\SkillLibraryController@index');
    Router::get('/{id}', 'App\Controller\SkillLibraryController@show');
});

// SSE 聊天端点（正式版）
Router::addRoute(['GET'], '/api/chat/stream', 'App\Controller\ChatController@stream');

// Session 管理
Router::addGroup('/api/sessions', function () {
    Router::get('', 'App\Controller\SessionController@index');
    Router::post('', 'App\Controller\SessionController@store');
    Router::get('/history', 'App\Controller\SessionController@history');
    Router::get('/{id}', 'App\Controller\SessionController@show');
    Router::get('/{id}/detail', 'App\Controller\SessionController@detail');
    Router::post('/{id}/resume', 'App\Controller\SessionController@resume');
    Router::post('/{id}/fork', 'App\Controller\SessionController@fork');
    Router::post('/{id}/archive', 'App\Controller\SessionController@archive');
    Router::delete('/{id}', 'App\Controller\SessionController@destroy');
});

// Billing
Router::addGroup('/api/billing', function () {
    Router::get('/summary', 'App\Controller\BillingController@summary');
    Router::get('/records', 'App\Controller\BillingController@records');
});

// Profile
Router::addGroup('/api/profile', function () {
    Router::get('', 'App\Controller\ProfileController@show');
    Router::put('', 'App\Controller\ProfileController@update');
});

// ===================================================================
// 新框架路由（应用端分组，占位，后续逐步迁移）
// ===================================================================

// 管理后台路由
Router::addGroup('/admin', function () {
    // Session 登录
    Router::post('/v1/session/login', 'App\http\admin\controller\v1\SessionController@login');
    Router::get('/v1/session/logout', 'App\http\admin\controller\v1\SessionController@logout');
    Router::get('/v1/session/profile', 'App\http\admin\controller\v1\SessionController@profile');
});

// 用户端路由
Router::addGroup('/user', function () {
    // Session 登录
    Router::post('/v1/session/login', 'App\http\user\controller\v1\SessionController@login');
    Router::get('/v1/session/logout', 'App\http\user\controller\v1\SessionController@logout');
});

// 公共路由
Router::addGroup('/home', function () {
    Router::get('/v1/index', 'App\http\home\controller\v1\IndexController@index');
});

Router::get('/favicon.ico', function () {
    return '';
});
