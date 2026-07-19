<?php

declare(strict_types=1);

namespace App\Command;

use App\Model\Session;
use App\Model\User;
use Hyperf\Command\Command as HyperfCommand;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Input\InputOption;

/**
 * 自动归档过期会话
 *
 * 查询 users.auto_archive_enabled=1 且 sessions.updated_at 超过 users.auto_archive_days 天的活跃会话，
 * 批量改为 archived 状态。
 *
 * 对应 PRD R-017（P2）：会话结束 N 天后自动归档，默认开启 30 天。
 *
 * 用法：php bin/hyperf.php archive:expired [--dry-run]
 */
class ArchiveExpiredSessionsCommand extends HyperfCommand
{
    protected ?string $name = 'archive:expired';
    protected string $description = '自动归档超过 auto_archive_days 天未更新的活跃会话';

    public function __construct(
        private LoggerInterface $logger,
    ) {
        parent::__construct();
    }

    public function configure(): void
    {
        parent::configure();
        $this->addOption('dry-run', 'd', InputOption::VALUE_NONE, '仅预览，不实际归档');
    }

    public function handle(): void
    {
        $dryRun = (bool) $this->input->getOption('dry-run');
        $mode   = $dryRun ? 'DRY-RUN' : 'LIVE';

        $this->logger->info("[Archive:Expired] Starting ({$mode})");

        // 查询符合条件的会话
        // JOIN users ON sessions.user_id = users.id
        // WHERE sessions.status = 'active'
        //   AND users.auto_archive_enabled = 1
        //   AND sessions.updated_at < DATE_SUB(NOW(), INTERVAL users.auto_archive_days DAY)
        $expiredSessions = Session::query()
            ->select('sessions.*')
            ->join('users', 'sessions.user_id', '=', 'users.id')
            ->where('sessions.status', 'active')
            ->where('users.auto_archive_enabled', 1)
            ->whereRaw('sessions.updated_at < DATE_SUB(NOW(), INTERVAL users.auto_archive_days DAY)')
            ->get();

        $count = $expiredSessions->count();

        $this->line("Found {$count} expired session(s) to archive.");

        if ($count === 0) {
            $this->logger->info('[Archive:Expired] No expired sessions found');
            return;
        }

        $archivedCount = 0;

        /** @var Session $session */
        foreach ($expiredSessions as $session) {
            $this->logger->info('[Archive:Expired] Archiving session', [
                'session_id' => $session->id,
                'user_id'    => $session->user_id,
                'updated_at' => $session->updated_at,
            ]);

            if (!$dryRun) {
                $session->status = 'archived';
                $session->archived_at = date('Y-m-d H:i:s');
                $session->save();
            }

            $archivedCount++;
        }

        $this->line("[{$mode}] Archived {$archivedCount} session(s).");
        $this->logger->info("[Archive:Expired] Done ({$mode})", [
            'total'   => $count,
            'archived'=> $archivedCount,
        ]);
    }
}
