import request from './request';

export const billingApi = {
  getSummary: (period?: string) =>
    request.get('/billing/summary', { params: { period } }).then((r) => r.data),

  getRecords: (params?: any) =>
    request.get('/billing/records', { params }).then((r) => r.data),
};
