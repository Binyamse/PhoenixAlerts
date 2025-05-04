// notificationTest.js
// A standalone script to test if your notification service works correctly

// Import the notification service
const { sendSlackNotification, testSlackWebhook } = require('./services/notificationService');

// Create a mock alert object that matches the expected structure
const mockAlert = {
  _id: 'test-id-123',
  alertName: 'TEST_ALERT',
  status: 'firing',
  severity: 'warning',
  labels: {
    severity: 'warning',
    alertname: 'TEST_ALERT',
    namespace: 'default',
    pod: 'test-pod',
    cluster: 'test-cluster'
  },
  podName: 'test-pod',
  namespace: 'default',
  cluster: 'test-cluster',
  startsAt: new Date(),
  annotations: {
    summary: 'Test alert summary'
  }
};

// Create mock analysis and debug steps
const mockAnalysis = 'This is a test alert for debugging the notification service.';
const mockDebugSteps = [
  'Debug step 1: Check that notifications are working',
  'Debug step 2: Verify webhook URL is correct'
];

// Function to run the tests
async function runTests() {
  console.log('Starting notification service tests...');
  
  console.log('Environment check:');
  if (!process.env.SLACK_WEBHOOK_URL) {
    console.error('ERROR: SLACK_WEBHOOK_URL environment variable is not set!');
    console.log('Please set the SLACK_WEBHOOK_URL environment variable and try again.');
    process.exit(1);
  }
  
  console.log('SLACK_WEBHOOK_URL is set:', !!process.env.SLACK_WEBHOOK_URL);
  console.log('First 15 chars of webhook URL:', process.env.SLACK_WEBHOOK_URL.substring(0, 15) + '...');
  
  // First test: simple webhook test
  console.log('\n===== Test 1: Basic Webhook Test =====');
  try {
    console.log('Running basic webhook test...');
    const basicResult = await testSlackWebhook();
    console.log('Basic webhook test result:', basicResult);
  } catch (error) {
    console.error('Basic webhook test failed with error:', error.message);
    console.error('Error details:', error);
  }
  
  // Second test: full notification
  console.log('\n===== Test 2: Full Notification Test =====');
  try {
    console.log('Sending full test notification...');
    const fullResult = await sendSlackNotification({
      alert: mockAlert,
      analysis: mockAnalysis,
      debugSteps: mockDebugSteps
    });
    console.log('Full notification test result:', fullResult);
  } catch (error) {
    console.error('Full notification test failed with error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Try direct axios as last resort
    console.log('\n===== Fallback Test: Direct Axios Request =====');
    try {
      const axios = require('axios');
      console.log('Sending direct axios request to webhook...');
      const response = await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: 'Direct test message from notification test script'
      });
      console.log('Direct axios result:', response.status, response.statusText);
    } catch (axiosError) {
      console.error('Even direct axios request failed:', axiosError.message);
    }
  }
}

// Run the tests
runTests().then(() => {
  console.log('All tests completed.');
}).catch(error => {
  console.error('Test execution failed:', error);
});