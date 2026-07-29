import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserApiService } from '../../services/user-api.service';
import { Agent } from '../../models/user.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-user-agents',
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1>Agent 管理</h1>
        <p>创建和管理你的 AI Agent，配置模型、工具和技能</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-primary" routerLink="/user/agent-config">
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          创建 Agent
        </button>
      </div>
    </div>

    <!-- Card: Agent Table -->
    <div class="card">
      <div class="card-body">
        <!-- Filter Bar -->
        <div class="filter-bar">
          <div class="table-toolbar-left">
            <div class="search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" class="search-input" placeholder="搜索 Agent 名称..." [(ngModel)]="searchKeyword" (input)="filterAgents()">
            </div>
            <div class="filter-chips">
              <span class="filter-chip" [class.active]="currentFilter === 'all'" (click)="setFilter('all')">全部 <strong>{{ allCount }}</strong></span>
              <span class="filter-chip" [class.active]="currentFilter === 'online'" (click)="setFilter('online')">在线 <strong>{{ onlineCount }}</strong></span>
              <span class="filter-chip" [class.active]="currentFilter === 'offline'" (click)="setFilter('offline')">离线 <strong>{{ offlineCount }}</strong></span>
              <span class="filter-chip" [class.active]="currentFilter === 'error'" (click)="setFilter('error')">错误 <strong>{{ errorCount }}</strong></span>
            </div>
          </div>
          <div class="table-toolbar-right">
            <button class="btn btn-ghost" (click)="placeholder()">
              <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              导入
            </button>
            <button class="btn btn-ghost" (click)="placeholder()">
              <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              导出
            </button>
          </div>
        </div>

        <!-- Table -->
        <div style="overflow-x:auto;">
          <table class="data-table" *ngIf="filteredAgents.length > 0">
            <thead>
              <tr>
                <th>名称</th>
                <th>描述</th>
                <th>模型 Provider</th>
                <th>状态</th>
                <th>Skill 数</th>
                <th>创建时间</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of filteredAgents">
                <td><div class="agent-name">{{ a.name }}</div></td>
                <td><div class="agent-desc" [title]="a.description">{{ a.description || '-' }}</div></td>
                <td>
                  <span class="badge badge-default">{{ a.provider || 'OpenAI' }}</span>
                  <span style="margin-left:6px;font-size:13px;color:var(--cp-text-secondary)">{{ a.model }}</span>
                </td>
                <td>
                  <span class="badge" [class.badge-success]="a.status==='running'" [class.badge-default]="a.status==='stopped'" [class.badge-danger]="a.status==='error'">
                    <span class="badge-dot" [class.online]="a.status==='running'" [class.offline]="a.status==='stopped'" [class.error]="a.status==='error'"></span>
                    {{ statusMap[a.status]?.text || '离线' }}
                  </span>
                </td>
                <td>
                  <span class="skill-count">
                    <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.59V7.41a2 2 0 0 0-1.45-1.9L12 3 5.45 5.51A2 2 0 0 0 4 7.41v9.18a2 2 0 0 0 1.45 1.9L12 21l6.55-2.51A2 2 0 0 0 20 16.59z"/></svg>
                    {{ 0 }}
                  </span>
                </td>
                <td class="col-time">{{ a.created_at || '-' }}</td>
                <td class="col-actions">
                  <button class="btn btn-ghost btn-sm" [routerLink]="['/user/agent-config', a.id]" title="编辑">
                    <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn btn-ghost btn-sm" (click)="placeholder()" title="复制">
                    <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                  <button class="btn btn-ghost btn-sm" (click)="deleteAgent(a)" title="删除">
                    <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="filteredAgents.length === 0">
            <div class="empty-state-icon">
              <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
            </div>
            <h3>暂无 Agent</h3>
            <p>{{ searchKeyword ? '未找到匹配的 Agent' : '还没有创建任何 Agent，点击上方按钮创建第一个' }}</p>
            <button *ngIf="!searchKeyword" class="btn btn-primary" routerLink="/user/agent-config">
              <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              创建 Agent
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="filteredAgents.length > 0">
          <div class="pagination-info">共 <strong>{{ filteredAgents.length }}</strong> 条，第 <strong>1</strong>/1 页</div>
          <div class="pagination-btns">
            <button class="pagination-btn" disabled>&laquo;</button>
            <button class="pagination-btn active">1</button>
            <button class="pagination-btn" disabled>&raquo;</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --cp-primary: #1677ff; --cp-primary-subtle: #e6f4ff;
      --cp-success: #16A34A; --cp-success-bg: rgba(22,163,74,.12);
      --cp-warning: #D97706; --cp-danger: #DC2626; --cp-danger-bg: rgba(220,38,38,.12);
      --cp-surface: #FFFFFF; --cp-surface-2: #fafafa; --cp-border: #f0f0f0;
      --cp-text: #111827; --cp-text-secondary: #6b7280; --cp-text-tertiary: #9ca3af;
      --cp-radius-md: 8px; --cp-radius-lg: 12px; --cp-radius-pill: 999px;
      --cp-shadow-sm: 0 1px 2px rgba(0,0,0,.06);
      --cp-font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      --cp-transition-fast: 150ms ease;
    }
    .page-header {
      margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    }
    .page-header-left h1 { font-size: 20px; font-weight: 600; color: var(--cp-text); margin-bottom: 4px; }
    .page-header-left p { font-size: 14px; color: var(--cp-text-secondary); }
    .page-header-right { display: flex; gap: 8px; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      height: 36px; padding: 0 16px; font-size: 14px; font-weight: 500;
      border-radius: var(--cp-radius-md); border: 1px solid transparent;
      cursor: pointer; transition: all var(--cp-transition-fast);
      user-select: none; white-space: nowrap; text-decoration: none; font-family: inherit;
    }
    .btn-sm { height: 28px; padding: 0 10px; font-size: 13px; }
    .btn-primary { background: var(--cp-primary); color: #fff; border-color: var(--cp-primary); }
    .btn-primary:hover { background: #4096ff; }
    .btn-ghost { background: transparent; color: var(--cp-text-secondary); border-color: transparent; }
    .btn-ghost:hover { background: var(--cp-primary-subtle); color: var(--cp-primary); }

    .card {
      background: var(--cp-surface); border-radius: var(--cp-radius-lg);
      border: 1px solid var(--cp-border); box-shadow: var(--cp-shadow-sm); overflow: hidden;
    }
    .card-body { padding: 24px; }

    /* Filter Bar */
    .filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .table-toolbar-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .table-toolbar-right { display: flex; align-items: center; gap: 8px; }
    .search-wrap {
      display: flex; align-items: center; gap: 8px;
      padding: 0 12px; height: 36px;
      border: 1px solid var(--cp-border); border-radius: var(--cp-radius-md);
      background: var(--cp-surface); color: var(--cp-text-tertiary);
    }
    .search-wrap:focus-within { border-color: var(--cp-primary); }
    .search-input { border: none; outline: none; background: transparent; font-size: 14px; color: var(--cp-text); width: 200px; font-family: inherit; }
    .search-input::placeholder { color: var(--cp-text-tertiary); }

    .filter-chips { display: flex; gap: 8px; }
    .filter-chip {
      padding: 4px 12px; font-size: 13px; color: var(--cp-text-secondary);
      border: 1px solid var(--cp-border); border-radius: var(--cp-radius-pill);
      cursor: pointer; user-select: none; transition: all var(--cp-transition-fast);
      display: flex; align-items: center; gap: 4px;
    }
    .filter-chip:hover { border-color: var(--cp-primary); color: var(--cp-primary); }
    .filter-chip.active { background: var(--cp-primary-subtle); border-color: var(--cp-primary); color: var(--cp-primary); }
    .filter-chip strong { font-family: var(--cp-font-mono); }

    /* Table */
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      padding: 12px 16px; font-size: 13px; font-weight: 500; color: var(--cp-text-secondary);
      text-align: left; border-bottom: 1px solid var(--cp-border);
      background: var(--cp-surface-2); white-space: nowrap;
    }
    .data-table td {
      padding: 12px 16px; font-size: 14px; color: var(--cp-text);
      border-bottom: 1px solid var(--cp-border);
    }
    .data-table tr:hover td { background: var(--cp-surface-2); }
    .col-actions { text-align: right; white-space: nowrap; }
    .col-time { font-family: var(--cp-font-mono); font-size: 13px; white-space: nowrap; color: var(--cp-text-secondary); }

    .agent-name { font-weight: 500; }
    .agent-desc { max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--cp-text-secondary); font-size: 13px; }

    /* Badges */
    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; font-size: 12px; font-weight: 500;
      border-radius: var(--cp-radius-pill); white-space: nowrap;
    }
    .badge-success { background: var(--cp-success-bg); color: var(--cp-success); }
    .badge-default { background: var(--cp-surface-2); color: var(--cp-text-secondary); border: 1px solid var(--cp-border); }
    .badge-danger { background: var(--cp-danger-bg); color: var(--cp-danger); }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; }
    .badge-dot.online { background: var(--cp-success); }
    .badge-dot.offline { background: var(--cp-text-tertiary); }
    .badge-dot.error { background: var(--cp-danger); }
    .skill-count { display: inline-flex; align-items: center; gap: 4px; font-family: var(--cp-font-mono); font-size: 13px; }

    /* Empty State */
    .empty-state { text-align: center; padding: 48px 24px; }
    .empty-state-icon { width: 64px; height: 64px; margin: 0 auto 16px; background: var(--cp-surface-2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--cp-text-tertiary); }
    .empty-state-icon svg { width: 32px; height: 32px; }
    .empty-state h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .empty-state p { font-size: 14px; color: var(--cp-text-secondary); margin-bottom: 16px; }

    /* Pagination */
    .pagination {
      display: flex; align-items: center; justify-content: space-between;
      padding-top: 16px; border-top: 1px solid var(--cp-border); margin-top: 16px;
    }
    .pagination-info { font-size: 13px; color: var(--cp-text-secondary); }
    .pagination-info strong { color: var(--cp-text); font-family: var(--cp-font-mono); }
    .pagination-btns { display: flex; gap: 4px; }
    .pagination-btn {
      width: 32px; height: 32px; border: 1px solid var(--cp-border); border-radius: var(--cp-radius-md);
      background: var(--cp-surface); cursor: pointer; font-size: 14px; color: var(--cp-text-secondary);
      display: flex; align-items: center; justify-content: center; transition: all var(--cp-transition-fast);
    }
    .pagination-btn:hover:not(:disabled):not(.active) { border-color: var(--cp-primary); color: var(--cp-primary); }
    .pagination-btn.active { background: var(--cp-primary); color: #fff; border-color: var(--cp-primary); }
    .pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
})
export class UserAgentsComponent implements OnInit {
  agents: Agent[] = [];
  loading = true;
  searchKeyword = '';
  currentFilter = 'all';

