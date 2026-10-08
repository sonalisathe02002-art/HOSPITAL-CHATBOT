import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auracare_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('auracare_token');
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
          localStorage.setItem('auracare_user', JSON.stringify(res.data));
        } catch (error) {
          console.error("Auth initialization failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('auracare_token', access_token);
    localStorage.setItem('auracare_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const { access_token, user: newUser } = res.data;
    localStorage.setItem('auracare_token', access_token);
    localStorage.setItem('auracare_user', JSON.stringify(newUser));
    setToken(access_token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('auracare_token');
    localStorage.removeItem('auracare_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await userAPI.updateProfile(data);
    setUser(res.data);
    localStorage.setItem('auracare_user', JSON.stringify(res.data));
    return res.data;
  };

  const value = {
    user,
    token,
    role: user?.role || 'guest',
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isPatient: user?.role === 'patient',
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
