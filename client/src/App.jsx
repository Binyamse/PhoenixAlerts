import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import axios from 'axios';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AlertList from './pages/AlertList';
import AlertDetail from './pages/AlertDetail';
import Settings from './pages/Settings';

// Layout components
import Layout from './components/Layout';

// Services
import authService from './services/authService';

const App = () => {
  // Initialize authentication on app load
  useEffect(() => {
    // Initialize auth service
    authService.initAuth();
    
    // Add a global axios response interceptor to handle 401 errors
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          // If 401 Unauthorized, log out and redirect to login
          console.log('401 Unauthorized response detected');
          authService.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <ChakraProvider>
      <AuthProvider> {/* Wrap everything in AuthProvider */}
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard as default */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Main routes */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="alerts" element={<AlertList />} />
              <Route path="alerts/:id" element={<AlertDetail />} />
              <Route path="settings" element={<Settings />} />
              
              {/* Fallback for unknown routes */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App;