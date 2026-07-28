import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserApiService } from '../../services/user-api.service';
import { Agent } from '../../models/user.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-user-agents',
  template: `
    <div class="agents-page">
      <div class="page-header">
        <h2 class="page-title">Agent 管理</h2>
        <button nz-button nzType="primary" (click)="showCreateModal()">
          <span nz-icon nzType="plus"></span> 创建 Agent
        </button>
      </div>

      <nz-spin [nzSpinning]="loading">
        <nz-row [nzGutter]="16">
          <nz-col [nzXs]="24" [nzSm]="12" [nzLg]="8" *ngFor="let agent of agents">
            <nz-card [nzTitle]="agent.name" [nzExtra]="extraTpl" nzHoverable style="margin-bottom: 16px;">
              <p class="agent-desc">{{ agent.description || '暂无描述' }}</p>
              <nz-tag [nzColor]="agent.status === 'running' ? 'green' : agent.status === 'error' ? 'red' : 'default'">
                {{ agent.status === 'running' ? '运行中' : agent.status === 'error' ? '错误' : '已停止' }}
              </nz-tag>
              <nz-tag>{{ agent.model }}</nz-tag>
              <ng-template #extraTpl>
                <a (click)="deleteAgent(agent)" nz-popconfirm nzPopconfirmTitle="确定删除？" class="agent-action">
                  <span nz-icon nzType="delete" nzTheme="outline"></span>
                </a>
              </ng-template>
            </nz-card>
          </nz-col>
        </nz-row>
        <nz-empty *ngIf="!loading && agents.length === 0" nzNotFoundContent="暂无 Agent，点击上方按钮创建"></nz-empty>
      </nz-spin>

      <!-- 创建/编辑弹窗 -->
      <nz-modal [nzVisible]="modalVisible" [nzTitle]="editingAgent ? '编辑 Agent' : '创建 Agent'"
        (nzOnCancel)="modalVisible = false" (nzOnOk)="submitAgent()" [nzOkLoading]="submitting">
        <form nz-form [formGroup]="agentForm" *nzModalContent>
          <nz-form-item>
            <nz-form-label nzRequired>名称</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="name" placeholder="Agent 名称" />
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label>描述</nz-form-label>
            <nz-form-control>
              <textarea nz-input formControlName="description" rows="3" placeholder="描述信息"></textarea>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label nzRequired>模型</nz-form-label>
            <nz-form-control>
              <nz-select formControlName="model" nzPlaceHolder="选择模型">
                <nz-option nzValue="gpt-4o" nzLabel="GPT-4o"></nz-option>
                <nz-option nzValue="gpt-4o-mini" nzLabel="GPT-4o Mini"></nz-option>
                <nz-option nzValue="claude-3.5-sonnet" nzLabel="Claude 3.5 Sonnet"></nz-option>
                <nz-option nzValue="deepseek-v3" nzLabel="DeepSeek V3"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label>System Prompt</nz-form-label>
            <nz-form-control>
              <textarea nz-input formControlName="system_prompt" rows="4" placeholder="系统提示词"></textarea>
            </nz-form-control>
          </nz-form-item>
        </form>
      </nz-modal>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .page-title {
      font-size: 22px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0;
    }
    .agent-desc {
      color: #888;
      font-size: 13px;
      min-height: 40px;
    }
    .agent-action {
      color: #999;
      font-size: 16px;
    }
    .agent-action:hover {
      color: #ff4d4f;
    }
  `]
})
export class UserAgentsComponent implements OnInit {
  agents: Agent[] = [];
  loading = true;
  modalVisible = false;
  submitting = false;
  editingAgent: Agent | null = null;
  agentForm: FormGroup;

  constructor(
    private api: UserApiService,
    private fb: FormBuilder,
    private msg: NzMessageService
  ) {
    this.agentForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      model: ['gpt-4o', [Validators.required]],
      system_prompt: [''],
      provider: ['openai'],
      temperature: [0.7],
      max_tokens: [4096]
    });
  }

  ngOnInit(): void {
    this.loadAgents();
  }

  loadAgents(): void {
    this.loading = true;
    this.api.getAgents().subscribe({
      next: res => { this.agents = res.items; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  showCreateModal(): void {
    this.editingAgent = null;
    this.agentForm.reset({ model: 'gpt-4o', provider: 'openai', temperature: 0.7, max_tokens: 4096 });
    this.modalVisible = true;
  }

  submitAgent(): void {
    if (this.agentForm.invalid) return;
    this.submitting = true;
    const data = this.agentForm.value;
    const req = this.editingAgent
      ? this.api.updateAgent(this.editingAgent.id, data)
      : this.api.createAgent(data);

    req.subscribe({
      next: () => {
        this.submitting = false;
        this.modalVisible = false;
        this.msg.success(this.editingAgent ? '更新成功' : '创建成功');
        this.loadAgents();
      },
      error: (err) => {
        this.submitting = false;
        this.msg.error(err.message || '操作失败');
      }
    });
  }

  deleteAgent(agent: Agent): void {
    this.api.deleteAgent(agent.id).subscribe({
      next: () => {
        this.msg.success('已删除');
        this.loadAgents();
      },
      error: (err) => this.msg.error(err.message || '删除失败')
    });
  }
}
