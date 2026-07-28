import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AdminCrudService } from '@core';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-admin-dashboard', 
  template: `
    <div nz-row [nzGutter]="16">
      <div nz-col [nzSpan]="6" *ngFor="let card of cards">
        <nz-card [nzTitle]="card.title" [nzLoading]="loading">
          <h2 style="font-size:28px;margin:0">{{ card.value }}</h2>
        </nz-card>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  cards: { title: string; value: string | number }[] = [
    { title: '用户总数', value: '-' }, { title: '活跃用户', value: '-' },
    { title: 'Agent 总数', value: '-' }, { title: '在线 Agent', value: '-' },
    { title: '会话总数', value: '-' }, { title: '活跃会话', value: '-' },
    { title: '总 Token', value: '-' }, { title: '估算费用(USD)', value: '-' }
  ];

  constructor(private http: HttpClient, private msg: NzMessageService) {}

  ngOnInit(): void {
    this.http.get<any>('admin/v1/dashboard/index').subscribe({
      next: (res) => {
        this.loading = false;
        if (res.state === 0 && res.data) {
          const d = res.data;
          this.cards[0].value = d.total_users || 0;
          this.cards[1].value = d.active_users || 0;
          this.cards[2].value = d.total_agents || 0;
          this.cards[3].value = d.online_agents || 0;
          this.cards[4].value = d.total_sessions || 0;
          this.cards[5].value = d.active_sessions || 0;
          this.cards[6].value = (d.total_tokens || 0).toLocaleString();
          this.cards[7].value = '$' + (d.total_cost || 0);
        }
      },
      error: () => { this.loading = false; }
    });
  }
}
