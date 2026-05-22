import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('finflow_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('finflow_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await API.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('[Auth Context] Session validation failed:', error.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token: receivedToken, user: userData } = response.data;
      
      localStorage.setItem('finflow_token', receivedToken);
      localStorage.setItem('finflow_user', JSON.stringify(userData));
      setToken(receivedToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await API.post('/auth/register', { name, email, password });
      const { token: receivedToken, user: userData } = response.data;
      
      localStorage.setItem('finflow_token', receivedToken);
      localStorage.setItem('finflow_user', JSON.stringify(userData));
      setToken(receivedToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('finflow_token');
    localStorage.removeItem('finflow_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
