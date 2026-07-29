import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserApiService } from '../../services/user-api.service';
import { UserAuthService } from '../../services/user-auth.service';
import { Message, Session } from '../../models/user.model';
import { NzMessageService } from 'ng-zorro-antd/message';

interface ChatSession {
  id: number;
  title: string;
  time: string;
}

@Component({
  standalone: false,
  selector: 'app-user-chat',
  template: `
    <div class="chat-layout" style="margin:-24px;height:calc(100vh - 56px);">
      <!-- 左侧会话列表 -->
      <div class="chat-sidebar" [class.open]="sidebarOpen">
        <div class="chat-sidebar-header">
          <h3>会话</h3>
          <button class="btn btn-primary btn-sm" (click)="newChat()">
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> 新建
          </button>
        </div>
        <div class="chat-session-list">
          <div class="chat-session-item" *ngFor="let s of sessions; let i = index"
               [class.active]="s.id === sessionId"
               (click)="switchSession(s)">
            <div class="session-title">{{ s.title }}</div>
            <div class="session-time">{{ s.time }}</div>
          </div>
          <div class="empty-state" *ngIf="sessions.length === 0" style="padding:24px">
            <p style="color:var(--cp-text-tertiary);font-size:13px">暂无会话</p>
          </div>
        </div>
      </div>

      <!-- 移动端遮罩 -->
      <div class="sidebar-overlay" [class.show]="sidebarOpen" (click)="sidebarOpen = false"></div>

      <!-- 主聊天区 -->
      <div class="chat-main">
        <!-- 顶栏 -->
        <div class="chat-topbar">
          <button class="menu-trigger" (click)="sidebarOpen = !sidebarOpen">
            <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div class="agent-selector" *ngIf="sessionId">
            <span class="agent-dot"></span>
            <select [(ngModel)]="selectedAgent" (change)="onAgentChange()">
              <option value="">默认助手</option>
              <option value="code-review">代码审查专家</option>
              <option value="data-analyst">数据分析师</option>
              <option value="doc-assistant">文档助手</option>
            </select>
          </div>
        </div>

        <!-- 消息区 -->
        <div class="chat-messages" #msgContainer>
          <!-- 空状态 -->
          <div class="chat-empty" *ngIf="messages.length === 0 && !streaming && !sessionId">
            <div class="chat-empty-icon">
              <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>开始新对话</h3>
            <p>选择一个 Agent 或直接输入消息开始对话</p>
          </div>

          <!-- 消息列表 -->
          <ng-container *ngFor="let msg of messages">
            <div class="message" [class.user]="msg.role === 'user'" [class.assistant]="msg.role === 'assistant'">
              <div class="message-avatar">{{ msg.role === 'user' ? userInitial : 'AI' }}</div>
              <div class="message-content" [innerHTML]="renderContent(msg.content)"></div>
            </div>
          </ng-container>

          <!-- Streaming -->
          <div class="message assistant streaming" *ngIf="streaming" id="streamingMsg">
            <div class="message-avatar">AI</div>
            <div class="message-content" id="streamingContent">{{ streamingContent }}<span class="cursor-blink" *ngIf="streaming">▍</span></div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="chat-input-area">
          <div class="chat-toolbar">
            <span class="agent-label" *ngIf="selectedAgent">
              <span class="agent-dot" style="width:7px;height:7px;border-radius:50%;background:var(--cp-primary)"></span>
              {{ selectedAgent || '默认助手' }}
            </span>
            <span class="agent-label" *ngIf="!selectedAgent">
              <span class="agent-dot" style="width:7px;height:7px;border-radius:50%;background:var(--cp-primary)"></span>
              默认助手
            </span>
            <span class="token-count">Tokens: {{ tokenCount }}</span>
          </div>
          <div class="chat-input-wrap">
            <textarea class="chat-input" #chatInput
              [(ngModel)]="inputText"
              placeholder="输入消息，Enter 发送，Shift+Enter 换行..."
              rows="1"
              (input)="onInput()"
              (keydown)="onKeydown($event)"
              [disabled]="streaming"></textarea>
            <button class="chat-send-btn" (click)="send()" [disabled]="streaming || !inputText.trim()">
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --cp-primary: #1677ff; --cp-primary-subtle: #e6f4ff; --cp-primary-hover: #4096ff;
      --cp-success: #16A34A; --cp-success-bg: rgba(22,163,74,.12);
      --cp-warning: #D97706; --cp-danger: #DC2626;
      --cp-surface: #FFFFFF; --cp-surface-2: #fafafa; --cp-border: #f0f0f0;
      --cp-text: #111827; --cp-text-secondary: #6b7280; --cp-text-tertiary: #9ca3af;
      --cp-radius-md: 8px; --cp-radius-lg: 12px; --cp-radius-pill: 999px;
      --cp-shadow-sm: 0 1px 2px rgba(0,0,0,.06);
      --cp-font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      --cp-transition-fast: 150ms ease;
    }

    .chat-layout { display: flex; background: var(--cp-surface); }
    .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 40; }

    /* Sidebar */
    .chat-sidebar {
      width: 280px; border-right: 1px solid var(--cp-border);
      display: flex; flex-direction: column;
      background: var(--cp-surface-2); flex-shrink: 0;
      transition: transform 300ms ease;
    }
    .chat-sidebar-header {
      padding: 16px; border-bottom: 1px solid var(--cp-border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .chat-sidebar-header h3 { font-size: 16px; font-weight: 600; color: var(--cp-text); }
    .chat-session-list { flex: 1; overflow-y: auto; padding: 8px; }
    .chat-session-item {
      padding: 12px; border-radius: var(--cp-radius-md); cursor: pointer;
      transition: all var(--cp-transition-fast); margin-bottom: 2px;
    }
    .chat-session-item:hover { background: var(--cp-surface); }
    .chat-session-item.active { background: var(--cp-primary-subtle); }
    .chat-session-item.active .session-title { color: var(--cp-primary); font-weight: 500; }
    .session-title { font-size: 14px; color: var(--cp-text); margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .session-time { font-size: 12px; color: var(--cp-text-tertiary); font-family: var(--cp-font-mono); }

    /* Main */
    .chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

    /* Topbar */
    .chat-topbar {
      height: 49px; border-bottom: 1px solid var(--cp-border);
      display: flex; align-items: center; padding: 0 16px; gap: 12px;
      flex-shrink: 0;
    }
    .menu-trigger {
      display: none; width: 36px; height: 36px;
      border: 1px solid var(--cp-border); border-radius: var(--cp-radius-md);
      background: var(--cp-surface); cursor: pointer;
      align-items: center; justify-content: center;
      color: var(--cp-text-secondary);
    }
    .agent-selector {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 12px; border: 1px solid var(--cp-border);
      border-radius: var(--cp-radius-md); background: var(--cp-surface-2);
      cursor: pointer; font-size: 13px; color: var(--cp-text);
      transition: all var(--cp-transition-fast);
    }
    .agent-selector:hover { border-color: var(--cp-primary); }
    .agent-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--cp-primary); flex-shrink: 0; }
    .agent-selector select {
      border: none; background: transparent; font-size: 13px;
      color: var(--cp-text); cursor: pointer; outline: none;
      font-family: inherit;
    }

    /* Messages */
    .chat-messages { flex: 1; overflow-y: auto; padding: 16px 24px; }
    .chat-empty { text-align: center; padding: 80px 24px; }
    .chat-empty-icon { width: 64px; height: 64px; margin: 0 auto 16px; background: var(--cp-surface-2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--cp-text-tertiary); }
    .chat-empty-icon svg { width: 32px; height: 32px; }
    .chat-empty h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
    .chat-empty p { font-size: 14px; color: var(--cp-text-secondary); }

    .message {
      display: flex; gap: 12px; margin-bottom: 24px;
    }
    .message.user { flex-direction: row-reverse; }
    .message-avatar {
      width: 36px; height: 36px; border-radius: var(--cp-radius-pill);
      display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 14px; flex-shrink: 0;
    }
    .message.user .message-avatar { background: var(--cp-primary); color: #fff; }
    .message.assistant .message-avatar { background: var(--cp-surface-2); color: var(--cp-text-secondary); border: 1px solid var(--cp-border); }
    .message-content {
      max-width: 75%; padding: 12px 16px; border-radius: var(--cp-radius-lg);
      font-size: 14px; line-height: 1.7; word-break: break-word;
    }
    .message.user .message-content { background: var(--cp-primary); color: #fff; border-radius: var(--cp-radius-lg) 4px var(--cp-radius-lg) var(--cp-radius-lg); }
    .message.assistant .message-content { background: var(--cp-surface); border: 1px solid var(--cp-border); }
    .streaming .message-content { border-color: var(--cp-primary); box-shadow: 0 0 0 1px rgba(22,119,255,.15); }

    /* Code blocks in messages */
    .message-content pre {
      background: #1e1e1e; color: #d4d4d4; padding: 12px 16px;
      border-radius: var(--cp-radius-md); overflow-x: auto;
      font-family: var(--cp-font-mono); font-size: 13px; line-height: 1.5;
      margin: 8px 0;
    }
    .message-content code { font-family: var(--cp-font-mono); font-size: 13px; }
    .message-content p { margin-bottom: 8px; }
    .message-content p:last-child { margin-bottom: 0; }
    .message-content ul, .message-content ol { padding-left: 20px; margin: 8px 0; }
    .message-content li { margin-bottom: 4px; }

    /* Thinking block */
    .thinking-block {
      margin: 8px 0; border: 1px solid var(--cp-border); border-radius: var(--cp-radius-md);
      overflow: hidden; background: var(--cp-surface-2);
    }
    .thinking-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; cursor: pointer; user-select: none;
      font-size: 13px; color: var(--cp-text-secondary);
      transition: background var(--cp-transition-fast);
    }
    .thinking-header:hover { background: var(--cp-border); }
    .thinking-arrow { font-size: 10px; transition: transform var(--cp-transition-fast); }
    .thinking-block.open .thinking-arrow { transform: rotate(90deg); }
    .thinking-body {
      display: none; padding: 12px 14px; border-top: 1px solid var(--cp-border);
      font-size: 13px; color: var(--cp-text-secondary); white-space: pre-wrap;
      background: var(--cp-surface); line-height: 1.6;
    }
    .thinking-block.open .thinking-body { display: block; }

    /* Tool block */
    .tool-block {
      margin: 8px 0; border: 1px solid var(--cp-border); border-radius: var(--cp-radius-md);
      overflow: hidden; background: var(--cp-surface-2);
    }
    .tool-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; cursor: pointer; user-select: none;
      font-size: 13px; color: var(--cp-text-secondary);
      transition: background var(--cp-transition-fast);
    }
    .tool-header:hover { background: var(--cp-border); }
    .tool-block.open .thinking-arrow { transform: rotate(90deg); }
    .tool-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 1px 7px; font-size: 11px; font-weight: 500;
      border-radius: var(--cp-radius-pill);
      background: var(--cp-success-bg); color: var(--cp-success);
    }
    .tool-body {
      display: none; padding: 12px 14px; border-top: 1px solid var(--cp-border);
      font-size: 13px; color: var(--cp-text-secondary); white-space: pre-wrap;
      background: var(--cp-surface); font-family: var(--cp-font-mono);
      line-height: 1.6; overflow-x: auto;
    }
    .tool-block.open .tool-body { display: block; }

    /* Cursor */
    .cursor-blink { animation: blink 1s infinite; color: var(--cp-primary); }
    @keyframes blink { 0%,50% { opacity: 1; } 51%,100% { opacity: 0; } }

    /* Input */
    .chat-input-area { border-top: 1px solid var(--cp-border); padding: 12px 24px 16px; flex-shrink: 0; }
    .chat-toolbar { display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; font-size: 12px; }
    .agent-label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--cp-text-secondary); }
    .token-count { font-family: var(--cp-font-mono); font-size: 12px; color: var(--cp-text-tertiary); }
    .chat-input-wrap {
      display: flex; align-items: flex-end; gap: 8px;
      border: 1px solid var(--cp-border); border-radius: var(--cp-radius-lg);
      padding: 8px 12px; background: var(--cp-surface);
      transition: border-color var(--cp-transition-fast);
    }
    .chat-input-wrap:focus-within { border-color: var(--cp-primary); box-shadow: 0 0 0 2px rgba(22,119,255,.15); }
    .chat-input {
      flex: 1; border: none; outline: none; resize: none;
      font-size: 14px; line-height: 1.6; font-family: inherit;
      color: var(--cp-text); background: transparent;
      min-height: 24px; max-height: 160px;
    }
    .chat-input::placeholder { color: var(--cp-text-tertiary); }
    .chat-send-btn {
      width: 36px; height: 36px; border: none; border-radius: var(--cp-radius-md);
      background: var(--cp-primary); color: #fff; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all var(--cp-transition-fast); flex-shrink: 0;
    }
    .chat-send-btn:hover:not(:disabled) { background: var(--cp-primary-hover); }
    .chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Buttons */
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 16px; font-size: 14px; font-weight: 500; border-radius: var(--cp-radius-md); border: 1px solid transparent; cursor: pointer; transition: all var(--cp-transition-fast); user-select: none; white-space: nowrap; text-decoration: none; font-family: inherit; }
    .btn-sm { height: 28px; padding: 0 10px; font-size: 13px; }
    .btn-primary { background: var(--cp-primary); color: #fff; border-color: var(--cp-primary); }
    .btn-primary:hover { background: var(--cp-primary-hover); }

    /* Responsive */
    @media (max-width: 1279px) {
      .chat-sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 50; transform: translateX(-100%); }
      .chat-sidebar.open { transform: translateX(0); }
      .menu-trigger { display: flex; }
      .sidebar-overlay.show { display: block; }
    }
  `]
})
export class UserChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('msgContainer') msgContainer!: ElementRef;
  @ViewChild('chatInput') chatInputEl!: ElementRef;

  sessionId: number | null = null;
  messages: Message[] = [];
  sessions: ChatSession[] = [
    { id: 1, title: 'CSV 批量处理脚本开发', time: '5分钟前' },
    { id: 2, title: 'React 组件性能优化方案讨论', time: '23分钟前' },
    { id: 3, title: 'API 接口设计评审', time: '1小时前' },
    { id: 4, title: '数据库查询优化：索引策略分析', time: '2小时前' },
    { id: 5, title: 'Kubernetes 集群部署问题排查', time: '3小时前' },
    { id: 6, title: '日志系统架构设计讨论', time: '昨天 14:30' },
    { id: 7, title: '单元测试覆盖率提升方案', time: '昨天 10:15' },
    { id: 8, title: 'Git 工作流最佳实践', time: '前天 16:45' },
    { id: 9, title: '微服务通信协议选型：gRPC vs REST', time: '前天 09:20' },
    { id: 10, title: '前端状态管理方案调研', time: '3天前' }
  ];

  inputText = '';
  streaming = false;
  streamingContent = '';
  selectedAgent = '默认助手';
  tokenCount = 0;
  sidebarOpen = false;
  userInitial = 'U';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: UserApiService,
    private authService: UserAuthService,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user?.display_name) this.userInitial = user.display_name.charAt(0);
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.sessionId = Number(id);
      this.loadMessages();
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadMessages(): void {
    if (!this.sessionId) return;
    this.api.getSessionDetail(this.sessionId).subscribe({
      next: res => { this.messages = res.messages || []; },
      error: () => {}
    });
  }

  switchSession(s: ChatSession): void {
    this.sessionId = s.id;
    this.router.navigate(['/user/chat', s.id]);
    this.loadMessages();
    this.sidebarOpen = false;
  }

  newChat(): void {
    this.sessionId = null;
    this.messages = [];
    this.inputText = '';
    this.streaming = false;
    this.streamingContent = '';
    this.router.navigate(['/user/chat']);
    this.msg.success('已创建新会话');
  }

  onInput(): void {
    const el = this.chatInputEl?.nativeElement;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
    this.tokenCount = Math.ceil(this.inputText.length / 2.5);
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text || this.streaming) return;

    this.messages.push({ id: 0, session_id: this.sessionId || 0, role: 'user', content: text, created_at: new Date().toISOString() });
    this.inputText = '';
    this.tokenCount = 0;

    // Reset textarea height
    setTimeout(() => {
      const el = this.chatInputEl?.nativeElement;
      if (el) el.style.height = 'auto';
    });

    // Create session if needed
    if (!this.sessionId) {
      this.sessionId = Date.now(); // Temporary ID
      this.sessions.unshift({ id: this.sessionId, title: text.substring(0, 30) + (text.length > 30 ? '...' : ''), time: '刚刚' });
    }

    this.streaming = true;
    this.streamingContent = '';

    // Simulate streaming response
    this.simulateStreaming(text);
  }

  private simulateStreaming(userText: string): void {
    const response = `收到你的消息。

这是一个模拟的流式输出响应，展示了 AI 逐字输出的效果。在实际环境中，这里会通过 SSE 或 WebSocket 实时推送 AI 的生成结果。

当前使用的模型会逐步生成每一个 token，带来更流畅的交互体验。`;
    let i = 0;
    const interval = setInterval(() => {
      if (i < response.length) {
        this.streamingContent += response.charAt(i);
        i++;
        setTimeout(() => this.scrollToBottom());
      } else {
        clearInterval(interval);
        this.messages.push({ id: 0, session_id: this.sessionId!, role: 'assistant', content: this.streamingContent, created_at: new Date().toISOString() });
        this.streaming = false;
        this.streamingContent = '';
      }
    }, 20);
  }

  renderContent(content: string): string {
    if (!content) return '';
    // Simple markdown-like rendering for code blocks
    return content
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  onAgentChange(): void {
    this.msg.info(`已切换至「${this.selectedAgent}」`);
  }

  private scrollToBottom(): void {
    try {
      const el = this.msgContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
