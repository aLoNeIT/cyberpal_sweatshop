import request from './request';

export const agentsApi = {
  getAgents: (params?: any) =>
    request.get('/agents', { params }).then((r) => r.data),

  createAgent: (data: any) =>
    request.post('/agents', data).then((r) => r.data),

  getAgent: (id: string) =>
    request.get(`/agents/${id}`).then((r) => r.data),

  updateAgent: (id: string, data: any) =>
    request.put(`/agents/${id}`, data).then((r) => r.data),

  deleteAgent: (id: string) =>
    request.delete(`/agents/${id}`).then((r) => r.data),
};
