import React, { useEffect, useReducer, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout, Button, Input, Space, Typography, Tag, Alert, Spin, Drawer,
  List, Tooltip, message,
} from 'antd';
import {
  SendOutlined, StopOutlined, MenuOutlined, PlusOutlined,
  RobotOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import ChatMessage from '../components/ChatMessage';
import StreamCursor from '../components/StreamCursor';
import { sessionsApi } from '../api/sessions';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Sider, Content } = Layout;

// ── Types ──

interface ToolCall {
  call_id: string;
  name: string;
  params?: any;
  result?: any;
  success?: boolean;
  status: 'executing' | 'done';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  toolCalls: ToolCall[];
}

interface ChatState {
  messages: Message[];
  streaming: boolean;
  sessionTitle: string;
  agentName: string;
  agentModel: string;
  usage: { input: number; output: number; cost: number };
}

type Action =
  | { type: 'SET_INIT'; messages: Message[]; title: string; agentName: string; agentModel: string }
  | { type: 'ADD_USER'; content: string }
  | { type: 'START_STREAM' }
  | { type: 'DELTA'; text: string }
  | { type: 'THINKING'; text: string }
  | { type: 'TOOL_START'; call_id: string; name: string }
  | { type: 'TOOL_END'; call_id: string; name: string; result?: any; success?: boolean }
  | { type: 'USAGE'; input: number; output: number; cost: number }
  | { type: 'DONE' }
  | { type: 'ERROR'; message: string }
  | { type: 'STOP' };

function chatReducer(state: ChatState, action: Action): ChatState {
  const msgs = [...state.messages];
  const last = msgs[msgs.length - 1];

  switch (action.type) {
    case 'SET_INIT':
      return {
        ...state,
        messages: action.messages,
        sessionTitle: action.title,
        agentName: action.agentName,
        agentModel: action.agentModel,
      };
    case 'ADD_USER':
      msgs.push({
        id: 'user-' + Date.now(),
        role: 'user',
        content: action.content,
        toolCalls: [],
      });
      msgs.push({
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: '',
        thinking: '',
        toolCalls: [],
      });
      return { ...state, messages: msgs };
    case 'START_STREAM':
      return { ...state, streaming: true };
    case 'DELTA':
      if (last && last.role === 'assistant') last.content += action.text;
      return { ...state, messages: msgs };
    case 'THINKING':
      if (last && last.role === 'assistant') last.thinking = (last.thinking ?? '') + action.text;
      return { ...state, messages: msgs };
    case 'TOOL_START': {
      if (last && last.role === 'assistant') {
        last.toolCalls.push({
          call_id: action.call_id,
          name: action.name,
          status: 'executing',
        });
      }
      return { ...state, messages: msgs };
    }
    case 'TOOL_END': {
      if (last && last.role === 'assistant') {
        const tc = last.toolCalls.find((t) => t.call_id === action.call_id || t.name === action.name);
        if (tc) {
          tc.status = 'done';
          tc.result = action.result;
          tc.success = action.success;
        }
      }
      return { ...state, messages: msgs };
    }
    case 'USAGE':
      return { ...state, usage: { input: action.input, output: action.output, cost: action.cost } };
    case 'DONE':
    case 'ERROR':
    case 'STOP':
      return { ...state, streaming: false };
    default:
      return state;
  }
}

