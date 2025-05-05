import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, 
  Flex, 
  HStack, 
  IconButton, 
  Button, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  MenuDivider, 
  useDisclosure, 
  useColorModeValue,
  Stack,
  Text,
  Avatar
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

// Navigation links configuration
const Links = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Alerts', path: '/alerts' },
  { name: 'Settings', path: '/settings' }
];

const NavLink = ({ children, to }) => (
  <RouterLink to={to}>
    <Box
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
    >
      {children}
    </Box>
  </RouterLink>
);

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box fontWeight="bold" fontSize="lg">PhoenixAlerts</Box>
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            {Links.map((link) => (
              <NavLink key={link.name} to={link.path}>{link.name}</NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems={'center'}>
          {user ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <HStack>
                  <Avatar
                    size={'sm'}
                    name={user.username}
                    bg="purple.500"
                  />
                  <Text display={{ base: 'none', md: 'flex' }}>
                    {user.username}
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/settings">Profile</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button
              as={RouterLink}
              to="/login"
              variant={'solid'}
              colorScheme={'purple'}
              size={'sm'}
              mr={4}>
              Sign In
            </Button>
          )}
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            {Links.map((link) => (
              <NavLink key={link.name} to={link.path}>{link.name}</NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default Navbar;