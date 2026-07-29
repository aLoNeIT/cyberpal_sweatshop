import { Component, OnInit } from '@angular/core';
import { UserApiService } from '../../services/user-api.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-user-sessions',
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1>会话历史</h1>
        <p>查看和管理所有历史会话记录</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-primary" routerLink="/user/chat">
          <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> 新建会话
        </button>
      </div>
    </div>

    <!-- Storage Bar -->
    <div class="storage-bar">
      <div class="storage-bar-row">
        <div class="storage-bar-item">
          <div class="storage-bar-label">
            <span>活跃会话</span>
            <span class="count">{{ activeCount }}</span><span style="font-size:12px;color:var(--cp-text-tertiary)">/ 100</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill primary" [style.width]="activePercent + '%'"></div>
          </div>
          <div style="font-size:12px;color:var(--cp-text-tertiary);margin-top:4px">{{ activePercent }}%</div>
        </div>
        <div class="storage-bar-item">
          <div class="storage-bar-label">
            <span>已归档</span>
            <span class="count">{{ archiveCount }}</span><span style="font-size:12px;color:var(--cp-text-tertiary)">/ 50</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill warning" [style.width]="archivePercent + '%'"></div>
          </div>
          <div style="font-size:12px;color:var(--cp-text-tertiary);margin-top:4px">{{ archivePercent }}%</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-body" style="padding:16px 24px">
        <div class="filter-bar">
          <div class="filter-bar-left">
            <div class="search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" class="search-input" placeholder="搜索会话标题或内容..." [(ngModel)]="searchText" (input)="renderTable()">
            </div>
            <div class="filter-chips">
              <span class="filter-chip" [class.active]="statusFilter==='all'" (click)="statusFilter='all';renderTable()">全部</span>
              <span class="filter-chip" [class.active]="statusFilter==='active'" (click)="statusFilter='active';renderTable()">活跃</span>
              <span class="filter-chip" [class.active]="statusFilter==='archived'" (click)="statusFilter='archived';renderTable()">已归档</span>
            </div>
          </div>
          <div class="date-range">
            <input type="date" [(ngModel)]="dateFrom" (change)="renderTable()">
            <span>—</span>
            <input type="date" [(ngModel)]="dateTo" (change)="renderTable()">
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>会话标题</th>
              <th>Agent</th>
              <th>消息数</th>
              <th>Token 用量</th>
              <th>状态</th>
              <th>模式</th>
              <th>最后活跃</th>
              <th style="text-align:right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of filteredData">
              <td style="font-weight:500">{{ row.title }}</td>
              <td>{{ row.agent }}</td>
              <td class="text-mono">{{ row.msgs }}</td>
              <td class="text-mono">{{ row.tokens }}</td>
              <td><span class="badge" [class.badge-success]="row.status==='active'" [class.badge-default]="row.status==='archived'">{{ row.status === 'active' ? '活跃' : '已归档' }}</span></td>
              <td>
                <span class="badge-mode" [class.normal]="row.mode==='normal'" [class.continue]="row.mode==='continue'" [class.fork]="row.mode==='fork'">
                  {{ row.mode === 'normal' ? '普通' : row.mode === 'continue' ? '续聊' : '分叉' }}
                </span>
              </td>
              <td class="col-time">{{ row.time }}</td>
              <td class="col-actions">
                <button class="action-btn" (click)="viewSession(row)" title="查看">
                  <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.6"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="action-btn" *ngIf="row.status==='active'" (click)="continueChat(row)" title="续聊">续聊</button>
                <button class="action-btn" *ngIf="row.status==='active'" (click)="forkSession(row)" title="分叉">分叉</button>
                <button class="action-btn" *ngIf="row.status==='active'" (click)="archiveSession(row)" title="归档">
                  <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.6"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                </button>
                <button class="action-btn danger" (click)="deleteSession(row)" title="删除">
                  <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.6"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" style="padding:16px 24px">
        <div class="pagination-info">共 <strong>{{ filteredData.length }}</strong> 条记录</div>
        <div class="pagination-btns">
          <button class="pagination-btn" disabled>‹</button>
          <button class="pagination-btn active">1</button>
          <button class="pagination-btn" disabled>›</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --cp-primary: #1677ff; --cp-primary-subtle: #e6f4ff;
      --cp-success: #16A34A; --cp-success-bg: rgba(22,163,74,.12);
      --cp-warning: #D97706; --cp-warning-bg: rgba(217,119,6,.12);
      --cp-danger: #DC2626; --cp-danger-bg: rgba(220,38,38,.12);
      --cp-secondary: #8B5CF6;
      --cp-info: #1677ff; --cp-info-bg: rgba(22,119,255,.12);
      --cp-surface: #FFFFFF; --cp-surface-2: #fafafa; --cp-border: #f0f0f0;
      --cp-text: #111827; --cp-text-secondary: #6b7280; --cp-text-tertiary: #9ca3af;
      --cp-radius-md: 8px; --cp-radius-lg: 12px; --cp-radius-pill: 999px;
      --cp-shadow-sm: 0 1px 2px rgba(0,0,0,.06);
      --cp-font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      --cp-transition-fast: 150ms ease;
    }
    .page-header { margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
    .page-header-left h1 { font-size:20px; font-weight:600; color:var(--cp-text); margin-bottom:4px; }
    .page-header-left p { font-size:14px; color:var(--cp-text-secondary); }
    .page-header-right { display:flex; gap:8px; }

    /* Storage Bar */
    .storage-bar { background:var(--cp-surface); border:1px solid var(--cp-border); border-radius:var(--cp-radius-lg); padding:20px 24px; margin-bottom:24px; box-shadow:var(--cp-shadow-sm); }
    .storage-bar-row { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
    .storage-bar-item { flex:1; min-width:200px; }
    .storage-bar-label { font-size:13px; color:var(--cp-text-secondary); margin-bottom:6px; display:flex; align-items:center; justify-content:space-between; }
    .storage-bar-label .count { font-family:var(--cp-font-mono); font-weight:600; color:var(--cp-text); }
    .progress-bar { height:8px; background:var(--cp-border); border-radius:4px; overflow:hidden; }
    .progress-bar-fill { height:100%; border-radius:4px; transition:width 300ms ease; }
    .progress-bar-fill.primary { background:var(--cp-primary); }
    .progress-bar-fill.warning { background:var(--cp-warning); }

    /* Buttons */
    .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; height:36px; padding:0 16px; font-size:14px; font-weight:500; border-radius:var(--cp-radius-md); border:1px solid transparent; cursor:pointer; transition:all var(--cp-transition-fast); user-select:none; white-space:nowrap; text-decoration:none; font-family:inherit; }
    .btn-primary { background:var(--cp-primary); color:#fff; border-color:var(--cp-primary); }
    .btn-primary:hover { background:#4096ff; }

    /* Card */
    .card { background:var(--cp-surface); border-radius:var(--cp-radius-lg); border:1px solid var(--cp-border); box-shadow:var(--cp-shadow-sm); overflow:hidden; }
    .card-body { padding:24px; }

    /* Filter */
    .filter-bar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
    .filter-bar-left { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .search-wrap { display:flex; align-items:center; gap:8px; padding:0 12px; height:36px; border:1px solid var(--cp-border); border-radius:var(--cp-radius-md); background:var(--cp-surface); }
    .search-wrap:focus-within { border-color:var(--cp-primary); }
    .search-input { border:none; outline:none; background:transparent; font-size:14px; color:var(--cp-text); width:200px; font-family:inherit; }
    .search-input::placeholder { color:var(--cp-text-tertiary); }
    .filter-chips { display:flex; gap:8px; }
    .filter-chip { padding:4px 12px; font-size:13px; color:var(--cp-text-secondary); border:1px solid var(--cp-border); border-radius:var(--cp-radius-pill); cursor:pointer; transition:all var(--cp-transition-fast); }
    .filter-chip:hover { border-color:var(--cp-primary); color:var(--cp-primary); }
    .filter-chip.active { background:var(--cp-primary-subtle); border-color:var(--cp-primary); color:var(--cp-primary); }
    .date-range { display:flex; align-items:center; gap:6px; }
    .date-range input[type="date"] { height:32px; padding:0 8px; font-size:13px; border:1px solid var(--cp-border); border-radius:var(--cp-radius-md); background:var(--cp-surface); color:var(--cp-text); outline:none; font-family:inherit; }
    .date-range input[type="date"]:focus { border-color:var(--cp-primary); }
    .date-range span { color:var(--cp-text-tertiary); font-size:13px; }

    /* Table */
    .data-table { width:100%; border-collapse:collapse; }
    .data-table th { padding:12px 16px; font-size:13px; font-weight:500; color:var(--cp-text-secondary); text-align:left; border-bottom:1px solid var(--cp-border); background:var(--cp-surface-2); white-space:nowrap; }
    .data-table td { padding:12px 16px; font-size:14px; color:var(--cp-text); border-bottom:1px solid var(--cp-border); }
    .data-table tr:hover td { background:var(--cp-surface-2); }
    .col-actions { text-align:right; white-space:nowrap; }
    .col-time { font-family:var(--cp-font-mono); font-size:13px; white-space:nowrap; color:var(--cp-text-secondary); }
    .text-mono { font-family:var(--cp-font-mono); font-size:13px; }

    /* Badges */
    .badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; font-size:12px; font-weight:500; border-radius:var(--cp-radius-pill); white-space:nowrap; }
    .badge-success { background:var(--cp-success-bg); color:var(--cp-success); }
    .badge-default { background:var(--cp-surface-2); color:var(--cp-text-secondary); border:1px solid var(--cp-border); }
    .badge-mode { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; font-size:11px; font-weight:500; border-radius:var(--cp-radius-pill); white-space:nowrap; }
    .badge-mode.normal { background:var(--cp-info-bg); color:var(--cp-info); }
    .badge-mode.continue { background:rgba(139,92,246,.12); color:var(--cp-secondary); }
    .badge-mode.fork { background:var(--cp-warning-bg); color:var(--cp-warning); }

    /* Action buttons */
    .action-btn { display:inline-flex; align-items:center; gap:3px; padding:3px 8px; font-size:12px; border:none; background:transparent; color:var(--cp-text-secondary); cursor:pointer; border-radius:var(--cp-radius-md); transition:all var(--cp-transition-fast); font-family:inherit; }
    .action-btn:hover { color:var(--cp-primary); background:var(--cp-primary-subtle); }
    .action-btn.danger:hover { color:var(--cp-danger); background:var(--cp-danger-bg); }

    /* Pagination */
    .pagination { display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--cp-border); }
    .pagination-info { font-size:13px; color:var(--cp-text-secondary); }
    .pagination-info strong { color:var(--cp-text); font-family:var(--cp-font-mono); }
    .pagination-btns { display:flex; gap:4px; }
    .pagination-btn { width:32px; height:32px; border:1px solid var(--cp-border); border-radius:var(--cp-radius-md); background:var(--cp-surface); cursor:pointer; font-size:14px; color:var(--cp-text-secondary); display:flex; align-items:center; justify-content:center; transition:all var(--cp-transition-fast); }
    .pagination-btn.active { background:var(--cp-primary); color:#fff; border-color:var(--cp-primary); }
    .pagination-btn:disabled { opacity:0.4; cursor:not-allowed; }
  `]
})
export class UserSessionsComponent implements OnInit {
  searchText = '';
  statusFilter = 'all';
  dateFrom = '2026-06-22';
  dateTo = '2026-07-22';

  activeCount = 35;
  archiveCount = 18;
  get activePercent(): number { return this.activeCount; }
  get archivePercent(): number { return Math.round(this.archiveCount / 50 * 100); }

  sessionData = [
    { title: 'CSV 批量处理脚本开发', agent: '默认助手', msgs: 24, tokens: '12.4K', status: 'active', mode: 'normal', time: '2026-07-22 14:30' },
    { title: 'React 性能优化方案', agent: '代码审查专家', msgs: 41, tokens: '28.1K', status: 'active', mode: 'continue', time: '2026-07-22 11:15' },
    { title: 'API 接口设计讨论', agent: '默认助手', msgs: 18, tokens: '9.2K', status: 'archived', mode: 'normal', time: '2026-07-21 16:45' },
    { title: '数据库索引优化', agent: '数据分析师', msgs: 32, tokens: '18.7K', status: 'active', mode: 'fork', time: '2026-07-21 09:20' },
    { title: 'K8s 集群部署排查', agent: '默认助手', msgs: 56, tokens: '35.6K', status: 'archived', mode: 'continue', time: '2026-07-20 17:30' },
    { title: '日志系统架构设计', agent: '文档助手', msgs: 15, tokens: '7.8K', status: 'active', mode: 'normal', time: '2026-07-20 10:00' },
    { title: '单元测试覆盖率提升', agent: '代码审查专家', msgs: 29, tokens: '15.3K', status: 'archived', mode: 'normal', time: '2026-07-19 15:22' },
    { title: '前端状态管理调研', agent: '默认助手', msgs: 38, tokens: '22.1K', status: 'active', mode: 'fork', time: '2026-07-19 08:45' }
  ];

  get filteredData(): typeof this.sessionData {
    return this.sessionData.filter(row => {
      if (this.statusFilter === 'active' && row.status !== 'active') return false;
      if (this.statusFilter === 'archived' && row.status !== 'archived') return false;
      if (this.searchText && !row.title.includes(this.searchText) && !row.agent.includes(this.searchText)) return false;
      return true;
    });
  }

  constructor(private api: UserApiService, private msg: NzMessageService) {}

  ngOnInit(): void {}

  renderTable(): void { /* reactive via getter */ }

  viewSession(row: any): void { this.msg.info(`查看会话：「${row.title}」`); }
  continueChat(row: any): void { this.msg.success(`续聊：「${row.title}」`); }
  forkSession(row: any): void { this.msg.success(`分叉：「${row.title}」`); }
  archiveSession(row: any): void {
    this.msg.success(`已归档：「${row.title}」`);
    const found = this.sessionData.find(s => s.title === row.title);
    if (found) found.status = 'archived';
    this.activeCount--;
    this.archiveCount++;
  }
  deleteSession(row: any): void {
    this.msg.success(`已删除：「${row.title}」`);
    const idx = this.sessionData.findIndex(s => s.title === row.title);
    if (idx !== -1) this.sessionData.splice(idx, 1);
  }
}
