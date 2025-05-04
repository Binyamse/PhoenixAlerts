// services/alertProcessor.js
const Alert = require('../models/alert');
const { sendSlackNotification } = require('./notificationService');
const { shouldSilenceAlert } = require('./decisionService');
const LLMService = require('./llmService');
const llmConfig = require('../config/llm-config');

// Initialize LLM service
const llmProvider = process.env.LLM_PROVIDER || llmConfig.defaultProvider;
const llmService = new LLMService({
  provider: llmProvider,
  endpoint: process.env.OLLAMA_ENDPOINT || process.env.LOCALAI_ENDPOINT,
  apiKey: process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY,
  model: process.env.OLLAMA_MODEL || process.env.OPENAI_MODEL || process.env.GROQ_MODEL || process.env.LOCALAI_MODEL
});

/**
 * Process alerts from Prometheus AlertManager
 * @param {Array} alerts - Array of alerts from AlertManager
 */
async function processAlerts(alerts) {
  console.log(`Processing ${alerts.length} alerts with alert processor`);
  
  for (const alert of alerts) {
    try {
      console.log(`Processing alert: ${alert.labels?.alertname || 'unknown'}`);
      
      // Extract relevant information
      const alertData = {
        alertName: alert.labels?.alertname,
        status: alert.status,
        labels: alert.labels,
        severity: alert.labels?.severity || 'warning', // Explicitly extract and set default
        annotations: alert.annotations,
        startsAt: new Date(alert.startsAt),
        endsAt: alert.endsAt ? new Date(alert.endsAt) : null,
        podName: alert.labels?.pod || 'unknown',
        namespace: alert.labels?.namespace || 'unknown',
        cluster: alert.labels?.cluster || 'unknown'
      };

      console.log(`Alert data prepared with severity: ${alertData.severity}`);

      // Calculate duration if alert is resolved
      if (alertData.status === 'resolved' && alertData.endsAt) {
        alertData.duration = (alertData.endsAt - alertData.startsAt) / 1000; // in seconds
        console.log(`Alert duration calculated: ${alertData.duration} seconds`);
      }

      // Check if alert should be silenced based on historical patterns
      console.log('Checking if alert should be silenced...');
      const silenceDecision = await shouldSilenceAlert(alertData);
      alertData.silenced = silenceDecision.silenced;
      alertData.silenceReason = silenceDecision.reason;
      console.log(`Silence decision: ${alertData.silenced ? 'SILENCED' : 'NOT SILENCED'} - Reason: ${alertData.silenceReason}`);

      // Get LLM analysis
      console.log('Getting LLM analysis...');
      try {
        // Use the analyzeAlert method from the LLMService instance
        alertData.llmAnalysis = await llmService.analyzeAlert(alertData);
        console.log('LLM analysis completed successfully');
        
        // Generate debugging steps if alert is not silenced
        if (!alertData.silenced) {
          console.log('Generating debug steps...');
          alertData.debugSteps = await llmService.generateDebugSteps(alertData);
          console.log(`Generated ${alertData.debugSteps?.length || 0} debug steps`);
        } else {
          console.log('Alert is silenced, skipping debug steps generation');
          alertData.debugSteps = [];
        }
      } catch (llmError) {
        console.error('Error during LLM processing:', llmError);
        alertData.llmAnalysis = 'Unable to generate analysis due to an error.';
        alertData.debugSteps = ['Check pod logs', 'Check pod events', 'Check node status'];
      }

      // Save alert to database
      console.log('Creating alert record for database...');
      const alertRecord = new Alert(alertData);
      console.log('Alert model created, saving to database...');
      const savedAlert = await alertRecord.save();
      console.log(`Alert saved to database with ID: ${savedAlert._id}`);

      // Notify if not silenced
      console.log('Checking if notification should be sent...');
      if (!alertData.silenced) {
        console.log('Alert is NOT silenced - preparing notification...');
        try {
          console.log('About to call sendSlackNotification...');
          const notificationResult = await sendSlackNotification({
            alert: alertData,
            analysis: alertData.llmAnalysis,
            debugSteps: alertData.debugSteps
          });
          console.log('Notification completed with result:', notificationResult);
        } catch (notificationError) {
          console.error('ERROR IN NOTIFICATION:', notificationError);
          console.error('Notification error stack:', notificationError.stack);
        }
      } else {
        console.log('Alert is SILENCED - skipping notification');
      }
      
      console.log(`Alert ${alertData.alertName} processing completed successfully`);
    } catch (error) {
      console.error('ERROR PROCESSING ALERT:', error);
      console.error('Error stack:', error.stack);
    }
  }
  
  console.log('All alerts processed');
}

module.exports = { processAlerts };