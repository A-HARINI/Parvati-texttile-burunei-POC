import { apiClient } from './client.js';

export const reportService = {
  summary: () => apiClient.get('/api/reports/summary'),
};
