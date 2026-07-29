import { Component, OnInit } from '@angular/core';
import { UserApiService } from '../../services/user-api.service';
import { UserAuthService } from '../../services/user-auth.service';

@Component({
  standalone: false,
  selector: 'app-user-dashboard',
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1>控制台</h1>
        <p>欢迎回来，{{ userName }}</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-primary btn-sm" routerLink="/user/agents">创建 Agent</button>
        <button class="btn btn-secondary btn-sm" routerLink="/user/chat">发起会话</button>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="stats-grid">
      <div class="stat-card" *ngFor="let card of statCards">
        <div class="stat-card-icon" [ngClass]="card.color">
          <svg viewBox="0 0 24 24" [innerHTML]="card.icon"></svg>
        </div>
        <div class="stat-card-info">
          <div class="stat-card-label">{{ card.label }}</div>
          <div class="stat-card-value">{{ card.value }}</div>
          <div class="stat-card-change" [class.up]="card.trend === 'up'" [class.down]="card.trend === 'down'">
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round">
              <ng-container *ngIf="card.trend === 'up'">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </ng-container>
              <ng-container *ngIf="card.trend === 'down'">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
              </ng-container>
            </svg>
            <span>{{ card.change }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div class="two-col">
      <!-- Left: Recent Sessions -->
      <div class="card">
        <div class="card-header">
          <h3>最近会话</h3>
          <a class="btn btn-ghost btn-sm" routerLink="/user/sessions">查看全部</a>
        </div>
        <div class="card-body" style="padding:0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>会话名称</th>
                <th>Agent</th>
                <th>状态</th>
                <th>时间</th>
                <th>Token</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of recentSessions">
                <td>
                  <div class="session-name">
                    <a class="session-name-link" [routerLink]="['/user/chat', s.id]">{{ s.title }}</a>
                  </div>
                  <div class="session-agent">{{ s.desc }}</div>
                </td>
                <td>{{ s.agent }}</td>
                <td><span class="badge" [class.badge-success]="s.status==='completed'" [class.badge-warning]="s.status==='active'" [class.badge-danger]="s.status==='error'">{{ s.statusText }}</span></td>
                <td class="col-time">{{ s.time }}</td>
                <td class="col-id">{{ s.tokens }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Column -->
      <div style="display:flex;flex-direction:column;gap:24px;">
        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header"><h3>快捷入口</h3></div>
          <div class="card-body">
            <div class="quick-actions">
              <a class="quick-action-card" routerLink="/user/agents">
                <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>创建 Agent</span>
              </a>
              <a class="quick-action-card" routerLink="/user/chat">
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>发起会话</span>
              </a>
              <a class="quick-action-card" routerLink="/user/billing">
                <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                <span>查看用量</span>
              </a>
              <a class="quick-action-card" routerLink="/user/settings">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <span>平台设置</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Usage Trend -->
        <div class="card">
          <div class="card-header">
            <h3>用量趋势</h3>
            <span class="text-xs text-tertiary">近 7 天 Token 消耗</span>
          </div>
          <div class="card-body">
            <div class="trend-bars">
              <div class="trend-bar" *ngFor="let bar of trendBars" [style.height]="bar.height + '%'">
                <span class="trend-bar-label">{{ bar.label }}</span>
              </div>
            </div>
            <div class="trend-legend">
              <span>{{ trendStart }}</span>
              <span style="color:var(--cp-text-secondary);font-weight:500;">日均 {{ avgDaily }} tokens</span>
              <span>{{ trendEnd }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --cp-primary: #1677ff;
      --cp-primary-subtle: #e6f4ff;
      --cp-secondary: #8B5CF6;
      --cp-success: #16A34A;
      --cp-success-bg: rgba(22,163,74,.12);
      --cp-warning: #D97706;
      --cp-warning-bg: rgba(217,119,6,.12);
      --cp-danger: #DC2626;
      --cp-danger-bg: rgba(220,38,38,.12);
      --cp-surface: #FFFFFF;
      --cp-surface-2: #fafafa;
      --cp-border: #f0f0f0;
      --cp-text: #111827;
      --cp-text-secondary: #6b7280;
      --cp-text-tertiary: #9ca3af;
      --cp-radius-md: 8px;
      --cp-radius-lg: 12px;
      --cp-radius-pill: 999px;
      --cp-shadow-sm: 0 1px 2px rgba(0,0,0,.06);
      --cp-shadow-md: 0 4px 6px rgba(0,0,0,.08);
      --cp-font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      --cp-transition-fast: 150ms ease;
    }

    /* Page Header */
    .page-header {
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .page-header-left h1 {
      font-size: 20px;
      font-weight: 600;
      color: var(--cp-text);
      margin-bottom: 4px;
    }
    .page-header-left p {
      font-size: 14px;
      color: var(--cp-text-secondary);
    }
    .page-header-right {
      display: flex;
      gap: 8px;
    }

    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      height: 36px; padding: 0 16px;
      font-size: 14px; font-weight: 500;
      border-radius: var(--cp-radius-md);
      border: 1px solid transparent;
      cursor: pointer; transition: all var(--cp-transition-fast);
      user-select: none; white-space: nowrap; text-decoration: none;
      font-family: inherit;
    }
    .btn-sm { height: 28px; padding: 0 10px; font-size: 13px; }
    .btn-primary { background: var(--cp-primary); color: #fff; border-color: var(--cp-primary); }
    .btn-primary:hover { background: #4096ff; border-color: #4096ff; }
    .btn-secondary { background: var(--cp-surface); color: var(--cp-text); border-color: var(--cp-border); }
    .btn-secondary:hover { color: var(--cp-primary); border-color: var(--cp-primary); }
    .btn-ghost { background: transparent; color: var(--cp-text-secondary); border-color: transparent; }
    .btn-ghost:hover { background: var(--cp-primary-subtle); color: var(--cp-primary); }

    /* Stat Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--cp-surface);
      border: 1px solid var(--cp-border);
      border-radius: var(--cp-radius-lg);
      padding: 20px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      box-shadow: var(--cp-shadow-sm);
      transition: all 300ms ease;
    }
    .stat-card:hover { box-shadow: var(--cp-shadow-md); }
    .stat-card-icon {
      width: 44px; height: 44px;
      border-radius: var(--cp-radius-md);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-card-icon.blue { background: var(--cp-primary-subtle); color: var(--cp-primary); }
    .stat-card-icon.green { background: var(--cp-success-bg); color: var(--cp-success); }
    .stat-card-icon.purple { background: rgba(139,92,246,.12); color: var(--cp-secondary); }
    .stat-card-icon.orange { background: var(--cp-warning-bg); color: var(--cp-warning); }
    .stat-card-icon svg { width: 20px; height: 20px; stroke: currentColor; fill: none; stroke-width: 2; }
    .stat-card-info { flex: 1; min-width: 0; }
    .stat-card-label { font-size: 13px; color: var(--cp-text-secondary); margin-bottom: 4px; }
    .stat-card-value { font-size: 24px; font-weight: 700; color: var(--cp-text); font-family: var(--cp-font-mono); }
    .stat-card-change { font-size: 12px; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
    .stat-card-change.up { color: var(--cp-success); }
    .stat-card-change.down { color: var(--cp-danger); }

    /* Two Column */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 24px;
    }
    @media (max-width: 1024px) {
      .two-col { grid-template-columns: 1fr; }
    }

    /* Card */
    .card {
      background: var(--cp-surface);
      border-radius: var(--cp-radius-lg);
      border: 1px solid var(--cp-border);
      box-shadow: var(--cp-shadow-sm);
      overflow: hidden;
    }
    .card-header {
      padding: 16px 24px;
      border-bottom: 1px solid var(--cp-border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .card-header h3 { font-size: 16px; font-weight: 600; color: var(--cp-text); }
    .card-body { padding: 24px; }

    /* Data Table */
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      padding: 12px 16px;
      font-size: 13px; font-weight: 500;
      color: var(--cp-text-secondary);
      text-align: left;
      border-bottom: 1px solid var(--cp-border);
      background: var(--cp-surface-2);
      white-space: nowrap;
    }
    .data-table td {
      padding: 12px 16px;
      font-size: 14px;
      color: var(--cp-text);
      border-bottom: 1px solid var(--cp-border);
    }
    .data-table tr:hover td { background: var(--cp-surface-2); }
    .col-time, .col-id { font-family: var(--cp-font-mono); font-size: 13px; white-space: nowrap; }

    .session-name { font-weight: 500; color: var(--cp-text); margin-bottom: 2px; }
    .session-agent { font-size: 12px; color: var(--cp-text-tertiary); }
    .session-name-link { color: var(--cp-primary); cursor: pointer; text-decoration: none; }
    .session-name-link:hover { text-decoration: underline; }

    /* Badges */
    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; font-size: 12px; font-weight: 500;
      border-radius: var(--cp-radius-pill); white-space: nowrap;
    }
    .badge-success { background: var(--cp-success-bg); color: var(--cp-success); }
    .badge-warning { background: var(--cp-warning-bg); color: var(--cp-warning); }
    .badge-danger { background: var(--cp-danger-bg); color: var(--cp-danger); }

    /* Quick Actions */
    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .quick-action-card {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 8px; padding: 20px 12px;
      background: var(--cp-surface-2);
      border: 1px solid var(--cp-border);
      border-radius: var(--cp-radius-md);
      cursor: pointer; transition: all var(--cp-transition-fast);
      text-align: center; color: var(--cp-text); text-decoration: none;
    }
    .quick-action-card:hover {
      border-color: var(--cp-primary);
      background: var(--cp-primary-subtle);
    }
    .quick-action-card svg {
      width: 24px; height: 24px;
      stroke: var(--cp-primary); fill: none; stroke-width: 1.6;
    }
    .quick-action-card span { font-size: 13px; font-weight: 500; color: var(--cp-text-secondary); }

    /* Trend Bars */
    .trend-bars {
      display: flex; align-items: flex-end;
      gap: 6px; height: 100px; padding: 8px 0;
    }
    .trend-bar {
      flex: 1;
      background: var(--cp-primary);
      border-radius: 3px 3px 0 0;
      opacity: .7; transition: opacity var(--cp-transition-fast);
      min-height: 4px; position: relative;
    }
    .trend-bar:hover { opacity: 1; }
    .trend-bar-label {
      position: absolute; bottom: -20px; left: 50%;
      transform: translateX(-50%);
      font-size: 10px; color: var(--cp-text-tertiary); white-space: nowrap;
    }
    .trend-legend {
      display: flex; justify-content: space-between;
      margin-top: 28px; font-size: 12px; color: var(--cp-text-tertiary);
    }

    .text-xs { font-size: 12px; }
    .text-tertiary { color: var(--cp-text-tertiary); }
  `]
})
export class UserDashboardComponent implements OnInit {
  userName = '用户';

  statCards = [
    { label: 'Agent 总数', value: '12', icon: '<circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>', color: 'blue', trend: 'up', change: '较上月 +20%' },
    { label: '活跃会话', value: '48', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', color: 'green', trend: 'up', change: '较上月 +12%' },
    { label: '本月 Token', value: '128.5K', icon: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', color: 'purple', trend: 'up', change: '较上月 +35%' },
    { label: '本月费用', value: '$12.85', icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', color: 'orange', trend: 'down', change: '较上月 -8%' }
  ];

  recentSessions = [
    { id: '1', title: '代码审查 - 用户模块', desc: '针对用户登录模块进行安全检查', agent: 'Code Review Agent', status: 'completed', statusText: '已完成', time: '07-22 14:30', tokens: '2.4K' },
    { id: '2', title: '数据分析 - Q2 报表', desc: '分析第二���度销售数据', agent: 'Data Analyst Agent', status: 'active', statusText: '进行中', time: '07-22 11:15', tokens: '8.1K' },
    { id: '3', title: '文案生成 - 产品介绍', desc: '为新品发布会撰写产品文案', agent: 'Content Writer', status: 'completed', statusText: '已完成', time: '07-21 16:45', tokens: '5.7K' },
    { id: '4', title: 'API 文档生成', desc: '根据 Swagger 生成接口文档', agent: 'Doc Generator', status: 'completed', statusText: '已完成', time: '07-21 09:20', tokens: '3.2K' },
    { id: '5', title: '故障排查 - 支付回调', desc: '排查微信支付回调异常问题', agent: 'Debug Assistant', status: 'error', statusText: '异常', time: '07-20 18:30', tokens: '1.9K' }
  ];

  trendBars = [
    { label: '7/16', height: 40 }, { label: '7/17', height: 55 },
    { label: '7/18', height: 70 }, { label: '7/19', height: 35 },
    { label: '7/20', height: 85 }, { label: '7/21', height: 60 },
    { label: '7/22', height: 90 }
  ];
  trendStart = '7/16';
  trendEnd = '7/22';
  avgDaily = '18.4K';

  constructor(
    private api: UserApiService,
    private authService: UserAuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user?.display_name) {
        this.userName = user.display_name;
      }
    });

    // Load real data
    this.loadData();
  }

  private loadData(): void {
    this.api.getAgents().subscribe({
      next: res => { this.statCards[0].value = res.total.toString(); }
    });
    this.api.getBillingSummary().subscribe({
      next: res => {
        this.statCards[2].value = (res.input_tokens + res.output_tokens).toLocaleString();
        this.statCards[3].value = '$' + res.cost_estimate_usd.toFixed(2);
      }
    });
  }
}
