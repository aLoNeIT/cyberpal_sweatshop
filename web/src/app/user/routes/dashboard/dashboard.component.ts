import { Component, OnInit } from '@angular/core';
import { UserApiService } from '../../services/user-api.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-user-dashboard',
  template: `
    <div class="dashboard-page">
      <h2 class="page-title">仪表盘</h2>
      <nz-row [nzGutter]="16">
        <nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6" *ngFor="let card of cards">
          <nz-card [nzTitle]="card.title" [nzLoading]="loading" [nzHoverable]="true">
            <div class="card-value">{{ card.value }}</div>
          </nz-card>
        </nz-col>
      </nz-row>
      <nz-row [nzGutter]="16" style="margin-top: 24px;">
        <nz-col [nzSpan]="24">
          <nz-card nzTitle="快捷操作">
            <nz-space>
              <button *nzSpaceItem nz-button nzType="primary" routerLink="/user/agents">
                <span nz-icon nzType="robot"></span> 管理 Agent
              </button>
              <button *nzSpaceItem nz-button routerLink="/user/sessions">
                <span nz-icon nzType="history"></span> 查看会话
              </button>
              <button *nzSpaceItem nz-button routerLink="/user/billing">
                <span nz-icon nzType="dollar-circle"></span> 查看计费
              </button>
            </nz-space>
          </nz-card>
        </nz-col>
      </nz-row>
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
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  loading = true;
  cards = [
    { title: 'Agent 总数', value: '-' },
    { title: '活跃会话', value: '-' },
    { title: '本月输入 Token', value: '-' },
    { title: '估算费用(USD)', value: '-' }
  ];

  constructor(private api: UserApiService) {}

  ngOnInit(): void {
    Promise.all([
      this.loadAgents(),
      this.loadBilling()
    ]).finally(() => this.loading = false);
  }

  private loadAgents(): Promise<void> {
    return new Promise(resolve => {
      this.api.getAgents().subscribe({
        next: res => {
          this.cards[0].value = res.total.toString();
          // 活跃会话数从 sessions 获取
          this.cards[1].value = '0';
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  private loadBilling(): Promise<void> {
    return new Promise(resolve => {
      this.api.getBillingSummary().subscribe({
        next: res => {
          this.cards[2].value = (res.input_tokens + res.output_tokens).toLocaleString();
          this.cards[3].value = '$' + res.cost_estimate_usd.toFixed(4);
          resolve();
        },
        error: () => resolve()
      });
    });
  }
}
