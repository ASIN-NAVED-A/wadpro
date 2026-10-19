import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../api/services/authService';
import { AUTH_EXPIRED_EVENT } from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'sjp_token';
const USER_KEY = 'sjp_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Clear all authentication artifacts
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Sync token and user into localStorage & state
  const setAuthData = useCallback((newToken, newUser) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
    }
    if (newUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
    }
  }, []);

  // Listen for global 401 Unauthorized events from Axios
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [logout]);

  // Initial load check
  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const freshUser = await authService.getMe();
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        }
      } catch {
        // If network error in demo mode, keep persisted user
      } finally {
        setIsLoading(false);
      }
    }

    verifyAuth();
  }, []);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    setAuthData(result.token, result.user);
    return result;
  };

  const register = async (formData) => {
    const result = await authService.register(formData);
    if (result.token) {
      setAuthData(result.token, result.user);
    }
    return result;
  };

  // Helper to switch demo roles easily for testing
  const switchDemoRole = (targetRole) => {
    if (targetRole === 'employer') {
      const demoEmployer = {
        id: 'demo-employer-1',
        fullName: 'Vikram Malhotra (HR Director)',
        email: 'recruiter@nexustech.com',
        role: 'employer',
      };
      setAuthData('mock-jwt-token-employer', demoEmployer);
    } else {
      const demoEmployee = {
        id: 'demo-employee-1',
        fullName: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        role: 'employee',
      };
      setAuthData('mock-jwt-token-employee', demoEmployee);
    }
  };

  const role = user?.role || null;
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
