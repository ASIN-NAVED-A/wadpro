import axios from 'axios';
import { mapApiError } from '../utils/errorMapper';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sjp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Custom event to trigger global logout on 401 without circular dependencies
export const AUTH_EXPIRED_EVENT = 'sjp_auth_expired';

// Response Interceptor: Centralized error mapping and 401 handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const mapped = mapApiError(error);
    error.mapped = mapped;

    // Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      localStorage.removeItem('sjp_token');
      localStorage.removeItem('sjp_user');
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, { detail: mapped }));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
