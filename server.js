// server.js - Main Express application

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Authentication configuration
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeMe!Now123';

// Log authentication settings (excluding sensitive values)
console.log('Authentication enabled with environment variables');
console.log(`Admin username set: ${ADMIN_USERNAME}`);
console.log('JWT_SECRET is ' + (JWT_SECRET === 'default-secret-key-change-in-production' ? 'using DEFAULT value - not secure for production!' : 'configured from environment'));

// Make JWT secret available to other modules
process.env.JWT_SECRET = JWT_SECRET;

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import routes and services
const alertRoutes = require('./routes/alertRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/auth');
const LLMService = require('./services/llmService');
const llmConfig = require('./config/llm-config');
const { processAlerts } = require('./services/alertProcessor');

// Initialize LLM service based on provider
const llmProvider = process.env.LLM_PROVIDER || llmConfig.defaultProvider;
console.log(`Using LLM Provider: ${llmProvider}`);

// Only initialize OpenAI if it's the selected provider
let openai = null;
if (llmProvider === 'openai') {
  const { OpenAI } = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alert-manager')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Authentication routes - no auth required for these
app.use('/api/auth', authRoutes);

// Protected API routes
app.use('/api/alerts', authMiddleware, alertRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Add stats routes for the dashboard (protected)
app.get('/api/alerts/stats/total', authMiddleware, async (req, res) => {
  try {
    const Alert = require('./models/alert');
    const count = await Alert.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching total alert stats:', error);
    res.status(500).json({ message: 'Error fetching alert stats' });
  }
});

app.get('/api/alerts/stats/critical', authMiddleware, async (req, res) => {
  try {
    const Alert = require('./models/alert');
    const count = await Alert.countDocuments({ 
      $or: [
        { severity: 'critical' },
        { 'labels.severity': 'critical' }
      ] 
    });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching critical alert stats:', error);
    res.status(500).json({ message: 'Error fetching alert stats' });
  }
});

app.get('/api/alerts/stats/active', authMiddleware, async (req, res) => {
  try {
    const Alert = require('./models/alert');
    const count = await Alert.countDocuments({ 
      status: 'firing',
      silenced: false
    });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching active alert stats:', error);
    res.status(500).json({ message: 'Error fetching alert stats' });
  }
});

app.get('/api/alerts/stats/silenced', authMiddleware, async (req, res) => {
  try {
    const Alert = require('./models/alert');
    const count = await Alert.countDocuments({ silenced: true });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching silenced alert stats:', error);
    res.status(500).json({ message: 'Error fetching alert stats' });
  }
});

// Webhook endpoint for Prometheus Alert Manager (not protected)
app.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook received at:', new Date().toISOString());
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const alerts = req.body.alerts;
    if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
      console.log('No valid alerts received');
      return res.status(400).send('No valid alerts in request');
    }
    
    console.log(`Processing ${alerts.length} alerts`);
    
    try {
      // Process alerts using the dedicated alert processor service
      await processAlerts(alerts);
      console.log('All alerts processed successfully via alert processor');
    } catch (processingError) {
      console.error('Error in alert processor:', processingError);
      if (processingError.stack) {
        console.error('Stack trace:', processingError.stack);
      }
      throw new Error('Alert processing failed: ' + processingError.message);
    }
    
    res.status(200).send('Alerts processed');
  } catch (error) {
    console.error('Error processing alerts:', error);
    res.status(500).send('Error processing alerts: ' + error.message);
  }
});

// API endpoint to test alert creation (protected)
app.get('/api/test-alert', authMiddleware, async (req, res) => {
  try {
    const Alert = require('./models/alert');
    
    const testAlert = new Alert({
      alertName: 'TestAlert',
      status: 'firing',
      labels: {
        alertname: 'TestAlert',
        namespace: 'default',
        pod: 'test-pod',
        severity: 'critical'
      },
      annotations: {
        summary: 'Test alert',
        description: 'This is a test alert created via API'
      },
      startsAt: new Date(),
      podName: 'test-pod',
      namespace: 'default',
      cluster: 'test-cluster',
      llmAnalysis: 'This is a test alert for debugging purposes.',
      debugSteps: ['Step 1', 'Step 2', 'Step 3'],
      silenced: false
    });
    
    const savedAlert = await testAlert.save();
    console.log('Test alert created:', savedAlert._id);
    
    // Optionally send a notification for the test alert
    try {
      const { sendSlackNotification } = require('./services/notificationService');
      const notificationResult = await sendSlackNotification({
        alert: savedAlert,
        analysis: savedAlert.llmAnalysis,
        debugSteps: savedAlert.debugSteps
      });
      console.log('Test notification result:', notificationResult);
    } catch (notifyError) {
      console.error('Error sending test notification:', notifyError);
    }
    
    res.json({
      success: true,
      message: 'Test alert created',
      alertId: savedAlert._id,
      notificationSent: true
    });
  } catch (error) {
    console.error('Error creating test alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating test alert',
      error: error.message
    });
  }
});

// Serve static files from the React app
app.use(express.static('client/build'));

// The "catchall" handler for any request that doesn't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});