import request from './request';

export const mcpApi = {
  getMcp: (agentId: string) =>
    request.get(`/agents/${agentId}/mcp`).then((r) => r.data),

  createMcp: (agentId: string, data: any) =>
    request.post(`/agents/${agentId}/mcp`, data).then((r) => r.data),

  updateMcp: (agentId: string, mcpId: string, data: any) =>
    request.put(`/agents/${agentId}/mcp/${mcpId}`, data).then((r) => r.data),

  deleteMcp: (agentId: string, mcpId: string) =>
    request.delete(`/agents/${agentId}/mcp/${mcpId}`).then((r) => r.data),
};
