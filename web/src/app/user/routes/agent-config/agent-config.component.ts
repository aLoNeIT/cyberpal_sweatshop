import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: false,
  selector: 'app-user-agent-config',
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1>{{ isEdit ? '编辑 Agent' : '创建 Agent' }}</h1>
        <p>{{ isEdit ? '修改 Agent 配置' : '配置一个新的 AI Agent' }}</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-secondary" routerLink="/user/agents">取消</button>
        <button class="btn btn-primary" (click)="save()">保存</button>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div class="two-col">
      <!-- Left: Basic Config -->
      <div class="card">
        <div class="card-header"><h3>基础配置</h3></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">名称 <span class="required">*</span></label>
            <input class="form-input" [(ngModel)]="agentName" placeholder="Agent 名称">
          </div>
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea class="form-textarea" [(ngModel)]="agentDesc" placeholder="描述 Agent 的功能和用途" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">图标</label>
            <div style="display:flex;gap:8px">
              <div class="icon-option" *ngFor="let icon of iconOptions" [class.selected]="selectedIcon === icon"
                   (click)="selectedIcon = icon">{{ icon }}</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">模型 Provider</label>
              <select class="form-select" [(ngModel)]="provider">
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">模型</label>
              <select class="form-select" [(ngModel)]="model">
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="deepseek-chat">DeepSeek Chat</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">System Prompt</label>
            <textarea class="form-textarea" [(ngModel)]="systemPrompt" placeholder="定义 Agent 的角色和行为..." rows="6"></textarea>
            <div class="form-hint">系统提示词定义了 Agent 的角色、能力和行为约束</div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Temperature</label>
              <input class="form-input" type="number" [(ngModel)]="temperature" min="0" max="2" step="0.1">
            </div>
            <div class="form-group">
              <label class="form-label">Max Tokens</label>
              <input class="form-input" type="number" [(ngModel)]="maxTokens" min="1" max="128000">
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Skills & MCP -->
      <div style="display:flex;flex-direction:column;gap:24px">
        <!-- Skills -->
        <div class="card">
          <div class="card-header">
            <h3>Skills</h3>
            <span style="font-size:13px;color:var(--cp-text-tertiary)">{{ selectedSkills.length }} 个已选</span>
          </div>
          <div class="card-body" style="max-height:300px;overflow-y:auto">
            <div class="skill-item" *ngFor="let skill of skills" [class.selected]="isSkillSelected(skill)"
                 (click)="toggleSkill(skill)">
              <div>
                <div class="skill-name">{{ skill.name }}</div>
                <div class="skill-desc">{{ skill.desc }}</div>
              </div>
              <span class="skill-check" *ngIf="isSkillSelected(skill)">✓</span>
            </div>
          </div>
        </div>

        <!-- Collaboration -->
        <div class="card">
          <div class="card-header"><h3>协作设置</h3></div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">协作模式</label>
              <div class="radio-group">
                <label class="radio-label" (click)="collabMode = 'solo'">
                  <span class="radio-dot" [class.active]="collabMode === 'solo'"></span>
                  <span>独立工作</span>
                </label>
                <label class="radio-label" (click)="collabMode = 'team'">
                  <span class="radio-dot" [class.active]="collabMode === 'team'"></span>
                  <span>团队协作</span>
                </label>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">可见性</label>
              <div class="radio-group">
                <label class="radio-label" (click)="visibility = 'private'">
                  <span class="radio-dot" [class.active]="visibility === 'private'"></span>
                  <span>仅自己</span>
                </label>
                <label class="radio-label" (click)="visibility = 'team'">
                  <span class="radio-dot" [class.active]="visibility === 'team'"></span>
                  <span>团队可见</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --cp-primary: #1677ff; --cp-primary-subtle: #e6f4ff;
      --cp-danger: #DC2626; --cp-surface: #FFFFFF; --cp-surface-2: #fafafa; --cp-border: #f0f0f0;
      --cp-text: #111827; --cp-text-secondary: #6b7280; --cp-text-tertiary: #9ca3af;
      --cp-radius-md: 8px; --cp-radius-lg: 12px; --cp-radius-pill: 999px;
      --cp-shadow-sm: 0 1px 2px rgba(0,0,0,.06);
      --cp-transition-fast: 150ms ease;
    }
    .page-header { margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
    .page-header-left h1 { font-size:20px; font-weight:600; color:var(--cp-text); margin-bottom:4px; }
    .page-header-left p { font-size:14px; color:var(--cp-text-secondary); }
    .page-header-right { display:flex; gap:8px; }

    .two-col { display:grid; grid-template-columns:1fr 360px; gap:24px; }
    @media (max-width:1024px) { .two-col { grid-template-columns:1fr; } }

    .card { background:var(--cp-surface); border-radius:var(--cp-radius-lg); border:1px solid var(--cp-border); box-shadow:var(--cp-shadow-sm); overflow:hidden; }
    .card-header { padding:16px 24px; border-bottom:1px solid var(--cp-border); display:flex; align-items:center; justify-content:space-between; }
    .card-header h3 { font-size:16px; font-weight:600; color:var(--cp-text); }
    .card-body { padding:24px; }

    .form-group { margin-bottom:20px; }
    .form-label { display:block; font-size:13px; font-weight:500; color:var(--cp-text-secondary); margin-bottom:6px; }
    .form-label .required { color:var(--cp-danger); }
    .form-input, .form-select { width:100%; height:36px; padding:0 12px; font-size:14px; color:var(--cp-text); background:var(--cp-surface); border:1px solid var(--cp-border); border-radius:var(--cp-radius-md); transition:all var(--cp-transition-fast); outline:none; font-family:inherit; }
    .form-input:focus, .form-select:focus { border-color:var(--cp-primary); box-shadow:0 0 0 2px rgba(22,119,255,.15); }
    .form-select { padding-right:32px; }
    .form-textarea { width:100%; min-height:80px; padding:8px 12px; font-size:14px; color:var(--cp-text); background:var(--cp-surface); border:1px solid var(--cp-border); border-radius:var(--cp-radius-md); resize:vertical; outline:none; font-family:inherit; line-height:1.6; }
    .form-textarea:focus { border-color:var(--cp-primary); box-shadow:0 0 0 2px rgba(22,119,255,.15); }
    .form-hint { font-size:12px; color:var(--cp-text-tertiary); margin-top:4px; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }

    .icon-option { width:44px; height:44px; border-radius:var(--cp-radius-md); border:2px solid var(--cp-border); display:flex; align-items:center; justify-content:center; font-size:20px; cursor:pointer; transition:all var(--cp-transition-fast); }
    .icon-option:hover { border-color:var(--cp-primary); }
    .icon-option.selected { border-color:var(--cp-primary); background:var(--cp-primary-subtle); }

    .skill-item { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-radius:var(--cp-radius-md); cursor:pointer; transition:all var(--cp-transition-fast); margin-bottom:4px; }
    .skill-item:hover { background:var(--cp-surface-2); }
    .skill-item.selected { background:var(--cp-primary-subtle); }
    .skill-name { font-size:14px; font-weight:500; color:var(--cp-text); }
    .skill-desc { font-size:12px; color:var(--cp-text-tertiary); margin-top:2px; }
    .skill-check { width:20px; height:20px; border-radius:50%; background:var(--cp-primary); color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; }

    .radio-group { display:flex; gap:16px; }
    .radio-label { display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; color:var(--cp-text); }
    .radio-dot { width:18px; height:18px; border-radius:50%; border:2px solid var(--cp-border); display:flex; align-items:center; justify-content:center; transition:all var(--cp-transition-fast); }
    .radio-dot.active { border-color:var(--cp-primary); }
    .radio-dot.active::after { content:''; width:8px; height:8px; border-radius:50%; background:var(--cp-primary); }

    .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; height:36px; padding:0 16px; font-size:14px; font-weight:500; border-radius:var(--cp-radius-md); border:1px solid transparent; cursor:pointer; transition:all var(--cp-transition-fast); user-select:none; white-space:nowrap; font-family:inherit; }
    .btn-primary { background:var(--cp-primary); color:#fff; border-color:var(--cp-primary); }
    .btn-primary:hover { background:#4096ff; }
    .btn-secondary { background:var(--cp-surface); color:var(--cp-text); border-color:var(--cp-border); }
    .btn-secondary:hover { color:var(--cp-primary); border-color:var(--cp-primary); }
  `]
})
export class UserAgentConfigComponent implements OnInit {
  isEdit = false;
  agentName = '';
  agentDesc = '';
  provider = 'openai';
  model = 'gpt-4o';
  systemPrompt = '';
  temperature = 0.7;
  maxTokens = 4096;
  selectedIcon = '🤖';
  iconOptions = ['🤖', '🧠', '💡', '🔍', '📊', '🎯', '🛡️', '✨'];
  selectedSkills: string[] = [];
  skills = [
    { id: '1', name: '代码审查', desc: '自动审查代码质量、安全漏洞' },
    { id: '2', name: '数据分析', desc: '智能分析数据，生成可视化报表' },
    { id: '3', name: '多语言翻译', desc: '支持 50+ 语言实时翻译' },
    { id: '4', name: '文档生成', desc: '自动生成 API 文档和用户手册' },
    { id: '5', name: '网络搜索', desc: '实时搜索互联网获取最新信息' }
  ];
  collabMode = 'solo';
  visibility = 'private';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.agentName = '示例 Agent';
      this.agentDesc = '这是一个示例 Agent 的描述';
    }
  }

  isSkillSelected(skill: any): boolean {
    return this.selectedSkills.includes(skill.id);
  }

  toggleSkill(skill: any): void {
    const idx = this.selectedSkills.indexOf(skill.id);
    if (idx === -1) this.selectedSkills.push(skill.id);
    else this.selectedSkills.splice(idx, 1);
  }

  save(): void {
    if (!this.agentName.trim()) {
      this.msg.warning('请输入 Agent 名称');
      return;
    }
    this.msg.success(this.isEdit ? 'Agent 已更新' : 'Agent 已创建');
    this.router.navigate(['/user/agents']);
  }
}
