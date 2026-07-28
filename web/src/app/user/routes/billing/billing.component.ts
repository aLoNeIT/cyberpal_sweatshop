import { Component, OnInit } from '@angular/core';
import { UserApiService } from '../../services/user-api.service';
import { BillingSummary, BillingRecord } from '../../models/user.model';

@Component({
  standalone: false,
  selector: 'app-user-billing',
  template: `
    <div class="billing-page">
      <h2 class="page-title">计费概览</h2>
      <nz-row [nzGutter]="16">
        <nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6" *ngFor="let card of summaryCards">
          <nz-card [nzTitle]="card.title" [nzLoading]="loading">
            <div class="card-value">{{ card.value }}</div>
          </nz-card>
        </nz-col>
      </nz-row>

      <nz-card nzTitle="按模型分布" style="margin-top: 16px;" *ngIf="summary?.by_model?.length">
        <nz-row [nzGutter]="8">
          <nz-col *ngFor="let m of summary.by_model" [nzSpan]="8">
            <nz-statistic [nzTitle]="m.model" [nzValue]="m.tokens | number"></nz-statistic>
            <nz-statistic nzTitle="费用" [nzValue]="'$' + m.cost.toFixed(4)"></nz-statistic>
          </nz-col>
        </nz-row>
      </nz-card>

      <nz-card nzTitle="计费记录" style="margin-top: 16px;">
        <nz-table #table [nzData]="records" [nzLoading]="loading" [nzFrontPagination]="false"
          [nzTotal]="recordTotal" [nzPageIndex]="page" [nzPageSize]="pageSize" (nzPageIndexChange)="onPageChange($event)">
          <thead>
            <tr>
              <th>模型</th>
              <th>输入 Token</th>
              <th>输出 Token</th>
              <th>费用(USD)</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of records">
              <td>{{ r.model }}</td>
              <td>{{ r.input_tokens | number }}</td>
              <td>{{ r.output_tokens | number }}</td>
              <td>${{ (r.cost_estimate || 0) | number:'1.6-6' }}</td>
              <td>{{ r.created_at | date:'yyyy-MM-dd HH:mm' }}</td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 24px;
      color: #1a1a2e;
    }
    .card-value {
      font-size: 28px;
      font-weight: 700;
      color: #667eea;
    }
  `]
})
export class UserBillingComponent implements OnInit {
  loading = true;
  summary: BillingSummary | null = null;
  summaryCards: { title: string; value: string }[] = [
    { title: '输入 Token', value: '-' },
    { title: '输出 Token', value: '-' },
    { title: '缓存读取 Token', value: '-' },
    { title: '总费用(USD)', value: '-' }
  ];
  records: BillingRecord[] = [];
  page = 1;
  pageSize = 20;
  recordTotal = 0;

  constructor(private api: UserApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.api.getBillingSummary().subscribe({
      next: res => {
        this.summary = res;
        this.summaryCards[0].value = res.input_tokens.toLocaleString();
        this.summaryCards[1].value = res.output_tokens.toLocaleString();
        this.summaryCards[2].value = res.cache_read_tokens.toLocaleString();
        this.summaryCards[3].value = '$' + res.cost_estimate_usd.toFixed(4);
      },
      error: () => {}
    });
    this.api.getBillingRecords(this.page, this.pageSize).subscribe({
      next: res => {
        this.records = res.items;
        this.recordTotal = res.total;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadData();
  }
}
