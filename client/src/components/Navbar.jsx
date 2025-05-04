import React from 'react';
import { Box, Flex, Link, Heading, Spacer } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <Box bg="blue.600" px={4} py={3} color="white">
      <Flex align="center" maxW="1200px" mx="auto">
        <Heading size="md">AI Alert Manager</Heading>
        <Spacer />
        <Flex gap={6}>
          <Link as={RouterLink} to="/" fontWeight="medium">Dashboard</Link>
          <Link as={RouterLink} to="/alerts" fontWeight="medium">Alerts</Link>
          <Link as={RouterLink} to="/predictions" fontWeight="medium">Predictions</Link>
          <Link as={RouterLink} to="/settings" fontWeight="medium">Settings</Link>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;