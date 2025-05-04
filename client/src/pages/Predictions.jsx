import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Select,
} from '@chakra-ui/react';
import axios from 'axios';

const Predictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // In a real application, these would come from the API
  // This is simulated data for demonstration
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        
        // This would be a real API call in production
        // const res = await axios.get('/api/predictions');
        // setPredictions(res.data);
        
        // Simulated data
        setTimeout(() => {
          const simulatedData = [
            {
              id: 'pred1',
              alertName: 'KubePodCrashLooping',
              podPattern: 'backend-worker-*',
              namespace: 'production',
              prediction: 'Will self-resolve',
              confidence: 0.92,
              pattern: 'Occurs every Monday during scheduled job runs',
              typicalResolution: '8-12 minutes',
              action: 'silence',
              lastOccurrence: new Date(Date.now() - 86400000 * 2).toISOString()
            },
            {
              id: 'pred2',
              alertName: 'KubeContainerWaiting',
              podPattern: 'database-backup-*',
              namespace: 'backups',
              prediction: 'Requires attention',
              confidence: 0.78,
              pattern: 'Occurs after storage system maintenance',
              typicalResolution: 'Manual intervention required',
              action: 'notify',
              lastOccurrence: new Date(Date.now() - 86400000 * 5).toISOString()
            },
            {
              id: 'pred3',
              alertName: 'KubeMemoryOvercommit',
              podPattern: 'api-gateway-*',
              namespace: 'default',
              prediction: 'Will self-resolve',
              confidence: 0.85,
              pattern: 'Occurs daily during peak traffic (14:00-16:00)',
              typicalResolution: '15-20 minutes',
              action: 'silence',
              lastOccurrence: new Date(Date.now() - 86400000 * 1).toISOString()
            },
            {
              id: 'pred4',
              alertName: 'KubePodNotReady',
              podPattern: 'cache-service-*',
              namespace: 'data-services',
              prediction: 'Requires investigation',
              confidence: 0.67,
              pattern: 'Inconsistent occurrence pattern',
              typicalResolution: 'Variable (10min - 2hrs)',
              action: 'notify',
              lastOccurrence: new Date(Date.now() - 86400000 * 3).toISOString()
            },
            {
              id: 'pred5',
              alertName: 'KubeNodeNotReady',
              podPattern: 'node-*',
              namespace: 'kube-system',
              prediction: 'Critical issue',
              confidence: 0.95,
              pattern: 'Rare occurrence, requires immediate attention',
              typicalResolution: 'Manual intervention required',
              action: 'notify',
              lastOccurrence: new Date(Date.now() - 86400000 * 14).toISOString()
            }
          ];
          
          setPredictions(simulatedData);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setLoading(false);
      }
    };
    
    fetchPredictions();
  }, []);

  const filteredPredictions = filter === 'all' 
    ? predictions 
    : predictions.filter(pred => pred.action === filter);

  return (
    <Box maxW="1200px" mx="auto">
      <Heading mb={6}>AI Predictions & Patterns</Heading>
      
      <Text mb={4}>
        Based on historical alert data, the AI has identified these recurring patterns and predicted how future alerts should be handled.
      </Text>
      
      <Flex mb={6}>
        <Select 
          maxW="200px" 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All predictions</option>
          <option value="silence">Auto-silence</option>
          <option value="notify">Notify</option>
        </Select>
      </Flex>
      
      <Card>
        <CardHeader pb={0}>
          <Heading size="md">Predicted Alert Patterns</Heading>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Alert Name</Th>
                <Th>Pod Pattern</Th>
                <Th>Prediction</Th>
                <Th>Pattern</Th>
                <Th>Action</Th>
                <Th>Confidence</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={4}>Loading predictions...</Td>
                </Tr>
              ) : filteredPredictions.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={4}>No predictions found</Td>
                </Tr>
              ) : filteredPredictions.map(prediction => (
                <Tr key={prediction.id}>
                  <Td fontWeight="medium">{prediction.alertName}</Td>
                  <Td>
                    <Text>{prediction.podPattern}</Text>
                    <Text fontSize="xs" color="gray.500">{prediction.namespace}</Text>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={prediction.prediction.includes('self-resolve') ? 'green' : 
                                  prediction.prediction.includes('Critical') ? 'red' : 'yellow'}
                      borderRadius="full"
                      px={2}
                      py={1}
                    >
                      {prediction.prediction}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{prediction.pattern}</Text>
                    <Text fontSize="xs" color="gray.500">
                      Typical resolution: {prediction.typicalResolution}
                    </Text>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={prediction.action === 'silence' ? 'gray' : 'blue'}
                      borderRadius="full"
                      px={2}
                      py={1}
                    >
                      {prediction.action === 'silence' ? 'Auto-silence' : 'Notify'}
                    </Badge>
                  </Td>
                  <Td>
                    <Text 
                      fontWeight="bold"
                      color={prediction.confidence > 0.9 ? 'green.500' : 
                            prediction.confidence > 0.7 ? 'orange.500' : 'red.500'}
                    >
                      {Math.round(prediction.confidence * 100)}%
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Last seen: {new Date(prediction.lastOccurrence).toLocaleDateString()}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Predictions;
