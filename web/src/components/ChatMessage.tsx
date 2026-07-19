import React from 'react';
import { Avatar, Tag } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import ThinkingBlock from './ThinkingBlock';
import ToolCallBlock from './ToolCallBlock';

interface ToolCall {
  call_id: string;
  name: string;
  params?: any;
  result?: any;
  success?: boolean;
  status: 'executing' | 'done';
}

interface Props {
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string | null;
  toolCalls?: ToolCall[];
  streaming?: boolean;
}

const ChatMessage: React.FC<Props> = ({ role, content, thinking, toolCalls, streaming }) => {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  if (role === 'system') {
    return (
      <div style={{ textAlign: 'center', padding: 8 }}>
        <Tag color="default" style={{ fontSize: 12 }}>{content}</Tag>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 12,
        marginBottom: 16,
        animation: 'slideIn 0.25s ease-out',
      }}
    >
      {/* Avatar */}
      <Avatar
        size={36}
        style={{
          flexShrink: 0,
          background: isUser ? 'var(--color-primary)' : 'var(--color-primary-subtle)',
          color: isUser ? '#fff' : 'var(--color-primary)',
        }}
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
      />

      {/* Bubble */}
      <div
        style={{
          maxWidth: '70%',
          minWidth: 60,
          padding: '12px 16px',
          borderRadius: 'var(--radius-lg)',
          borderBottomRightRadius: isUser ? 4 : undefined,
          borderBottomLeftRadius: isAssistant ? 4 : undefined,
          background: isUser ? 'var(--color-primary)' : 'var(--color-surface)',
          color: isUser ? '#fff' : 'var(--color-text)',
          border: isAssistant ? '1px solid var(--color-border)' : undefined,
          wordBreak: 'break-word',
          lineHeight: 1.7,
          fontSize: 14,
        }}
      >
        {/* Thinking block */}
        {thinking && (
          <div style={{ marginBottom: content ? 12 : 0 }}>
            <ThinkingBlock thinking={thinking} />
          </div>
        )}

        {/* Tool calls */}
        {toolCalls && toolCalls.length > 0 && (
          <div style={{ marginBottom: content ? 12 : 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {toolCalls.map((tc) => (
              <ToolCallBlock key={tc.call_id || tc.name} tool={tc} />
            ))}
          </div>
        )}

        {/* Content */}
        {content ? (
          <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
        ) : streaming ? (
          <span style={{ color: isUser ? 'rgba(255,255,255,0.6)' : 'var(--color-text-tertiary)' }}>
            •••
          </span>
        ) : (
          <span style={{ color: 'var(--color-text-tertiary)' }}>(空)</span>
        )}

        {/* Streaming cursor */}
        {streaming && isAssistant && (
          <span
            style={{
              display: 'inline',
              color: 'var(--color-primary)',
              fontWeight: 700,
              animation: 'blink 1s steps(1) infinite',
            }}
          >
            ▍
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
