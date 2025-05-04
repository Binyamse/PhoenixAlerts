import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AlertActivity = () => {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/dashboard/activity');
        setActivityData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setError('Failed to load alert activity data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="400px">
      <Spinner size="xl" />
    </Box>
  );
  
  if (error) return (
    <Alert status="error" mt={4}>
      <AlertIcon />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
  
  if (!activityData || !activityData.hourlyAlerts) return (
    <Alert status="info" mt={4}>
      <AlertIcon />
      <AlertDescription>No activity data available for the past 24 hours.</AlertDescription>
    </Alert>
  );

  // Format data for hourly chart
  const hours = Array.from({length: 24}, (_, i) => i);
  const hourlyData = hours.map(hour => {
    // Find counts for each severity at this hour
    const critical = activityData.hourlyAlerts.find(
      alert => alert._id.hour === hour && alert._id.severity === 'critical'
    )?.count || 0;
    
    const warning = activityData.hourlyAlerts.find(
      alert => alert._id.hour === hour && alert._id.severity === 'warning'
    )?.count || 0;
    
    const info = activityData.hourlyAlerts.find(
      alert => alert._id.hour === hour && alert._id.severity === 'info'
    )?.count || 0;
    
    return {
      hour: `${hour}:00`,
      critical,
      warning,
      info
    };
  });

  // Format data for severity pie chart
  const severityData = [
    { name: 'Critical', value: activityData.severityCounts.find(s => s._id === 'critical')?.count || 0 },
    { name: 'Warning', value: activityData.severityCounts.find(s => s._id === 'warning')?.count || 0 },
    { name: 'Info', value: activityData.severityCounts.find(s => s._id === 'info')?.count || 0 }
  ].filter(item => item.value > 0);

  // Namespace data for the bar chart
  const namespaceData = activityData.namespaces.map(ns => ({
    name: ns._id || 'unknown',
    alerts: ns.count
  }));

  // Colors for charts
  const COLORS = ['#E53E3E', '#F6AD55', '#4299E1'];

  return (
    <Box className="alert-activity">
      <Heading as="h2" size="lg" mb={4}>
        Alert Activity (Last 24h)
      </Heading>
      
      <Text fontSize="lg" mb={6}>
        Total Alerts: {activityData.totalAlerts}
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {/* Hourly Alert Chart */}
        <Card gridColumn={{ base: "span 1", md: "span 2" }} variant="outline">
          <CardHeader>
            <Heading size="md">Hourly Alert Activity</Heading>
          </CardHeader>
          <CardBody>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={hourlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="critical" 
                    name="Critical" 
                    stroke="#E53E3E" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="warning" 
                    name="Warning" 
                    stroke="#F6AD55" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="info" 
                    name="Info" 
                    stroke="#4299E1" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
        
        {/* Severity Pie Chart */}
        <Card variant="outline">
          <CardHeader>
            <Heading size="md">Alerts by Severity</Heading>
          </CardHeader>
          <CardBody>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
        
        {/* Namespace Bar Chart */}
        <Card gridColumn={{ base: "span 1", md: "span 3" }} variant="outline">
          <CardHeader>
            <Heading size="md">Most Affected Namespaces</Heading>
          </CardHeader>
          <CardBody>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={namespaceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="alerts" name="Alert Count" fill="#805AD5" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default AlertActivity;