<?php

declare(strict_types=1);

namespace App\Command;

use App\Model\Session;
use Hyperf\Command\Command as HyperfCommand;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Input\InputOption;

/**
 * 自动归档过期会话
 *
 * 查询 cs_user.auto_archive_enabled=1 且 sessions.update_time 超过 cs_user.auto_archive_days 天的活跃会话，
 * 批量改为 archived 状态。
 *
 * 对应 PRD R-017（P2）：会话结束 N 天后自动归档，默认开启 30 天。
 * 用户统一存于 cs_user（usr_app_type=4），无独立 users 表。
 *
 * 时间戳说明：update_time / archived_time 均为 BIGINT 秒级时间戳（见 BaseModel.$dateFormat='U'），
 * 故归档判定用 UNIX_TIMESTAMP() - days*86400，归档时间用 time()。
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
        // JOIN cs_user ON sessions.user_id = cs_user.usr_id
        // WHERE sessions.status = 'active'
        //   AND cs_user.auto_archive_enabled = 1
        //   AND sessions.update_time < UNIX_TIMESTAMP() - cs_user.auto_archive_days * 86400
        $expiredSessions = Session::query()
            ->select('sessions.*')
            ->join('cs_user', 'sessions.user_id', '=', 'cs_user.usr_id')
            ->where('sessions.status', 'active')
            ->where('cs_user.auto_archive_enabled', 1)
            ->whereRaw('sessions.update_time < UNIX_TIMESTAMP() - cs_user.auto_archive_days * 86400')
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
                'update_time' => $session->update_time,
            ]);

            if (!$dryRun) {
                $session->status = 'archived';
                $session->archived_time = time();
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
