import request from './request';

export const sessionsApi = {
  getSessions: (params?: any) =>
    request.get('/sessions', { params }).then((r) => r.data),

  createSession: (agentId: string, title?: string) =>
    request.post('/sessions', { agent_id: agentId, title }).then((r) => r.data),

  getSession: (id: string) =>
    request.get(`/sessions/${id}`).then((r) => r.data),

  getDetail: (id: string) =>
    request.get(`/sessions/${id}/detail`).then((r) => r.data),

  resumeSession: (id: string, title?: string) =>
    request.post(`/sessions/${id}/resume`, { title }).then((r) => r.data),

  forkSession: (id: string, title?: string) =>
    request.post(`/sessions/${id}/fork`, { title }).then((r) => r.data),

  archiveSession: (id: string) =>
    request.post(`/sessions/${id}/archive`).then((r) => r.data),

  deleteSession: (id: string) =>
    request.delete(`/sessions/${id}`).then((r) => r.data),

  getHistory: (params?: any) =>
    request.get('/sessions/history', { params }).then((r) => r.data),
};