  statusMap: Record<string, { text: string }> = {
    running: { text: '在线' },
    online: { text: '在线' },
    stopped: { text: '离线' },
    offline: { text: '离线' },
    error: { text: '错误' }
  };

  get allCount(): number { return this.agents.length; }
  get onlineCount(): number { return this.agents.filter(a => a.status === 'running').length; }
  get offlineCount(): number { return this.agents.filter(a => a.status === 'stopped').length; }
  get errorCount(): number { return this.agents.filter(a => a.status === 'error').length; }

  get filteredAgents(): Agent[] {
    return this.agents.filter(a => {
      const matchFilter = this.currentFilter === 'all'
        || (this.currentFilter === 'online' && a.status === 'running')
        || (this.currentFilter === 'offline' && a.status === 'stopped')
        || (this.currentFilter === 'error' && a.status === 'error');
      const matchSearch = !this.searchKeyword
        || (a.name && a.name.toLowerCase().includes(this.searchKeyword.toLowerCase()))
        || (a.description && a.description.toLowerCase().includes(this.searchKeyword.toLowerCase()));
      return matchFilter && matchSearch;
    });
  }

  constructor(
    private api: UserApiService,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
  }

  loadAgents(): void {
    this.loading = true;
    this.api.getAgents().subscribe({
      next: res => { this.agents = res.items; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
  }

  filterAgents(): void {
    // Triggered by search input, the getter handles filtering automatically
  }

  placeholder(): void {
    this.msg.info('功能开发中，敬请期待');
  }

  deleteAgent(agent: Agent): void {
    this.api.deleteAgent(agent.id).subscribe({
      next: () => {
        this.msg.success('已删除');
        this.loadAgents();
      },
      error: (err) => this.msg.error(err.message || '删除失败')
    });
  }
}
