import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('imovies_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state on refresh
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('imovies_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getMe();
        if (response.success && response.user) {
          setUser(response.user);
          setToken(storedToken);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    if (data.success && data.token) {
      localStorage.setItem('imovies_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const data = await api.register({ name, email, password });
    if (data.success && data.token) {
      localStorage.setItem('imovies_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('imovies_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
