/**
 * SSE 聊天 API
 *
 * 返回原生 EventSource 实例，由调用方注册事件监听。
 * 事件类型对齐架构 §8.4：delta / thinking / tool_start / tool_end / tool_exec / usage / done / error / close
 */
export function createChatSSE(
  sessionId: string,
  message: string,
): EventSource {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({ session_id: sessionId, message });
  const url = `/api/chat/stream?${params.toString()}`;

  // EventSource 不支持自定义 headers，故将 token 拼入 query（后端中间件应支持此方式或通过 cookie）
  // 备用方案：若后端不支持 query token，则前端使用 fetch + ReadableStream
  const urlWithAuth = `${url}&_token=${encodeURIComponent(token ?? '')}`;
  return new EventSource(urlWithAuth);
}
