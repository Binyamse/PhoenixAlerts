import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Button,
  Text,
  Badge,
  Flex,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import axios from 'axios';

const AlertsList = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    silenced: ''
  });

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      let query = `?page=${pagination.page}&limit=10`;
      if (filters.status) query += `&status=${filters.status}`;
      if (filters.silenced) query += `&silenced=${filters.silenced === 'true'}`;
      if (filters.search) query += `&search=${filters.search}`;
      
      const res = await axios.get(`/api/alerts${query}`);
      setAlerts(res.data.alerts);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [pagination.page, filters]);

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
    setPagination({
      ...pagination,
      page: 1 // Reset to first page on filter change
    });
  };

  const handlePageChange = (newPage) => {
    setPagination({
      ...pagination,
      page: newPage
    });
  };

  return (
    <Box maxW="1200px" mx="auto">
      <Heading mb={6}>Alert History</Heading>
      
      {/* Filters */}
      <Card mb={6}>
        <CardBody>
          <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
            <InputGroup maxW={{ base: '100%', md: '300px' }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input 
                placeholder="Search alerts..." 
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </InputGroup>
            
            <Select 
              placeholder="All statuses" 
              maxW={{ base: '100%', md: '200px' }}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="firing">Firing</option>
              <option value="resolved">Resolved</option>
            </Select>
            
            <Select 
              placeholder="All responses" 
              maxW={{ base: '100%', md: '200px' }}
              value={filters.silenced}
              onChange={(e) => handleFilterChange('silenced', e.target.value)}
            >
              <option value="true">Silenced</option>
              <option value="false">Notified</option>
            </Select>
          </Flex>
        </CardBody>
      </Card>
      
      {/* Alerts Table */}
      <Card>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Alert Name</Th>
                <Th>Status</Th>
                <Th>Pod / Namespace</Th>
                <Th>Action</Th>
                <Th>Time</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={4}>Loading alerts...</Td>
                </Tr>
              ) : alerts.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={4}>No alerts found</Td>
                </Tr>
              ) : alerts.map(alert => (
                <Tr key={alert._id}>
                  <Td fontWeight="medium">{alert.alertName}</Td>
                  <Td>
                    <Badge 
                      colorScheme={alert.status === 'firing' ? 'red' : 'green'}
                      borderRadius="full"
                      px={2}
                      py={1}
                    >
                      {alert.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Text>{alert.podName}</Text>
                    <Text fontSize="xs" color="gray.500">{alert.namespace}</Text>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={alert.silenced ? 'gray' : 'blue'}
                      borderRadius="full"
                      px={2}
                      py={1}
                    >
                      {alert.silenced ? 'Silenced' : 'Notified'}
                    </Badge>
                  </Td>
                  <Td>{new Date(alert.createdAt).toLocaleString()}</Td>
                  <Td>
                    <Button
                      as={RouterLink}
                      to={`/alerts/${alert._id}`}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                    >
                      View
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          
          {/* Pagination */}
          <Flex justify="space-between" align="center" mt={6}>
            <Text color="gray.600">
              Showing {alerts.length} of {pagination.total} alerts
            </Text>
            <Flex>
              <Tooltip label="Previous page">
                <IconButton
                  icon={<ChevronLeftIcon />}
                  isDisabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  mr={2}
                />
              </Tooltip>
              <Tooltip label="Next page">
                <IconButton
                  icon={<ChevronRightIcon />}
                  isDisabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                />
              </Tooltip>
            </Flex>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
};

export default AlertsList;
