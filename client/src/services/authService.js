// client/src/services/authService.js
import axios from 'axios';

// Set token in axios headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth token set in axios headers');
  } else {
    delete axios.defaults.headers.common['Authorization'];
    console.log('Auth token removed from axios headers');
  }
};

// Login user
const login = async (username, password) => {
  try {
    console.log('Attempting login for:', username);
    const response = await axios.post('/api/auth/login', { username, password });
    const { token, user } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set auth token in axios headers
    setAuthToken(token);
    
    console.log('Login successful:', user.username);
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
const logout = () => {
  // Remove token from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Remove auth token from axios headers
  setAuthToken(null);
  
  console.log('User logged out');
  return { success: true };
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token; // Returns true if token exists
};

// Get current user
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Initialize auth - call on app load
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
  isAuthenticated,
  getCurrentUser,
  initAuth,
  setAuthToken
};

// Initialize auth on service load
initAuth();

export default authService;