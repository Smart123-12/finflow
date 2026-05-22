import axios from 'axios';

// Base API instance pointing to backend server port 5000
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Outbound request interceptor attaching token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor mapping server error details
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'A network error occurred. Please check if the backend API is running.';
    
    // Auto-logout user if token is expired/invalid
    if (error.response?.status === 401 && localStorage.getItem('finflow_token')) {
      localStorage.removeItem('finflow_token');
      localStorage.removeItem('finflow_user');
      window.location.href = '/login';
    }
    
    return Promise.reject(new Error(message));
  }
);

export default API;
