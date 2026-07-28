import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-admin-billing', 
  template: `
    <div nz-row [nzGutter]="16">
      <div nz-col [nzSpan]="6">
        <nz-card nzTitle="总输入 Token" [nzLoading]="loading"><h2 style="margin:0">{{ (summary?.total_input || 0) | number }}</h2></nz-card>
      </div>
      <div nz-col [nzSpan]="6">
        <nz-card nzTitle="总输出 Token" [nzLoading]="loading"><h2 style="margin:0">{{ (summary?.total_output || 0) | number }}</h2></nz-card>
      </div>
      <div nz-col [nzSpan]="6">
        <nz-card nzTitle="活跃用户" [nzLoading]="loading"><h2 style="margin:0">{{ summary?.user_count || 0 }}</h2></nz-card>
      </div>
      <div nz-col [nzSpan]="6">
        <nz-card nzTitle="估算费用(USD)" [nzLoading]="loading"><h2 style="margin:0">\${{ summary?.total_cost || 0 }}</h2></nz-card>
      </div>
    </div>
    <nz-card nzTitle="用���用量 Top 10" style="margin-top:16px">
      <nz-table [nzData]="topUsers" [nzLoading]="loading" nzBordered nzSize="small">
        <thead><tr><th>#</th><th>用户</th><th>Token</th><th>费用(USD)</th></tr></thead>
        <tbody>
          @for (row of topUsers; track row.user_id; let i = $index) {
            <tr><td>{{ i + 1 }}</td><td>{{ row.account || row.name }}</td><td>{{ row.total_tokens | number }}</td><td>\${{ row.total_cost }}</td></tr>
          }
        </tbody>
      </nz-table>
    </nz-card>
    <nz-card nzTitle="Provider 分布" style="margin-top:16px">
      <nz-table [nzData]="providerDist" nzBordered nzSize="small">
        <thead><tr><th>Provider</th><th>Token</th><th>费用(USD)</th></tr></thead>
        <tbody>
          @for (row of providerDist; track row.provider) {
            <tr><td>{{ row.provider }}</td><td>{{ row.total_tokens | number }}</td><td>\${{ row.total_cost }}</td></tr>
          }
        </tbody>
      </nz-table>
    </nz-card>
  `
})
export class AdminBillingComponent implements OnInit {
  loading = true; summary: any = {}; topUsers: any[] = []; providerDist: any[] = [];
  constructor(private http: HttpClient, private msg: NzMessageService) {}
  ngOnInit(): void {
    this.http.get<any>('admin/v1/billing/index').subscribe({
      next: (res) => { this.loading = false; if (res.state === 0) { const d = res.data; this.summary = d.summary; this.topUsers = d.top_users || []; this.providerDist = d.provider_dist || []; } },
      error: () => { this.loading = false; }
    });
  }
}

@Component({
  standalone: false,
  selector: 'app-admin-config', 
  template: `
    <nz-card nzTitle="全局配置" [nzLoading]="loading">
      <form nz-form [nzLayout]="'vertical'">
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label>自动归档</nz-form-label>
              <nz-form-control><nz-switch [(ngModel)]="config['auto_archive_enabled']" name="auto_archive_enabled"></nz-switch></nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label>归档天数</nz-form-label>
              <nz-form-control><nz-input-number [(ngModel)]="config['auto_archive_days']" [nzMin]="1" name="auto_archive_days"></nz-input-number></nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label>活跃会话上限</nz-form-label>
              <nz-form-control><nz-input-number [(ngModel)]="config['active_session_limit']" [nzMin]="1" name="active_session_limit"></nz-input-number></nz-form-control>
            </nz-form-item>
          </div>
          <div nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label>归档会话上限</nz-form-label>
              <nz-form-control><nz-input-number [(ngModel)]="config['archived_session_limit']" [nzMin]="1" name="archived_session_limit"></nz-input-number></nz-form-control>
            </nz-form-item>
          </div>
        </div>
        <button nz-button nzType="primary" (click)="onSave()">保存配置</button>
      </form>
    </nz-card>
  `
})
export class AdminConfigComponent implements OnInit {
  loading = true; config: any = {};
  constructor(private http: HttpClient, private msg: NzMessageService) {}
  ngOnInit(): void {
    this.http.get<any>('admin/v1/config/index').subscribe({
      next: (res) => {
        this.loading = false;
        if (res.state === 0 && res.data) {
          for (const [k, v] of Object.entries(res.data)) this.config[k] = (v as any).value;
        }
      },
      error: () => { this.loading = false; }
    });
  }
  onSave(): void {
    this.http.post<any>('admin/v1/config/save', { items: this.config }).subscribe({
      next: (res) => { if (res.state === 0) this.msg.success('已保存'); else this.msg.error(res.msg); }
    });
  }
}

@Component({
  standalone: false,
  selector: 'app-admin-audit-log', 
  template: `
    <nz-card nzTitle="审计日志">
      <nz-table #table [nzData]="list" [nzLoading]="loading" [nzPageIndex]="page" [nzPageSize]="pageSize"
        [nzTotal]="total" (nzPageIndexChange)="onPage($event)" nzBordered>
        <thead><tr><th>操作人</th><th>模块</th><th>操作</th><th>备注</th><th>IP</th><th>时间</th></tr></thead>
        <tbody>
          @for (row of list; track row.ul_id) {
            <tr>
              <td>{{ row.operator_account }}</td><td>{{ row.ul_module }}</td>
              <td>{{ row.ul_controller }}/{{ row.ul_action }}</td>
              <td>{{ row.ul_remark }}</td><td>{{ row.ul_ip }}</td>
              <td>{{ row.ul_create_time * 1000 | date:'yyyy-MM-dd HH:mm:ss' }}</td>
            </tr>
          }
        </tbody>
      </nz-table>
    </nz-card>
  `
})
export class AdminAuditLogComponent implements OnInit {
  list: any[] = []; loading = false; page = 1; pageSize = 20; total = 0;
  constructor(private http: HttpClient) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.http.get<any>('admin/v1/audit-log/index', { params: { p: this.page, num: this.pageSize } as any }).subscribe({
      next: (res) => { this.loading = false; if (res.state === 0) { this.list = res.data || []; this.total = res.msg?.total || 0; } },
      error: () => { this.loading = false; }
    });
  }
  onPage(p: number): void { this.page = p; this.load(); }
}
