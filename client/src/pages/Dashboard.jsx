import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  SimpleGrid, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText,
  Flex,
  Text,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAlerts: 0,
    firingAlerts: 0,
    silencedAlerts: 0,
    resolvedAlerts: 0,
    topAlertTypes: [],
    resolutionStats: {
      avgResolutionTime: 0,
      minResolutionTime: 0,
      maxResolutionTime: 0
    }
  });
  
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, alertsRes] = await Promise.all([
          axios.get('/api/alerts/stats/summary'),
          axios.get('/api/alerts?limit=5')
        ]);
        
        setStats(statsRes.data);
        setRecentAlerts(alertsRes.data.alerts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Poll for updates every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Example chart data - in a real app, this would come from the API
  const chartData = [
    { name: '12AM', alerts: 5, silenced: 2 },
    { name: '4AM', alerts: 8, silenced: 4 },
    { name: '8AM', alerts: 12, silenced: 5 },
    { name: '12PM', alerts: 15, silenced: 7 },
    { name: '4PM', alerts: 10, silenced: 3 },
    { name: '8PM', alerts: 7, silenced: 2 },
  ];

  return (
    <Box maxW="1200px" mx="auto">
      <Heading mb={6}>Dashboard</Heading>
      
      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
          <StatLabel>Total Alerts</StatLabel>
          <StatNumber>{stats.totalAlerts}</StatNumber>
          <StatHelpText>All recorded alerts</StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
          <StatLabel>Firing Alerts</StatLabel>
          <StatNumber>{stats.firingAlerts}</StatNumber>
          <StatHelpText color="red.500">Currently active</StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
          <StatLabel>Silenced Alerts</StatLabel>
          <StatNumber>{stats.silencedAlerts}</StatNumber>
          <StatHelpText>Auto-silenced by AI</StatHelpText>
        </Stat>
        
        <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
          <StatLabel>Resolved Alerts</StatLabel>
          <StatNumber>{stats.resolvedAlerts}</StatNumber>
          <StatHelpText color="green.500">No longer active</StatHelpText>
        </Stat>
      </SimpleGrid>
      
      {/* Charts and Tables */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        <Card>
          <CardHeader pb={0}>
            <Heading size="md">Alert Activity (24h)</Heading>
          </CardHeader>
          <CardBody>
            <Box h="240px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="alerts" stroke="#3182CE" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="silenced" stroke="#718096" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <Heading size="md">Top Alert Types</Heading>
          </CardHeader>
          <CardBody>
            {stats.topAlertTypes.map((alertType, index) => (
              <Box key={index} mb={4}>
                <Flex justify="space-between" mb={1}>
                  <Text fontWeight="medium">{alertType._id}</Text>
                  <Text>{alertType.count} alerts</Text>
                </Flex>
                <Progress 
                  value={(alertType.count / Math.max(...stats.topAlertTypes.map(a => a.count))) * 100} 
                  colorScheme={index === 0 ? "red" : index === 1 ? "orange" : "blue"} 
                  size="sm" 
                  borderRadius="full"
                />
              </Box>
            ))}
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Recent Alerts Table */}
      <Card>
        <CardHeader>
          <Heading size="md">Recent Alerts</Heading>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Alert Name</Th>
                <Th>Status</Th>
                <Th>Pod</Th>
                <Th>Action</Th>
                <Th>Time</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recentAlerts.map(alert => (
                <Tr key={alert._id}>
                  <Td fontWeight="medium">{alert.alertName}</Td>
                  <Td>
                    <Box 
                      display="inline-block" 
                      px={2} 
                      py={1} 
                      borderRadius="full" 
                      fontSize="xs" 
                      fontWeight="bold"
                      bg={alert.status === 'firing' ? 'red.100' : 'green.100'}
                      color={alert.status === 'firing' ? 'red.700' : 'green.700'}
                    >
                      {alert.status}
                    </Box>
                  </Td>
                  <Td>{alert.podName}</Td>
                  <Td>
                    <Box 
                      display="inline-block" 
                      px={2} 
                      py={1} 
                      borderRadius="full" 
                      fontSize="xs" 
                      fontWeight="bold"
                      bg={alert.silenced ? 'gray.100' : 'blue.100'}
                      color={alert.silenced ? 'gray.700' : 'blue.700'}
                    >
                      {alert.silenced ? 'Silenced' : 'Notified'}
                    </Box>
                  </Td>
                  <Td>{new Date(alert.createdAt).toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;
