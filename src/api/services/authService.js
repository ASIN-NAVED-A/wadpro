import apiClient from '../client';
import { USER_FIELD_MAP } from '../fieldMap';

export const authService = {
  /**
   * Register a new user (employee or employer)
   */
  async register(formData) {
    const payload = USER_FIELD_MAP.toBackendRegister(formData);

    try {
      const response = await apiClient.post('/auth/register', payload);
      const data = response.data;
      const user = USER_FIELD_MAP.fromBackendUser(data.user || data);
      return {
        token: data.token,
        user,
        message: data.message || 'Registration successful',
      };
    } catch (error) {
      // Fallback demo simulator if backend server is not running
      if (error.mapped?.isNetworkError && import.meta.env.VITE_ENABLE_DEMO_FALLBACK === 'true') {
        const demoUser = {
          id: 'demo-user-' + Date.now(),
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
        };
        const demoToken = 'mock-jwt-token-' + Date.now();
        return {
          token: demoToken,
          user: demoUser,
          message: 'Account created in demo mode (backend server offline)',
          isDemo: true,
        };
      }
      throw error;
    }
  },

  /**
   * Login user with email & password
   */
  async login(credentials) {
    const payload = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    };

    try {
      const response = await apiClient.post('/auth/login', payload);
      const data = response.data;
      const user = USER_FIELD_MAP.fromBackendUser(data.user);
      return {
        token: data.token,
        user,
      };
    } catch (error) {
      // Fallback demo simulator if backend server is not running
      if (error.mapped?.isNetworkError && import.meta.env.VITE_ENABLE_DEMO_FALLBACK === 'true') {
        const isEmployer = credentials.email.includes('employer') || credentials.email.includes('recruiter');
        const role = isEmployer ? 'employer' : 'employee';
        const demoUser = {
          id: isEmployer ? 'demo-employer-1' : 'demo-employee-1',
          fullName: isEmployer ? 'Vikram Malhotra (HR Director)' : 'Priya Sharma',
          email: credentials.email,
          role: role,
        };
        const demoToken = 'mock-jwt-token-' + role;
        return {
          token: demoToken,
          user: demoUser,
          isDemo: true,
        };
      }
      throw error;
    }
  },

  /**
   * Fetch currently logged-in user profile
   */
  async getMe() {
    try {
      const response = await apiClient.get('/users/me');
      return USER_FIELD_MAP.fromBackendUser(response.data?.user || response.data);
    } catch (error) {
      if (error.mapped?.isNetworkError && import.meta.env.VITE_ENABLE_DEMO_FALLBACK === 'true') {
        const savedUserStr = localStorage.getItem('sjp_user');
        if (savedUserStr) {
          try {
            return JSON.parse(savedUserStr);
          } catch {
            return null;
          }
        }
      }
      throw error;
    }
  },
};

export default authService;
