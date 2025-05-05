import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Spinner, Center } from '@chakra-ui/react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Center h="100vh">
        <Box textAlign="center">
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Box mt={4}>Checking authentication...</Box>
        </Box>
      </Center>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;