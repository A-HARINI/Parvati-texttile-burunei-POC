import { apiClient } from './client.js';

export const productService = {
  list: () => apiClient.get('/api/products'),
  create: (body) => apiClient.post('/api/products', body),
  update: (productId, body) => apiClient.put(`/api/products/${productId}`, body),
  remove: (productId) => apiClient.delete(`/api/products/${productId}`),
};
