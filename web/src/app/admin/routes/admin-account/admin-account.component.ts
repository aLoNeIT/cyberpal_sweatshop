import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AdminCrudService } from '@core';

const PREFIX = 'admin-account';

@Component({
  standalone: false,
  selector: 'app-admin-account', 
  template: `
    <nz-card nzTitle="管理员管理">
      <div style="margin-bottom:16px"><button nz-button nzType="primary" (click)="onAdd()">新增管理员</button></div>
      <nz-table #table [nzData]="list" [nzLoading]="loading" nzBordered>
        <thead><tr><th>账号</th><th>姓名</th><th>状态</th><th>登录时间</th><th>操作</th></tr></thead>
        <tbody>
          @for (row of list; track row.usr_id) {
            <tr>
              <td>{{ row.usr_account }}</td><td>{{ row.usr_real_name }}</td>
              <td><nz-tag [nzColor]="row.usr_state === 1 ? 'green' : 'red'">{{ row.usr_state === 1 ? '启用' : '禁用' }}</nz-tag></td>
              <td>{{ row.usr_login_time * 1000 | date:'yyyy-MM-dd HH:mm' }}</td>
              <td>
                <button nz-button nzSize="small" (click)="onToggle(row)">{{ row.usr_state === 1 ? '禁用' : '启用' }}</button>
                <button nz-button nzSize="small" nzDanger (click)="onDelete(row)" style="margin-left:8px">删除</button>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>
    </nz-card>
  `
})
export class AdminAccountComponent implements OnInit {
  list: any[] = []; loading = false;
  constructor(private crud: AdminCrudService, private msg: NzMessageService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.crud.list(PREFIX, { p: 1, num: 999 }).subscribe({
      next: (res) => { this.loading = false; if (res.state === 0) this.list = res.data || []; },
      error: () => { this.loading = false; }
    });
  }
  onAdd(): void { this.msg.info('功能开发中'); }
  onToggle(row: any): void {
    const ns = row.usr_state === 1 ? 0 : 1;
    this.crud.toggleStatus(PREFIX, row.usr_id, ns).subscribe({
      next: (res) => { if (res.state === 0) { this.msg.success(res.msg || 'OK'); this.load(); } else this.msg.error(res.msg); }
    });
  }
  onDelete(row: any): void {
    this.crud.delete(PREFIX, row.usr_id).subscribe({
      next: (res) => { if (res.state === 0) { this.msg.success('OK'); this.load(); } else this.msg.error(res.msg); }
    });
  }
}
