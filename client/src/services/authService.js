// src/services/authService.js
import axios from 'axios';

// API URLs
const API_URL = '/api/auth';
const LOGIN_URL = `${API_URL}/login`;
const LOGOUT_URL = `${API_URL}/logout`;
const REGISTER_URL = `${API_URL}/register`;
const ME_URL = `${API_URL}/me`;

// Set token in axios headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Login user
const login = async (username, password) => {
  try {
    const response = await axios.post(LOGIN_URL, { username, password });
    const { token, user } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set auth token in axios headers
    setAuthToken(token);
    
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to login. Please check your credentials.'
    };
  }
};

// Logout user
const logout = async () => {
  try {
    await axios.post(LOGOUT_URL);
    
    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove auth token from axios headers
    setAuthToken(null);
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error.response?.data || error.message);
    
    // Even if the server call fails, clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    
    return { 
      success: false, 
      message: error.response?.data?.message || 'Error during logout, but session cleared locally.'
    };
  }
};

// Register new user (admin only)
const register = async (userData) => {
  try {
    const response = await axios.post(REGISTER_URL, userData);
    return { success: true, user: response.data.user };
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to register user.'
    };
  }
};

// Get current user
const getCurrentUser = async () => {
  try {
    // First check if we have a token
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, authenticated: false };
    }
    
    // Set the token in axios headers
    setAuthToken(token);
    
    // Get current user from API
    const response = await axios.get(ME_URL);
    return { 
      success: true, 
      authenticated: true,
      user: response.data 
    };
  } catch (error) {
    console.error('Get current user error:', error.response?.data || error.message);
    
    // Clear any invalid tokens
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthToken(null);
    }
    
    return { 
      success: false, 
      authenticated: false,
      message: error.response?.data?.message || 'Session expired or invalid.'
    };
  }
};

// Initialize auth state (call on app load)
const initAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
    return true;
  }
  return false;
};

// Export methods
const authService = {
  login,
  logout,
  register,
  getCurrentUser,
  initAuth,
  setAuthToken
};

export default authService;