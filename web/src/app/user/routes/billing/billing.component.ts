import { Component, OnInit } from '@angular/core';
import { UserApiService } from '../../services/user-api.service';
import { BillingSummary, BillingRecord } from '../../models/user.model';

@Component({
  standalone: false,
  selector: 'app-user-billing',
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1>消费明细</h1>
        <p>查看费用来源、余额和消费记录</p>
      </div>
      <div class="page-header-right">
        <select class="period-select" [(ngModel)]="period" (change)="loadData()">
          <option value="current_month">本月</option>
          <option value="last_month">上月</option>
          <option value="current_year">今年</option>
        </select>
      </div>
    </div>

    <!-- Source Cards -->
    <div class="source-grid">
      <div class="source-card" *ngFor="let src of sourceCards">
        <div class="source-card-icon" [style.background]="src.bg" [style.color]="src.color">
          {{ src.emoji }}
        </div>
        <div class="source-card-info">
          <div class="source-card-label">{{ src.label }}</div>
          <div class="source-card-value">{{ src.value }}</div>
          <div class="source-card-sub" [class.up]="src.trend==='up'" [class.down]="src.trend==='down'">
            {{ src.change }}
          </div>
        </div>
      </div>
    </div>

    <!-- Balance Card -->
    <div class="balance-card">
      <div class="balance-info">
        <div class="balance-label">账户余额</div>
        <div class="balance-value">{{ balance }}</div>
        <button class="btn btn-primary btn-sm" style="margin-top:12px">充值</button>
      </div>
      <div class="balance-divider"></div>
      <div class="balance-info">
        <div class="balance-label">预估月费</div>
        <div class="balance-value" style="color:var(--cp-warning)">{{ estMonthly }}</div>
        <div style="font-size:12px;color:var(--cp-text-tertiary);margin-top:4px">基于当前用量推算</div>
      </div>
    </div>

    <!-- Detail Table -->
    <div class="card">
      <div class="card-header">
        <h3>消费明细</h3>
      </div>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>Agent</th>
              <th>模型</th>
              <th>类型</th>
              <th>输入 Token</th>
              <th>输出 Token</th>
              <th>费用</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of records">
              <td class="col-time">{{ r.created_at | date:'yyyy-MM-dd' }}</td>
              <td>-</td>
              <td><span class="badge badge-default">{{ r.model }}</span></td>
              <td>Chat</td>
              <td class="text-mono">{{ r.input_tokens | number }}</td>
              <td class="text-mono">{{ r.output_tokens | number }}</td>
              <td class="text-mono" style="color:var(--cp-warning)">{{ formatCost(r.cost_estimate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer">
        <div style="font-size:13px;color:var(--cp-text-secondary)">共 {{ recordTotal }} 条记录</div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --cp-primary: #1677ff; --cp-primary-subtle: #e6f4ff;
      --cp-success: #16A34A; --cp-warning: #D97706; --cp-danger: #DC2626;
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
    .period-select { height:36px; padding:0 12px; font-size:14px; border:1px solid var(--cp-border); border-radius:var(--cp-radius-md); background:var(--cp-surface); color:var(--cp-text); outline:none; font-family:inherit; cursor:pointer; }
    .period-select:focus { border-color:var(--cp-primary); }

    /* Source Grid */
    .source-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:24px; }
    @media (max-width:768px) { .source-grid { grid-template-columns:1fr; } }
    .source-card {
      background:var(--cp-surface); border:1px solid var(--cp-border);
      border-radius:var(--cp-radius-lg); padding:20px;
      display:flex; align-items:flex-start; gap:16px;
    }
    .source-card-icon { width:44px; height:44px; border-radius:var(--cp-radius-md); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:20px; }
    .source-card-info { flex:1; }
    .source-card-label { font-size:13px; color:var(--cp-text-secondary); margin-bottom:4px; }
    .source-card-value { font-size:20px; font-weight:700; color:var(--cp-text); font-family:var(--cp-font-mono); }
    .source-card-sub { font-size:12px; margin-top:4px; }
    .source-card-sub.up { color:var(--cp-success); }
    .source-card-sub.down { color:var(--cp-danger); }

    /* Balance */
    .balance-card {
      background:var(--cp-surface); border:1px solid var(--cp-border);
      border-radius:var(--cp-radius-lg); padding:24px; margin-bottom:24px;
      display:flex; gap:32px;
    }
    @media (max-width:768px) { .balance-card { flex-direction:column; } }
    .balance-info { flex:1; }
    .balance-label { font-size:13px; color:var(--cp-text-secondary); margin-bottom:8px; }
    .balance-value { font-size:28px; font-weight:700; color:var(--cp-text); font-family:var(--cp-font-mono); }
    .balance-divider { width:1px; background:var(--cp-border); flex-shrink:0; }

    /* Card */
    .card { background:var(--cp-surface); border-radius:var(--cp-radius-lg); border:1px solid var(--cp-border); box-shadow:var(--cp-shadow-sm); overflow:hidden; }
    .card-header { padding:16px 24px; border-bottom:1px solid var(--cp-border); display:flex; align-items:center; justify-content:space-between; }
    .card-header h3 { font-size:16px; font-weight:600; color:var(--cp-text); }
    .card-footer { padding:12px 24px; border-top:1px solid var(--cp-border); display:flex; align-items:center; justify-content:space-between; }

    /* Table */
    .data-table { width:100%; border-collapse:collapse; }
    .data-table th { padding:12px 16px; font-size:13px; font-weight:500; color:var(--cp-text-secondary); text-align:left; border-bottom:1px solid var(--cp-border); background:var(--cp-surface-2); white-space:nowrap; }
    .data-table td { padding:12px 16px; font-size:14px; color:var(--cp-text); border-bottom:1px solid var(--cp-border); }
    .data-table tr:hover td { background:var(--cp-surface-2); }
    .col-time { font-family:var(--cp-font-mono); font-size:13px; color:var(--cp-text-secondary); white-space:nowrap; }
    .text-mono { font-family:var(--cp-font-mono); font-size:13px; }

    .badge { display:inline-flex; align-items:center; padding:2px 8px; font-size:12px; font-weight:500; border-radius:var(--cp-radius-pill); white-space:nowrap; }
    .badge-default { background:var(--cp-surface-2); color:var(--cp-text-secondary); border:1px solid var(--cp-border); }

    .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; height:36px; padding:0 16px; font-size:14px; font-weight:500; border-radius:var(--cp-radius-md); border:1px solid transparent; cursor:pointer; transition:all var(--cp-transition-fast); user-select:none; white-space:nowrap; font-family:inherit; }
    .btn-sm { height:28px; padding:0 10px; font-size:13px; }
    .btn-primary { background:var(--cp-primary); color:#fff; border-color:var(--cp-primary); }
    .btn-primary:hover { background:#4096ff; }
  `]
})
export class UserBillingComponent implements OnInit {
  loading = true;
  period = 'current_month';
  balance = '$50.00';
  estMonthly = '$12.85';
  records: BillingRecord[] = [];
  recordTotal = 0;

  sourceCards = [
    { label: 'Chat 对话', value: '$8.52', change: '占比 66.3%', trend: 'up', emoji: '💬', bg: '#e6f4ff', color: '#1677ff' },
    { label: 'API 调用', value: '$3.10', change: '占比 24.1%', trend: 'down', emoji: '🔌', bg: 'rgba(139,92,246,.12)', color: '#8B5CF6' },
    { label: 'Skill 市场', value: '$1.23', change: '占比 9.6%', trend: 'up', emoji: '🧩', bg: 'rgba(22,163,74,.12)', color: '#16A34A' }
  ];

  constructor(private api: UserApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.api.getBillingSummary().subscribe({
      next: res => {
        if (res.cost_estimate_usd > 0) {
          this.balance = '$' + Math.max(0, 50 - res.cost_estimate_usd).toFixed(2);
          this.estMonthly = '$' + res.cost_estimate_usd.toFixed(2);
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.api.getBillingRecords(1, 20).subscribe({
      next: res => { this.records = res.items; this.recordTotal = res.total; },
      error: () => {}
    });
  }

  formatCost(cost: number | null | undefined): string {
    return '$' + ((cost || 0).toFixed(6));
  }
}
