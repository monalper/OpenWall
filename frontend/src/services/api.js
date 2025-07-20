// frontend/src/services/api.js
import axios from 'axios';

// Development ve production ortamları için API URL'i
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api'  // Development ortamı
  : 'https://ecnn-backend.vercel.app/api';  // Production ortamı

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API istekleri gönderilmeden önce token ekleme
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıtları yakalamak için interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access - 401. Logging out.");
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;