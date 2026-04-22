import { apiClient } from './client.js';

export const authService = {
  registerMobile: (mobile) => apiClient.post('/api/auth/register/mobile', { mobile }),
  verifyRegisterOtp: (mobile, otp) => apiClient.post('/api/auth/verify-otp', { mobile, otp }),
  registerEmail: (body) => apiClient.post('/api/auth/register/email', body),
  loginEmail: (email, password) => apiClient.post('/api/auth/login/email', { email, password }),
  loginOtpRequest: (mobile) => apiClient.post('/api/auth/login/otp', { mobile }),
  verifyLoginOtp: (mobile, otp) => apiClient.post('/api/auth/verify-login-otp', { mobile, otp }),
  forgotPassword: (email) => apiClient.post('/api/auth/forgot-password', { email }),
  resetPassword: (body) => apiClient.post('/api/auth/reset-password', body),
  me: () => apiClient.get('/api/auth/me'),
};
