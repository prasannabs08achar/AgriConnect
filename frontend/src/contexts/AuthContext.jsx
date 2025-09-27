import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext useEffect running...');
    const token = localStorage.getItem('accessToken');
    console.log('Token found:', !!token);
    if (token) {
      console.log('Fetching current user...');
      fetchCurrentUser();
    } else {
      console.log('No token found, setting loading to false');
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      console.log('Fetching current user...');
      const response = await apiClient.get('/users/get-current-user');
      console.log('User data received:', response.data.data);
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/users/login', { email, password });
      const { user: userData, accessToken, refreshToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const payload = {
        name: name?.trim(),
        email: email?.trim(),
        password: password?.trim(),
        role: role?.trim(),
      };

      console.log('Registering with payload:', payload);
      const response = await apiClient.post('/users/register', payload);
      console.log('Registration response:', response.data);
      return { success: true, user: response.data.data };
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error: Backend server is not running or not accessible';
      } else if (error.response?.status === 409) {
        errorMessage = 'User already exists with this email';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'All fields are required';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/users/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isFarmer: user?.role === 'farmer',
    isBuyer: user?.role === 'buyer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
