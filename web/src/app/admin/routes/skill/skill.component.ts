import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AdminCrudService } from '@core';

@Component({
  standalone: false,
  selector: 'app-admin-skill', 
  template: `
    <nz-card nzTitle="Skill 库">
      <div style="margin-bottom:16px"><button nz-button nzType="primary" (click)="msg.info('功能开发中')">新增 Skill</button></div>
      <nz-table #table [nzData]="list" [nzLoading]="loading" nzBordered>
        <thead><tr><th>名称</th><th>分类</th><th>路径</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          @for (row of list; track row.id) {
            <tr>
              <td>{{ row.name }}</td><td>{{ row.category }}</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">{{ row.path }}</td>
              <td><nz-tag [nzColor]="row.enabled === 1 ? 'green' : 'red'">{{ row.enabled === 1 ? '启用' : '禁用' }}</nz-tag></td>
              <td>
                <button nz-button nzSize="small" (click)="msg.info('功能开发中')">编辑</button>
                <button nz-button nzSize="small" nzDanger (click)="onDelete(row)" style="margin-left:8px">删除</button>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>
    </nz-card>
  `
})
export class AdminSkillComponent implements OnInit {
  list: any[] = []; loading = false; msg: NzMessageService;
  constructor(private crud: AdminCrudService, msg: NzMessageService) { this.msg = msg; }
  ngOnInit(): void {
    this.loading = true;
    this.crud.list('skill', { p: 1, num: 999 }).subscribe({
      next: (res) => { this.loading = false; if (res.state === 0) this.list = res.data || []; },
      error: () => { this.loading = false; }
    });
  }
  onDelete(row: any): void {
    this.crud.delete('skill', row.id).subscribe({
      next: (res) => { if (res.state === 0) { this.msg.success('OK'); this.ngOnInit(); } else this.msg.error(res.msg); }
    });
  }
}

@Component({
  standalone: false,
  selector: 'app-admin-mcp-template', 
  template: `
    <nz-card nzTitle="MCP 模板">
      <div style="margin-bottom:16px"><button nz-button nzType="primary" (click)="msg.info('功能开发中')">新增模板</button></div>
      <nz-table #table [nzData]="list" [nzLoading]="loading" nzBordered>
        <thead><tr><th>名称</th><th>传输</th><th>命令</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          @for (row of list; track row.id) {
            <tr>
              <td>{{ row.name }}</td><td>{{ row.transport }}</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">{{ row.command }}</td>
              <td><nz-tag [nzColor]="row.enabled === 1 ? 'green' : 'red'">{{ row.enabled === 1 ? '启用' : '禁用' }}</nz-tag></td>
              <td>
                <button nz-button nzSize="small" (click)="msg.info('功能开发中')">编辑</button>
                <button nz-button nzSize="small" nzDanger (click)="onDelete(row)" style="margin-left:8px">删除</button>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>
    </nz-card>
  `
})
export class AdminMcpTemplateComponent implements OnInit {
  list: any[] = []; loading = false; msg: NzMessageService;
  constructor(private crud: AdminCrudService, msg: NzMessageService) { this.msg = msg; }
  ngOnInit(): void {
    this.loading = true;
    this.crud.list('mcp-template', { p: 1, num: 999 }).subscribe({
      next: (res) => { this.loading = false; if (res.state === 0) this.list = res.data || []; },
      error: () => { this.loading = false; }
    });
  }
  onDelete(row: any): void {
    this.crud.delete('mcp-template', row.id).subscribe({
      next: (res) => { if (res.state === 0) { this.msg.success('OK'); this.ngOnInit(); } else this.msg.error(res.msg); }
    });
  }
}
