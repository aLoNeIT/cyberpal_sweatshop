import { Component, OnInit } from '@angular/core';
import { UserApiService } from '../../services/user-api.service';
import { Session } from '../../models/user.model';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-user-sessions',
  template: `
    <div class="sessions-page">
      <h2 class="page-title">会话历史</h2>
      <nz-table #table [nzData]="sessions" [nzLoading]="loading" [nzFrontPagination]="false"
        [nzTotal]="total" [nzPageIndex]="page" [nzPageSize]="pageSize" (nzPageIndexChange)="onPageChange($event)">
        <thead>
          <tr>
            <th>标题</th>
            <th>Agent</th>
            <th>消息数</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let s of sessions">
            <td>
              <a (click)="viewSession(s)" class="session-link">{{ s.title || '未命名会话' }}</a>
            </td>
            <td>{{ s.agent_name || '-' }}</td>
            <td>{{ s.message_count }}</td>
            <td>
              <nz-tag [nzColor]="s.status === 'active' ? 'green' : s.status === 'archived' ? 'orange' : 'default'">
                {{ s.status === 'active' ? '活跃' : s.status === 'archived' ? '已归档' : '已完成' }}
              </nz-tag>
            </td>
            <td>{{ s.created_at | date:'yyyy-MM-dd HH:mm' }}</td>
            <td>
              <a nz-popconfirm nzPopconfirmTitle="确定删除？" (nzOnConfirm)="deleteSession(s)">删除</a>
            </td>
          </tr>
        </tbody>
      </nz-table>
      <nz-empty *ngIf="!loading && sessions.length === 0" nzNotFoundContent="暂无会话记录"></nz-empty>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 24px;
      color: #1a1a2e;
    }
    .session-link {
      color: #667eea;
      cursor: pointer;
    }
    .session-link:hover {
      text-decoration: underline;
    }
  `]
})
export class UserSessionsComponent implements OnInit {
  sessions: Session[] = [];
  loading = true;
  page = 1;
  pageSize = 20;
  total = 0;

  constructor(private api: UserApiService, private router: Router, private msg: NzMessageService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.api.getSessionHistory(this.page, this.pageSize).subscribe({
      next: res => {
        this.sessions = res.items;
        this.total = res.total;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadSessions();
  }

  viewSession(session: Session): void {
    this.router.navigate(['/user/chat', session.id]);
  }

  deleteSession(session: Session): void {
    this.api.deleteSession(session.id).subscribe({
      next: () => {
        this.msg.success('已删除');
        this.loadSessions();
      },
      error: (err) => this.msg.error(err.message || '删除失败')
    });
  }
}
