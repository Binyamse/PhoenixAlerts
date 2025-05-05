import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext'; // Import useAuth from context

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); // Use auth context
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
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  console.log('Authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute;