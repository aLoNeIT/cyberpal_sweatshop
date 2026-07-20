<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\BillingService;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;

/**
 * 计费控制器
 *
 * 对应架构文档 §4.1 的 /api/billing/* 端点。
 * 提供用量概览和明细查询。
 */
class BillingController extends AbstractController
{
    #[Inject]
    private BillingService $billingService;

    /**
     * 用量概览（P0）
     *
     * GET /api/billing/summary?period=2025-07
     */
    public function summary(RequestInterface $request, ResponseInterface $response)
    {
        $userId = (int) $request->getAttribute('user_id', 0);
        $period = $request->input('period', 'current_month');

        $data = $this->billingService->getSummary($userId, $period);

        return $this->success($response, $data);
    }

    /**
     * 计费明细（P1）
     *
     * GET /api/billing/records?from=&to=&session_id=&page=1&per_page=20
     */
    public function records(RequestInterface $request, ResponseInterface $response)
    {
        $userId = (int) $request->getAttribute('user_id', 0);

        $filters = [
            'from'       => $request->input('from'),
            'to'         => $request->input('to'),
            'session_id' => $request->input('session_id'),
            'page'       => (int) $request->input('page', 1),
            'per_page'   => (int) $request->input('per_page', 20),
        ];

        $data = $this->billingService->getRecords($userId, $filters);

        return $this->success($response, $data);
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
}
