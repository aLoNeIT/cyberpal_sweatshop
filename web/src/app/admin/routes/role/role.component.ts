import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AdminCrudService } from '@core';

const PREFIX = 'role';

@Component({
  standalone: false,
  selector: 'app-admin-role', 
  template: `
    <nz-card nzTitle="角色管理">
      <div style="margin-bottom:16px">
        <button nz-button nzType="primary" (click)="onAdd()">新增角色</button>
      </div>
      <nz-table #table [nzData]="list" [nzLoading]="loading" nzBordered>
        <thead><tr><th>角色名称</th><th>层级</th><th>系统角色</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          @for (row of list; track row.r_id) {
            <tr>
              <td>{{ row.r_name }}</td>
              <td><nz-tag>{{ row.r_level === 0 ? '超管' : row.r_level === 1 ? '运营' : '客服' }}</nz-tag></td>
              <td>{{ row.r_systemed === 1 ? '是' : '否' }}</td>
              <td><nz-tag [nzColor]="row.r_state === 1 ? 'green' : 'red'">{{ row.r_state === 1 ? '启用' : '禁用' }}</nz-tag></td>
              <td>
                <button nz-button nzSize="small" (click)="onEdit(row)">编辑</button>
                @if (row.r_systemed !== 1) {
                  <button nz-button nzSize="small" nzDanger (click)="onDelete(row)" style="margin-left:8px">删除</button>
                }
              </td>
            </tr>
          }
        </tbody>
      </nz-table>
    </nz-card>
  `
})
export class AdminRoleComponent implements OnInit {
  list: any[] = [];
  loading = false;
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
  onEdit(row: any): void { this.msg.info('功能开发中'); }
  onDelete(row: any): void {
    this.crud.delete(PREFIX, row.r_id).subscribe({
      next: (res) => { if (res.state === 0) { this.msg.success('删除成功'); this.load(); } else this.msg.error(res.msg || '删除失败'); }
    });
  }
}
