import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  SimpleGrid, 
  Card, 
  CardBody, 
  Text,
  Tabs, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel
} from '@chakra-ui/react';
import AlertActivity from './AlertActivity';
import Predictions from './Predictions';
import AlertStats from './AlertStats'; 

const Dashboard = () => {
  return (
    <Container maxW="container.xl" py={6}>
      <Heading as="h1" size="xl" mb={6}>
        Dashboard
      </Heading>
      
      {/* Summary Stats Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Text color="gray.500" fontSize="sm">
              Total Alerts
            </Text>
            <Heading size="lg">
              <AlertStats type="total" />
            </Heading>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Text color="gray.500" fontSize="sm">
              Critical Alerts
            </Text>
            <Heading size="lg" color="red.500">
              <AlertStats type="critical" />
            </Heading>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Text color="gray.500" fontSize="sm">
              Active Alerts
            </Text>
            <Heading size="lg">
              <AlertStats type="active" />
            </Heading>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Text color="gray.500" fontSize="sm">
              Silenced Alerts
            </Text>
            <Heading size="lg">
              <AlertStats type="silenced" />
            </Heading>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Tabbed Content */}
      <Card>
        <CardBody>
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Alert Activity (24h)</Tab>
              <Tab>Predictions</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <AlertActivity />
              </TabPanel>
              <TabPanel>
                <Predictions />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Dashboard;