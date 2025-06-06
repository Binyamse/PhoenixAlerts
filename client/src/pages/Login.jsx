import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import authService from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Check if already logged in
  useEffect(() => {
    if (authService.isAuthenticated()) {
      // Redirect to dashboard if already logged in
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { username, password } = formData;
      console.log('Submitting login form');
      const result = await authService.login(username, password);

      if (result.success) {
        toast({
          title: 'Login successful',
          description: `Welcome, ${result.user.username}!`,
          status: 'success',
          duration: 3000,
          isClosable: true
        });

        // Get the redirect path from location state or default to dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        console.log('Redirecting to:', from);
        
        // Add a small delay before redirecting
        setTimeout(() => {
          navigate(from);
        }, 500);
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl">PhoenixAlerts</Heading>
          <Text mt={2} color="gray.600">
            Sign in to access your dashboard
          </Text>
        </Box>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl id="username" isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
                <InputRightElement>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              colorScheme="purple"
              width="full"
              isLoading={loading}
              loadingText="Logging in..."
              mt={4}
            >
              Sign In
            </Button>
          </VStack>
        </Box>

        <Box textAlign="center">
          <Text fontSize="sm" color="gray.600">
            Default: admin / {process.env.REACT_APP_DEFAULT_PASSWORD || 'changeMe!Now123'}
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default Login;