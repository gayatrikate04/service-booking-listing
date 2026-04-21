// The Axios instance that every service file imports.
// Request interceptor: reads JWT from localStorage, attaches to every request.
// Response interceptor: unwraps { success, data } envelope + handles 401 globally.
console.log("BASE URL:", process.env.NEXT_PUBLIC_API_URL);

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    // Read directly from localStorage — Zustand may not have hydrated yet on first render
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data, // unwrap envelope: { success, data } → data
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    // Re-throw backend error shape { code, message } so components can read it
    return Promise.reject(error.response?.data?.error || error);
  }
);

export default api;