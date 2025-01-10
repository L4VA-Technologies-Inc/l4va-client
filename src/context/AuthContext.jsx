import { useState, useEffect } from 'react';

import { AuthContext } from './auth';
import { CoreApiProvider } from '../services/api/core';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const { data } = await CoreApiProvider.getProfile();
        setUser(data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('jwt');
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (signature, stakeAddress) => {
    try {
      const response = await CoreApiProvider.login({
        signature,
        stakeAddress,
      });

      localStorage.setItem('jwt', response.data.accessToken);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      console.error('Login failed: ', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
