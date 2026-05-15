// The Axios instance that every service file imports.
// Request interceptor: reads JWT from localStorage, attaches to every request.
// Response interceptor: unwraps { success, data } envelope + handles 401 globally.
// console.log("BASE URL:", process.env.NEXT_PUBLIC_API_URL);

// src/services/api.js
// NEXT_PUBLIC_API_URL is set in Vercel environment variables.
// In development: http://localhost:3001/api/v1
// In production:  https://your-railway-app.up.railway.app/api/v1

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15s timeout — production networks can be slower than localhost
  withCredentials: true,
  // withCredentials: true allows cookies to be sent cross-origin.
  // Required if you ever add httpOnly refresh token cookies.
  // Harmless if you don't use cookies yet.
});

api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data?.error || error);
  }
);

export default api;