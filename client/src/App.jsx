import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AlertDetail from './pages/AlertDetail';
import AlertList from './pages/AlertList';
import Settings from './pages/Settings';

// Layout components
import Layout from './components/Layout';

const App = () => {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
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