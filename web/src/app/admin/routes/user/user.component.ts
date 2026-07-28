import { Component, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AdminCrudService } from '@core';

const PREFIX = 'user';

@Component({
  selector: 'app-admin-user',
  
  template: `
    <nz-card nzTitle="用户列表">
      <nz-table #table [nzData]="list" [nzLoading]="loading" [nzPageIndex]="page" [nzPageSize]="pageSize"
        [nzTotal]="total" [nzShowPagination]="true" (nzPageIndexChange)="onPage($event)" nzBordered>
        <thead>
          <tr>
            <th>账号</th><th>姓名</th><th>手机号</th><th>状态</th><th>登录次数</th><th>创建时间</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          @for (row of list; track row.usr_id) {
            <tr>
              <td>{{ row.usr_account }}</td>
              <td>{{ row.usr_real_name }}</td>
              <td>{{ row.usr_mp }}</td>
              <td><nz-tag [nzColor]="row.usr_state === 1 ? 'green' : 'red'">{{ row.usr_state === 1 ? '启用' : '禁用' }}</nz-tag></td>
              <td>{{ row.usr_login_num }}</td>
              <td>{{ row.usr_create_time * 1000 | date:'yyyy-MM-dd HH:mm' }}</td>
              <td>
                <button nz-button nzSize="small" (click)="onToggle(row)">{{ row.usr_state === 1 ? '禁用' : '启用' }}</button>
                <button nz-button nzSize="small" nzDanger (click)="onDelete(row)" style="margin-left:8px">删除</button>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>
    </nz-card>
  `,
  standalone: false
})
export class AdminUserComponent implements OnInit {
  list: any[] = [];
  loading = false;
  page = 1;
  pageSize = 20;
  total = 0;

  constructor(
    private crud: AdminCrudService,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.crud.list(PREFIX, { p: this.page, num: this.pageSize }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.state === 0) {
          this.list = res.data || [];
          this.total = typeof res.msg === 'object' ? (res.msg.total || 0) : 0;
        }
      },
      error: () => { this.loading = false; this.msg.error('加载失败'); }
    });
  }

  onPage(p: number): void { this.page = p; this.load(); }

  onToggle(row: any): void {
    const newState = row.usr_state === 1 ? 0 : 1;
    this.crud.toggleStatus(PREFIX, row.usr_id, newState).subscribe({
      next: (res) => {
        if (res.state === 0) { this.msg.success(res.msg || '操作成功'); this.load(); }
        else this.msg.error(res.msg || '操作失败');
      }
    });
  }

  onDelete(row: any): void {
    this.crud.delete(PREFIX, row.usr_id).subscribe({
      next: (res) => {
        if (res.state === 0) { this.msg.success('删除成功'); this.load(); }
        else this.msg.error(res.msg || '删除失败');
      }
    });
  }
}
