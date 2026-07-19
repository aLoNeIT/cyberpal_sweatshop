<?php

declare(strict_types=1);

namespace App\Controller;

use App\Model\SkillLibrary;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;

/**
 * Skill 库控制器
 *
 * 对应架构文档 §4.1 的 GET /api/skills。
 * 平台托管 skill 库浏览（只读），用户不可上传。
 */
class SkillLibraryController extends AbstractController
{
    /**
     * 浏览平台 skill 库
     *
     * GET /api/skills?page=1&per_page=20
     */
    public function index(RequestInterface $request, ResponseInterface $response)
    {
        $page    = max(1, (int) $request->input('page', 1));
        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));

        $query = SkillLibrary::query()->where('enabled', 1)->orderBy('name', 'asc');

        $total  = $query->count();
        $skills = $query->forPage($page, $perPage)->get();

        return $this->success($response, [
            'items'    => $skills->toArray(),
            'total'    => $total,
            'page'     => $page,
            'per_page' => $perPage,
        ]);
    }

    /**
     * Skill 详情
     *
     * GET /api/skills/{id}
     */
    public function show(RequestInterface $request, ResponseInterface $response, string $id)
    {
        $skill = SkillLibrary::query()->where('id', $id)->where('enabled', 1)->first();
        if ($skill === null) {
            return $this->error($response, 'Skill 不存在', 404);
        }

        return $this->success($response, [
            'skill' => $skill->toArray(),
        ]);
    }

    // ──────────────────────────────────────────────
    //  统一响应
    // ──────────────────────────────────────────────

    private function success(ResponseInterface $response, mixed $data, string $message = 'ok')
    {
        return $response->json([
            'code'    => 0,
            'data'    => $data,
            'message' => $message,
        ]);
    }

    private function error(ResponseInterface $response, string $message, int $code = 400)
    {
        return $response->json([
            'code'    => $code,
            'data'    => null,
            'message' => $message,
        ])->withStatus($code >= 100 && $code < 600 ? $code : 400);
    }
}
