import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-admin-agent', 
  template: `
    <nz-card nzTitle="全局 Agent 管理">
      <nz-table #table [nzData]="list" [nzLoading]="loading" [nzPageIndex]="page" [nzPageSize]="pageSize"
        [nzTotal]="total" (nzPageIndexChange)="onPage($event)" nzBordered>
        <thead><tr><th>名称</th><th>Provider</th><th>Model</th><th>状态</th><th>所属用户</th><th>操作</th></tr></thead>
        <tbody>
          @for (row of list; track row.id) {
            <tr>
              <td>{{ row.name }}</td><td>{{ row.provider }}</td><td>{{ row.model }}</td>
              <td><nz-tag [nzColor]="row.status === 'online' ? 'green' : 'orange'">{{ row.status }}</nz-tag></td>
              <td>{{ row.user_account }}({{ row.user_name }})</td>
              <td><button nz-button nzSize="small" nzDanger (click)="onStop(row)">停止</button></td>
            </tr>
          }
        </tbody>
      </nz-table>
    </nz-card>
  `
})
export class AdminAgentComponent implements OnInit {
  list: any[] = []; loading = false; page = 1; pageSize = 20; total = 0;
  constructor(private http: HttpClient, private msg: NzMessageService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.http.get<any>('admin/v1/agent/index', { params: { p: this.page, num: this.pageSize } as any }).subscribe({
      next: (res) => { this.loading = false; if (res.state === 0) { this.list = res.data || []; this.total = res.msg?.total || 0; } },
      error: () => { this.loading = false; }
    });
  }
  onPage(p: number): void { this.page = p; this.load(); }
  onStop(row: any): void {
    this.http.post<any>(`admin/v1/agent/stop/${row.id}`, {}).subscribe({
      next: (res) => { if (res.state === 0) { this.msg.success('Agent 已停止'); this.load(); } else this.msg.error(res.msg); }
    });
  }
}

@Component({
  standalone: false,
  selector: 'app-admin-session', 
  template: `
    <nz-card nzTitle="全局会话管理">
      <nz-table #table [nzData]="list" [nzLoading]="loading" [nzPageIndex]="page" [nzPageSize]="pageSize"
        [nzTotal]="total" (nzPageIndexChange)="onPage($event)" nzBordered>
        <thead><tr><th>标题</th><th>Agent</th><th>状态</th><th>消息数</th><th>所属用户</th><th>操作</th></tr></thead>
        <tbody>
          @for (row of list; track row.id) {
            <tr>
              <td>{{ row.title }}</td><td>{{ row.agent_name }}</td>
              <td><nz-tag [nzColor]="row.status === 'active' ? 'green' : 'default'">{{ row.status }}</nz-tag></td>
              <td>{{ row.message_count }}</td><td>{{ row.user_account }}</td>
              <td><button nz-button nzSize="small" nzDanger (click)="onTerminate(row)">强制结束</button></td>
            </tr>
          }
        </tbody>
      </nz-table>
    </nz-card>
  `
})
export class AdminSessionComponent implements OnInit {
  list: any[] = []; loading = false; page = 1; pageSize = 20; total = 0;
  constructor(private http: HttpClient, private msg: NzMessageService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.http.get<any>('admin/v1/session-mgmt/index', { params: { p: this.page, num: this.pageSize } as any }).subscribe({
      next: (res) => { this.loading = false; if (res.state === 0) { this.list = res.data || []; this.total = res.msg?.total || 0; } },
      error: () => { this.loading = false; }
    });
  }
  onPage(p: number): void { this.page = p; this.load(); }
  onTerminate(row: any): void {
    this.http.post<any>(`admin/v1/session-mgmt/terminate/${row.id}`, {}).subscribe({
      next: (res) => { if (res.state === 0) { this.msg.success('OK'); this.load(); } else this.msg.error(res.msg); }
    });
  }
}