function fmtTok(n: number): string {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

// ── Component ──

const Chat: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    streaming: false,
    sessionTitle: '',
    agentName: '',
    agentModel: '',
    usage: { input: 0, output: 0, cost: 0 },
  });

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.streaming]);

  // ── Load session ──
  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    sessionsApi
      .getDetail(sessionId)
      .then((res) => {
        const d = res.data;
        const msgs: Message[] = (d.messages ?? []).map((m: any) => ({
          id: String(m.id),
          role: m.role as 'user' | 'assistant',
          content: m.content ?? '',
          thinking: m.thinking ?? '',
          toolCalls: [],
        }));
        dispatch({
          type: 'SET_INIT',
          messages: msgs,
          title: d.session?.title ?? '',
          agentName: d.session?.agent_name ?? '',
          agentModel: '',
        });
        setAgentId(d.session?.agent_id ?? null);
        if (d.session?.agent_id) {
          sessionsApi.getSessions({ agent_id: d.session.agent_id, per_page: 50 }).then((r) => {
            setSessions(r.data?.items ?? []);
          }).catch(() => {});
        }
      })
      .catch(() => message.error('加载会话失败'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // ── Send ──
  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || state.streaming || !sessionId) return;
    setInputValue('');
    setErrorMsg(null);

    dispatch({ type: 'ADD_USER', content: text });

    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ session_id: sessionId, message: text });
    const url = `/api/chat/stream?${params.toString()}`;

    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: 'START_STREAM' });

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.message || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE frames: event: xxx\ndata: {...}\n\n
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const lines = part.split('\n');
          let eventType = '';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            else if (line.startsWith('data: ')) dataStr = line.slice(6);
          }

          if (!eventType || dataStr === undefined) continue;

          let data: any = {};
          try { data = JSON.parse(dataStr); } catch { /* skip malformed */ }

          switch (eventType) {
            case 'delta':
              dispatch({ type: 'DELTA', text: data.text ?? '' });
              break;
            case 'thinking':
              dispatch({ type: 'THINKING', text: data.text ?? '' });
              break;
            case 'tool_start':
              dispatch({ type: 'TOOL_START', call_id: data.call_id ?? '', name: data.name ?? '' });
              break;
            case 'tool_end':
              dispatch({
                type: 'TOOL_END',
                call_id: data.call_id ?? '',
                name: data.name ?? '',
                result: data.result,
                success: data.success,
              });
              break;
            case 'tool_exec':
              dispatch({ type: 'TOOL_START', call_id: data.call_id ?? '', name: data.name ?? '' });
              break;
            case 'usage':
              dispatch({
                type: 'USAGE',
                input: data.input ?? 0,
                output: data.output ?? 0,
                cost: data.cost ?? 0,
              });
              break;
            case 'done':
              dispatch({ type: 'DONE' });
              break;
            case 'error':
              setErrorMsg(data.message ?? '未知错误');
              dispatch({ type: 'ERROR', message: data.message ?? '未知错误' });
              break;
            case 'close':
              // stream end
              break;
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // user stopped
      } else {
        setErrorMsg(err.message ?? '连接异常');
        dispatch({ type: 'ERROR', message: err.message ?? '连接异常' });
      }
    } finally {
      dispatch({ type: 'STOP' });
      abortRef.current = null;
    }
  }, [inputValue, state.streaming, sessionId]);

  const handleStop = () => {
    abortRef.current?.abort();
    dispatch({ type: 'STOP' });
  };

  const handleNewSession = async () => {
    if (!agentId) return;
    try {
      const res = await sessionsApi.createSession(agentId);
      navigate(`/chat/${res.data.session.id}`);
    } catch {
      message.error('创建会话失败');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px - 48px)', margin: -24 }}>
      {/* ── Session Drawer (mobile: drawer, desktop: sidebar) ── */}
      <Drawer
        title="会话列表"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '8px 12px' }}>
          <Button block icon={<PlusOutlined />} onClick={handleNewSession}>新会话</Button>
        </div>
        <List
          dataSource={sessions}
          renderItem={(s: any) => (
            <List.Item
              onClick={() => { navigate(`/chat/${s.id}`); setDrawerOpen(false); }}
              style={{
                cursor: 'pointer',
                padding: '12px 16px',
                background: s.id === sessionId ? 'var(--color-primary-subtle)' : undefined,
                borderInlineEnd: s.id === sessionId ? '3px solid var(--color-primary)' : undefined,
              }}
            >
              <List.Item.Meta
                title={<Text ellipsis style={{ fontSize: 13 }}>{s.title ?? '会话'}</Text>}
                description={
                  <Space size={8}>
                    <Text type="secondary" style={{ fontSize: 11 }}>{s.message_count ?? 0} 消息</Text>
                    {s.status === 'active' && <Tag color="green" style={{ fontSize: 10 }}>活跃</Tag>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
        {/* ── Top bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            flexShrink: 0,
          }}
        >
          <Space>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{ display: 'block' }}
            />
            <Space size={4}>
              <RobotOutlined style={{ color: 'var(--color-primary)' }} />
              <Text strong>{state.agentName || 'Agent'}</Text>
              <Tag>{state.agentModel || '-'}</Tag>
            </Space>
          </Space>

          <Space size={16}>
            {state.usage.input > 0 || state.usage.output > 0 ? (
              <Space size={8}>
                <Tooltip title="本会话 Token">
                  <Tag icon={<ThunderboltOutlined />} color="blue">
                    in:{fmtTok(state.usage.input)} out:{fmtTok(state.usage.output)}
                  </Tag>
                </Tooltip>
                {state.usage.cost > 0 && (
                  <Tag color="orange">¥{state.usage.cost.toFixed(4)}</Tag>
                )}
              </Space>
            ) : null}
            {state.streaming && (
              <Button size="small" danger icon={<StopOutlined />} onClick={handleStop}>
                停止
              </Button>
            )}
          </Space>
        </div>

        {/* ── Messages ── */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px 24px',
            background: 'var(--color-bg)',
          }}
        >
          {errorMsg && (
            <Alert
              type="error"
              message={errorMsg}
              closable
              onClose={() => setErrorMsg(null)}
              style={{ marginBottom: 12 }}
            />
          )}

          {state.messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--color-text-tertiary)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
              <Text type="secondary">输入消息开始对话</Text>
            </div>
          ) : (
            state.messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                thinking={msg.thinking}
                toolCalls={msg.toolCalls}
                streaming={state.streaming && i === state.messages.length - 1 && msg.role === 'assistant'}
              />
            ))
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* ── Input ── */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            flexShrink: 0,
          }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="输入消息… (Enter 发送, Shift+Enter 换行)"
              rows={1}
              autoSize={{ minRows: 1, maxRows: 6 }}
              disabled={state.streaming}
              style={{ flex: 1, borderRadius: 'var(--radius-md)' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              loading={state.streaming}
              disabled={!inputValue.trim() || state.streaming}
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
