import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Switch,
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  Text,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Grid,
  GridItem,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Flex,
  useToast
} from '@chakra-ui/react';

const Settings = () => {
  const [settings, setSettings] = useState({
    // AI Settings
    aiEnabled: true,
    confidenceThreshold: 75,
    llmModel: 'gpt-4',
    llmProvider: 'openai',
    
    // Alert Processing
    minHistoricalAlerts: 5,
    maxSilenceDuration: 15,
    learnFromFeedback: true,
    
    // Notification Settings
    slackEnabled: true,
    slackChannel: '#alerts',
    slackWebhook: 'https://hooks.slack.com/services/TXXXXXXXX/YYYYYYYY/ZZZZZZZZZZZZZZZZZZZZZZZZ',
    emailEnabled: false,
    emailRecipients: '',
    
    // UI Settings
    refreshInterval: 60,
    defaultView: 'dashboard',
    theme: 'light'
  });
  
  const toast = useToast();

  // Load settings when component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log('Fetching settings from API');
        const response = await axios.get('/api/alerts/settings');
        console.log('Settings loaded:', response.data);
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings. Using defaults.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
    };
    
    fetchSettings();
  }, [toast]);

  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };

  const handleSaveSettings = async () => {
    try {
      console.log('Saving settings:', settings);
      
      // Save to backend
      const response = await axios.post('/api/alerts/settings', settings);
      console.log('Settings saved:', response.data);
      
      toast({
        title: 'Settings saved',
        description: 'Your settings have been saved successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings: ' + error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  return (
    <Box maxW="1200px" mx="auto">
      <Heading mb={6}>Settings</Heading>
      
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={6}>
        {/* AI Settings */}
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <Card mb={6}>
            <CardHeader pb={0}>
              <Heading size="md">AI Settings</Heading>
            </CardHeader>
            <CardBody>
              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel mb="0">Enable AI-powered alert processing</FormLabel>
                <Switch
                  isChecked={settings.aiEnabled}
                  onChange={(e) => handleSettingChange('aiEnabled', e.target.checked)}
                  colorScheme="blue"
                />
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Confidence Threshold for Auto-Silencing</FormLabel>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Alerts will only be auto-silenced when the AI's confidence exceeds this threshold
                </Text>
                <Flex>
                  <Slider
                    value={settings.confidenceThreshold}
                    min={50}
                    max={99}
                    step={1}
                    onChange={(value) => handleSettingChange('confidenceThreshold', value)}
                    mr={4}
                    flex="1"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <NumberInput
                    maxW="100px"
                    value={settings.confidenceThreshold}
                    min={50}
                    max={99}
                    onChange={(valueString) => handleSettingChange('confidenceThreshold', parseInt(valueString))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text ml={2}>%</Text>
                </Flex>
              </FormControl>
              
              {/* LLM Provider Selection */}
              <FormControl mb={4}>
                <FormLabel>LLM Provider</FormLabel>
                <Select
                  value={settings.llmProvider}
                  onChange={(e) => handleSettingChange('llmProvider', e.target.value)}
                >
                  <option value="openai">OpenAI (Cloud)</option>
                  <option value="groq">Groq (Cloud)</option>
                  <option value="ollama">Ollama (Local)</option>
                  <option value="localai">LocalAI (Local)</option>
                </Select>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  The service provider for language model inference. Local providers run on your
                  infrastructure for privacy and cost benefits.
                </Text>
              </FormControl>
              
              {/* LLM Model Selection */}
              <FormControl mb={4}>
                <FormLabel>LLM Model</FormLabel>
                <Select
                  value={settings.llmModel}
                  onChange={(e) => handleSettingChange('llmModel', e.target.value)}
                >
                  <option value="gpt-4">GPT-4 (Most capable, slower)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, less capable)</option>
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Groq)</option>
                  <option value="llama3">Llama 3 (Local Ollama)</option>
                  <option value="mistral">Mistral (Local Ollama)</option>
                  <option value="phi-2">Phi-2 (Local Ollama)</option>
                  <option value="ggml-gpt4all-j">GPT4All-J (LocalAI)</option>
                </Select>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  The model used for AI analysis and decision making. Different models have 
                  different capabilities and performance characteristics.
                </Text>
              </FormControl>
              
              <Divider my={4} />
              
              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel mb="0">Learn from user feedback</FormLabel>
                <Switch
                  isChecked={settings.learnFromFeedback}
                  onChange={(e) => handleSettingChange('learnFromFeedback', e.target.checked)}
                  colorScheme="blue"
                />
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Minimum Historical Alerts</FormLabel>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Minimum number of historical alerts required before establishing a pattern
                </Text>
                <NumberInput
                  value={settings.minHistoricalAlerts}
                  min={1}
                  max={20}
                  onChange={(valueString) => handleSettingChange('minHistoricalAlerts', parseInt(valueString))}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Maximum Silence Duration (minutes)</FormLabel>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Maximum time an alert can be silenced by the AI
                </Text>
                <NumberInput
                  value={settings.maxSilenceDuration}
                  min={5}
                  max={60}
                  onChange={(valueString) => handleSettingChange('maxSilenceDuration', parseInt(valueString))}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </CardBody>
          </Card>
        </GridItem>
        
        {/* Notification Settings */}
        <GridItem>
          <Card h="100%">
            <CardHeader pb={0}>
              <Heading size="md">Notification Settings</Heading>
            </CardHeader>
            <CardBody>
              <Heading size="sm" mb={4}>Slack</Heading>
              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel mb="0">Enable Slack notifications</FormLabel>
                <Switch
                  isChecked={settings.slackEnabled}
                  onChange={(e) => handleSettingChange('slackEnabled', e.target.checked)}
                  colorScheme="blue"
                />
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Slack Channel</FormLabel>
                <Input
                  value={settings.slackChannel}
                  onChange={(e) => handleSettingChange('slackChannel', e.target.value)}
                  placeholder="#alerts"
                />
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Slack Webhook URL</FormLabel>
                <Input
                  value={settings.slackWebhook}
                  onChange={(e) => handleSettingChange('slackWebhook', e.target.value)}
                  type="password"
                  placeholder="https://hooks.slack.com/services/..."
                />
              </FormControl>
              
              <Divider my={4} />
              
              <Heading size="sm" mb={4}>Email</Heading>
              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel mb="0">Enable Email notifications</FormLabel>
                <Switch
                  isChecked={settings.emailEnabled}
                  onChange={(e) => handleSettingChange('emailEnabled', e.target.checked)}
                  colorScheme="blue"
                />
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Email Recipients</FormLabel>
                <Input
                  value={settings.emailRecipients}
                  onChange={(e) => handleSettingChange('emailRecipients', e.target.value)}
                  placeholder="alerts@example.com, oncall@example.com"
                  isDisabled={!settings.emailEnabled}
                />
              </FormControl>
            </CardBody>
          </Card>
        </GridItem>
        
        {/* UI Settings */}
        <GridItem>
          <Card h="100%">
            <CardHeader pb={0}>
              <Heading size="md">UI Settings</Heading>
            </CardHeader>
            <CardBody>
              <FormControl mb={4}>
                <FormLabel>Dashboard Refresh Interval (seconds)</FormLabel>
                <NumberInput
                  value={settings.refreshInterval}
                  min={10}
                  max={300}
                  step={10}
                  onChange={(valueString) => handleSettingChange('refreshInterval', parseInt(valueString))}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Default View</FormLabel>
                <Select
                  value={settings.defaultView}
                  onChange={(e) => handleSettingChange('defaultView', e.target.value)}
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="alerts">Alerts List</option>
                  <option value="predictions">Predictions</option>
                </Select>
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Theme</FormLabel>
                <Select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Preference</option>
                </Select>
              </FormControl>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      
      <Box textAlign="right" mt={6}>
        <Button colorScheme="blue" size="lg" onClick={handleSaveSettings}>
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;