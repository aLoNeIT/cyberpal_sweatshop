import request from './request';

export const skillsApi = {
  getSkills: (params?: any) =>
    request.get('/skills', { params }).then((r) => r.data),

  getAgentSkills: (agentId: string) =>
    request.get(`/agents/${agentId}/skills`).then((r) => r.data),

  mountSkills: (agentId: string, skillIds: string[]) =>
    request.post(`/agents/${agentId}/skills`, { skill_ids: skillIds }).then((r) => r.data),
};
