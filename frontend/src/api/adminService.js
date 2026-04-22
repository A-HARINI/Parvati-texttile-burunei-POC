import { apiClient } from './client.js';

export const adminService = {
  createAdmin: (body) => apiClient.post('/api/admin/create', body),
  createCustomer: (body) => apiClient.post('/api/admin/customers', body),
  listUsers: () => apiClient.get('/api/admin/users'),
  listCustomers: () => apiClient.get('/api/admin/customers'),
};
