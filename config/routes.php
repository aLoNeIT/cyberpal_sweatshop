<?php

declare(strict_types=1);
/**
 * This file is part of Hyperf.
 *
 * @link     https://www.hyperf.io
 * @document https://hyperf.wiki
 * @contact  group@hyperf.io
 * @license  https://github.com/hyperf/hyperf/blob/master/LICENSE
 */
use Hyperf\HttpServer\Router\Router;

// 聊天页面
Router::addRoute(['GET', 'HEAD'], '/', 'App\Controller\ChatController@index');

// SSE 聊天端点
Router::addRoute(['GET', 'POST'], '/chat', 'App\Controller\ChatController@chat');

// ── Auth API routes ──
Router::addGroup('/api/auth', function () {
    Router::post('/register', 'App\Controller\AuthController@register');
    Router::post('/login', 'App\Controller\AuthController@login');
    Router::post('/logout', 'App\Controller\AuthController@logout');
    Router::get('/me', 'App\Controller\AuthController@me');
});

// ── Agent CRUD ──
Router::addGroup('/api/agents', function () {
    Router::get('', 'App\Controller\AgentController@index');
    Router::post('', 'App\Controller\AgentController@store');
    Router::get('/{id}', 'App\Controller\AgentController@show');
    Router::put('/{id}', 'App\Controller\AgentController@update');
    Router::delete('/{id}', 'App\Controller\AgentController@destroy');
    // Skill 挂载
    Router::get('/{id}/skills', 'App\Controller\AgentController@listSkills');
    Router::post('/{id}/skills', 'App\Controller\AgentController@mountSkills');
    // MCP 配置（嵌套在 agents 下）
    Router::get('/{id}/mcp', 'App\Controller\McpController@index');
    Router::post('/{id}/mcp', 'App\Controller\McpController@store');
    Router::put('/{id}/mcp/{mid}', 'App\Controller\McpController@update');
    Router::delete('/{id}/mcp/{mid}', 'App\Controller\McpController@destroy');
});

// ── Skill 库浏览 ──
Router::addGroup('/api/skills', function () {
    Router::get('', 'App\Controller\SkillLibraryController@index');
    Router::get('/{id}', 'App\Controller\SkillLibraryController@show');
});

// ── SSE 聊天端点（正式版，需鉴权） ──
Router::addRoute(['GET'], '/api/chat/stream', 'App\Controller\ChatController@stream');

// ── Session 管理 ──
Router::addGroup('/api/sessions', function () {
    Router::get('', 'App\Controller\SessionController@index');
    Router::post('', 'App\Controller\SessionController@store');
    // 具名路由必须在 {id} 之前
    Router::get('/history', 'App\Controller\SessionController@history');
    Router::get('/{id}', 'App\Controller\SessionController@show');
    Router::get('/{id}/detail', 'App\Controller\SessionController@detail');
    Router::post('/{id}/resume', 'App\Controller\SessionController@resume');
    Router::post('/{id}/fork', 'App\Controller\SessionController@fork');
    Router::post('/{id}/archive', 'App\Controller\SessionController@archive');
    Router::delete('/{id}', 'App\Controller\SessionController@destroy');
});

// ── Billing ──
Router::addGroup('/api/billing', function () {
    Router::get('/summary', 'App\Controller\BillingController@summary');
    Router::get('/records', 'App\Controller\BillingController@records');
});

// ── Profile ──
Router::addGroup('/api/profile', function () {
    Router::get('', 'App\Controller\ProfileController@show');
    Router::put('', 'App\Controller\ProfileController@update');
});

Router::get('/favicon.ico', function () {
    return '';
});
