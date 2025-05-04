import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
  Button,
  Textarea,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Flex,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';
import axios from 'axios';

const AlertDetail = () => {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({
    correct: null,
    comments: ''
  });
  const toast = useToast();

  useEffect(() => {
    const fetchAlertDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/alerts/${id}`);
        setAlert(res.data);
        
        // Initialize feedback if it exists
        if (res.data.feedback) {
          setFeedback(res.data.feedback);
        }
      } catch (error) {
        console.error('Error fetching alert details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load alert details.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlertDetails();
  }, [id]);

  const handleFeedbackSubmit = async () => {
    try {
      if (feedback.correct === null) {
        toast({
          title: 'Error',
          description: 'Please select whether the AI decision was correct.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      await axios.post(`/api/alerts/${id}/feedback`, feedback);
      
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback. It will help improve the AI.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading alert details...</Text>
      </Box>
    );
  }

  if (!alert) {
    return (
      <Box textAlign="center" py={10}>
        <Heading>Alert Not Found</Heading>
        <Text mt={4}>The alert you're looking for doesn't exist or may have been deleted.</Text>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto">
      <Heading mb={6}>Alert Details</Heading>
      
      {/* Alert Summary */}
      <Card mb={6}>
        <CardHeader pb={0}>
          <Flex justify="space-between" align="center">
            <Heading size="md">{alert.alertName}</Heading>
            <Badge
              colorScheme={alert.status === 'firing' ? 'red' : 'green'}
              fontSize="md"
              px={2}
              py={1}
              borderRadius="full"
            >
              {alert.status}
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={4}>
            <GridItem>
              <Text color="gray.600" fontSize="sm">Pod</Text>
              <Text fontWeight="medium">{alert.podName}</Text>
            </GridItem>
            <GridItem>
              <Text color="gray.600" fontSize="sm">Namespace</Text>
              <Text fontWeight="medium">{alert.namespace}</Text>
            </GridItem>
            <GridItem>
              <Text color="gray.600" fontSize="sm">Cluster</Text>
              <Text fontWeight="medium">{alert.cluster}</Text>
            </GridItem>
            <GridItem>
              <Text color="gray.600" fontSize="sm">Action Taken</Text>
              <Badge
                colorScheme={alert.silenced ? 'gray' : 'blue'}
                px={2}
                py={1}
                borderRadius="full"
              >
                {alert.silenced ? 'Silenced' : 'Notified'}
              </Badge>
            </GridItem>
            {alert.silenced && (
              <GridItem colSpan={2}>
                <Text color="gray.600" fontSize="sm">Silence Reason</Text>
                <Text>{alert.silenceReason}</Text>
              </GridItem>
            )}
            <GridItem>
              <Text color="gray.600" fontSize="sm">Started At</Text>
              <Text>{new Date(alert.startsAt).toLocaleString()}</Text>
            </GridItem>
            {alert.endsAt && (
              <GridItem>
                <Text color="gray.600" fontSize="sm">Ended At</Text>
                <Text>{new Date(alert.endsAt).toLocaleString()}</Text>
              </GridItem>
            )}
            {alert.duration && (
              <GridItem>
                <Text color="gray.600" fontSize="sm">Duration</Text>
                <Text>{alert.duration.toFixed(0)} seconds</Text>
              </GridItem>
            )}
          </Grid>
        </CardBody>
      </Card>
      
      {/* LLM Analysis */}
      <Card mb={6}>
        <CardHeader pb={0}>
          <Heading size="md">AI Analysis</Heading>
        </CardHeader>
        <CardBody>
          <Text>{alert.llmAnalysis}</Text>
        </CardBody>
      </Card>
      
      {/* Debug Steps */}
      {alert.debugSteps && alert.debugSteps.length > 0 && (
        <Card mb={6}>
          <CardHeader pb={0}>
            <Heading size="md">Debugging Steps</Heading>
          </CardHeader>
          <CardBody>
            <List spacing={2}>
              {alert.debugSteps.map((step, index) => (
                <ListItem key={index} display="flex">
                  <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                  <Text>{step}</Text>
                </ListItem>
              ))}
            </List>
          </CardBody>
        </Card>
      )}
      
      {/* Labels and Annotations */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={6} mb={6}>
        <GridItem>
          <Card h="100%">
            <CardHeader pb={0}>
              <Heading size="md">Labels</Heading>
            </CardHeader>
            <CardBody>
              {Object.entries(alert.labels || {}).map(([key, value]) => (
                <Box key={key} mb={2}>
                  <Text color="gray.600" fontSize="xs">{key}</Text>
                  <Text fontSize="sm" fontFamily="mono">{value}</Text>
                </Box>
              ))}
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card h="100%">
            <CardHeader pb={0}>
              <Heading size="md">Annotations</Heading>
            </CardHeader>
            <CardBody>
              {Object.entries(alert.annotations || {}).map(([key, value]) => (
                <Box key={key} mb={2}>
                  <Text color="gray.600" fontSize="xs">{key}</Text>
                  <Text fontSize="sm">{value}</Text>
                </Box>
              ))}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      
      {/* Feedback Form */}
      <Card>
        <CardHeader pb={0}>
          <Heading size="md">Provide Feedback</Heading>
        </CardHeader>
        <CardBody>
          <FormControl mb={4} isRequired>
            <FormLabel>Was the AI decision correct?</FormLabel>
            <RadioGroup
              value={feedback.correct === null ? '' : feedback.correct.toString()}
              onChange={(value) => setFeedback({ ...feedback, correct: value === 'true' })}
            >
              <Stack direction="row">
                <Radio value="true">Yes</Radio>
                <Radio value="false">No</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
          
          <FormControl mb={4}>
            <FormLabel>Comments (optional)</FormLabel>
            <Textarea
              placeholder="Any additional feedback or comments..."
              value={feedback.comments}
              onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
            />
          </FormControl>
          
          <Button
            colorScheme="blue"
            onClick={handleFeedbackSubmit}
            isDisabled={feedback.correct === null || 
              (alert.feedback && alert.feedback.correct === feedback.correct && 
               alert.feedback.comments === feedback.comments)}
          >
            Submit Feedback
          </Button>
        </CardBody>
      </Card>
    </Box>
  );
};

export default AlertDetail;
