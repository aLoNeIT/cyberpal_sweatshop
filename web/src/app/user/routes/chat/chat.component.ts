import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserApiService } from '../../services/user-api.service';
import { UserAuthService } from '../../services/user-auth.service';
import { Message } from '../../models/user.model';

@Component({
  standalone: false,
  selector: 'app-user-chat',
  template: `
    <div class="chat-page">
      <h2 class="page-title">会话详情</h2>
      <div class="chat-container">
        <div class="chat-messages" #msgContainer>
          <div *ngFor="let msg of messages" class="chat-msg" [class.user-msg]="msg.role === 'user'"
            [class.assistant-msg]="msg.role === 'assistant'">
            <div class="msg-role">{{ msg.role === 'user' ? '你' : 'AI' }}</div>
            <div class="msg-content">{{ msg.content }}</div>
          </div>
          <div *ngIf="streaming" class="chat-msg assistant-msg">
            <div class="msg-role">AI</div>
            <div class="msg-content">{{ streamingContent }}<span class="cursor">▌</span></div>
          </div>
        </div>
        <div class="chat-input">
          <nz-input-group [nzSuffix]="sendBtn">
            <input nz-input [(ngModel)]="inputText" placeholder="输入消息..." (keyup.enter)="send()"
              [disabled]="streaming" />
            <ng-template #sendBtn>
              <button nz-button nzType="primary" (click)="send()" [nzLoading]="streaming" nzSize="small">
                发送
              </button>
            </ng-template>
          </nz-input-group>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #1a1a2e;
    }
    .chat-container {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    .chat-messages {
      padding: 24px;
      min-height: 400px;
      max-height: 500px;
      overflow-y: auto;
    }
    .chat-msg {
      margin-bottom: 16px;
      padding: 12px 16px;
      border-radius: 8px;
    }
    .user-msg {
      background: #f0f5ff;
    }
    .assistant-msg {
      background: #f6ffed;
    }
    .msg-role {
      font-size: 12px;
      font-weight: 600;
      color: #888;
      margin-bottom: 4px;
    }
    .msg-content {
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .chat-input {
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
    }
    .cursor {
      animation: blink 1s infinite;
    }
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
  `]
})
export class UserChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('msgContainer') msgContainer!: ElementRef;
  sessionId!: number;
  messages: Message[] = [];
  inputText = '';
  streaming = false;
  streamingContent = '';

  constructor(
    private route: ActivatedRoute,
    private api: UserApiService,
    private authService: UserAuthService
  ) {}

  ngOnInit(): void {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMessages();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadMessages(): void {
    this.api.getSessionDetail(this.sessionId).subscribe({
      next: res => { this.messages = res.messages || []; },
      error: () => {}
    });
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text || this.streaming) return;

    this.messages.push({ id: 0, session_id: this.sessionId, role: 'user', content: text, created_at: new Date().toISOString() });
    this.inputText = '';
    this.streaming = true;
    this.streamingContent = '';

    const token = this.authService.token;
    const url = `/api/chat/stream?session_id=${this.sessionId}&_token=${token}&message=${encodeURIComponent(text)}`;

    const evtSource = new EventSource(url);
    evtSource.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.content) {
          this.streamingContent += data.content;
        }
        if (data.done) {
          evtSource.close();
          this.messages.push({ id: 0, session_id: this.sessionId, role: 'assistant', content: this.streamingContent, created_at: new Date().toISOString() });
          this.streaming = false;
          this.streamingContent = '';
        }
      } catch {
        this.streamingContent += evt.data;
      }
    };
    evtSource.onerror = () => {
      evtSource.close();
      if (this.streamingContent) {
        this.messages.push({ id: 0, session_id: this.sessionId, role: 'assistant', content: this.streamingContent, created_at: new Date().toISOString() });
      }
      this.streaming = false;
      this.streamingContent = '';
    };
  }

  private scrollToBottom(): void {
    try {
      const el = this.msgContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
