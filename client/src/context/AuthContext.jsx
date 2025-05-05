import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount, check if user is already logged in
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Initialize auth state (set token in axios headers if exists)
      const hasToken = authService.initAuth();
      
      if (hasToken) {
        try {
          // Get user from localStorage
          const storedUser = authService.getCurrentUser();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Token exists but no user data
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
          setUser(null);
          setIsAuthenticated(false);
          setError('Session validation failed');
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    setError(null);
    try {
      const result = await authService.login(username, password);
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMsg = 'Login failed. Please try again.';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      // Even if server logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, message: 'Logout error, but session cleared locally.' };
    }
  };

  // Auth context value
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;