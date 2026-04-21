import api from './api';

// Maps to your backend: POST /auth/register, POST /auth/login
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login',    data),
};