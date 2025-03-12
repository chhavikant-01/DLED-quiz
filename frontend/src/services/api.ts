import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and has tokenExpired flag and we haven't tried refreshing yet
    if (
      error.response?.status === 401 &&
      (error.response?.data?.tokenExpired || error.response?.data?.message === 'Token expired, please refresh token') &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      
      try {
        const { default: authService } = await import('./authService');
        
        // Try to refresh the token
        await authService.refreshToken();
        
        // Update the authorization header with the new token
        const newToken = localStorage.getItem('token');
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 