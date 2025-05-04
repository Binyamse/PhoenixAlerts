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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Progress,
  Tag,
  Badge
} from '@chakra-ui/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const Predictions = () => {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/dashboard/predictions');
        setPredictionData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching predictions:', err);
        setError('Failed to load prediction data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 15 minutes
    const interval = setInterval(fetchData, 15 * 60 * 1000);
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
  
  if (!predictionData) return (
    <Alert status="info" mt={4}>
      <AlertIcon />
      <AlertDescription>No prediction data available.</AlertDescription>
    </Alert>
  );

  // Function to determine color based on likelihood percentage
  const getLikelihoodColor = (likelihood) => {
    if (likelihood >= 70) return "red";
    if (likelihood >= 40) return "orange";
    return "green";
  };

  // Format alert types data for the bar chart
  const alertTypesData = predictionData.historicalPatterns.alertTypes?.map(type => ({
    name: type._id || 'Unknown Alert',
    count: type.count
  })) || [];

  return (
    <Box className="predictions">
      <Heading as="h2" size="lg" mb={4}>
        Alert Predictions
      </Heading>
      
      {predictionData.predictions.length === 0 ? (
        <Alert status="info" my={4}>
          <AlertIcon />
          <AlertDescription>
            There isn't enough historical data to make reliable predictions at this time.
          </AlertDescription>
        </Alert>
      ) : (
        <Card mb={6} variant="outline">
          <CardHeader>
            <Heading size="md">Potential Upcoming Alerts</Heading>
          </CardHeader>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Namespace</Th>
                    <Th>Pod</Th>
                    <Th>Likelihood</Th>
                    <Th>Prediction</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {predictionData.predictions.map((prediction, index) => (
                    <Tr key={index}>
                      <Td>{prediction.namespace}</Td>
                      <Td>{prediction.pod || 'N/A'}</Td>
                      <Td>
                        <Box>
                          <Progress 
                            value={prediction.likelihood} 
                            colorScheme={getLikelihoodColor(prediction.likelihood)}
                            size="sm"
                            borderRadius="full"
                            mb={1}
                          />
                          <Text fontSize="sm" textAlign="right">
                            {`${prediction.likelihood}%`}
                          </Text>
                        </Box>
                      </Td>
                      <Td>{prediction.message}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      )}
      
      {/* Problematic Pods */}
      <Card mb={6} variant="outline">
        <CardHeader>
          <Heading size="md">Problematic Pods (Last 7 Days)</Heading>
        </CardHeader>
        <CardBody>
          {predictionData.historicalPatterns.problematicPods.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Pod</Th>
                    <Th>Namespace</Th>
                    <Th>Cluster</Th>
                    <Th>Alert Count</Th>
                    <Th>Last Alert</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {predictionData.historicalPatterns.problematicPods.map((pod, index) => (
                    <Tr key={index}>
                      <Td>{pod._id}</Td>
                      <Td>{pod.namespace}</Td>
                      <Td>{pod.cluster}</Td>
                      <Td>
                        <Badge 
                          colorScheme={pod.count > 5 ? "red" : pod.count > 3 ? "orange" : "gray"}
                          borderRadius="full"
                          px={2}
                        >
                          {pod.count}
                        </Badge>
                      </Td>
                      <Td>{new Date(pod.lastAlert).toLocaleString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Alert status="info">
              <AlertIcon />
              <AlertDescription>No problematic pods detected in the last 7 days.</AlertDescription>
            </Alert>
          )}
        </CardBody>
      </Card>
      
      {/* Alert Types Chart */}
      {alertTypesData.length > 0 && (
        <Card variant="outline">
          <CardHeader>
            <Heading size="md">Most Common Alert Types (Last 7 Days)</Heading>
          </CardHeader>
          <CardBody>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={alertTypesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Alert Count" fill="#805AD5" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
      )}
    </Box>
  );
};

export default Predictions;