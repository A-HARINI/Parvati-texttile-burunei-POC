import { apiClient } from './client.js';

export const orderService = {
  list: () => apiClient.get('/api/orders'),
  create: (body) => apiClient.post('/api/orders', body),
  update: (orderId, body) => apiClient.put(`/api/orders/${orderId}`, body),
  remove: (orderId) => apiClient.delete(`/api/orders/${orderId}`),
};
