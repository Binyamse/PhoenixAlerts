// services/notificationService.js
const axios = require('axios');

/**
 * Sends an alert notification to Slack
 * @param {Object} params - The notification parameters
 * @param {Object} params.alert - The alert object
 * @param {string} params.analysis - The alert analysis text
 * @param {Array<string>} params.debugSteps - The debug steps
 * @returns {Promise<boolean>} - Success status
 */
async function sendSlackNotification({ alert, analysis, debugSteps }) {
  try {
    console.log('sendSlackNotification called with alert:', alert.alertName);
    
    // Check for webhook URL
    if (!process.env.SLACK_WEBHOOK_URL) {
      console.error('SLACK_WEBHOOK_URL environment variable is not set');
      return false;
    }
    
    // Log some basic info about what we're sending
    console.log('Alert ID:', alert._id);
    console.log('Alert name:', alert.alertName);
    console.log('Alert severity:', alert.severity || (alert.labels && alert.labels.severity) || 'unknown');
    
    // Create a short version of the analysis
    const shortAnalysis = analysis ? (analysis.split('.')[0] + '.') : 'No analysis available.';
    
    // Extract severity with fallbacks
    let severity = 'unknown';
    
    // Try different methods to extract severity
    if (alert.severity) {
      severity = alert.severity;
      console.log('Using direct severity property');
    } else if (alert.labels && alert.labels.severity) {
      severity = alert.labels.severity;
      console.log('Using labels.severity property');
    }
    
    // Default to warning if unknown
    if (severity === 'unknown') {
      severity = 'warning';
      console.log('Defaulting to warning severity');
    }
    
    // Get severity emoji
    const severityEmoji = getSeverityEmoji(severity);
    
    // Build app URL for "View Details"
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    
    // Format the slack message
    const message = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🚨 Alert: ${alert.alertName}`,
            emoji: true
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Status:* ${alert.status === 'firing' ? '🔴 Firing' : '✅ Resolved'}`
            },
            {
              type: "mrkdwn",
              text: `*Severity:* ${severityEmoji} ${severity.toUpperCase()}`
            }
          ]
        },
        {
          type: "divider"
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Pod:* \`${alert.podName}\``
            },
            {
              type: "mrkdwn",
              text: `*Namespace:* \`${alert.namespace}\``
            },
            {
              type: "mrkdwn",
              text: `*Cluster:* \`${alert.cluster}\``
            },
            {
              type: "mrkdwn",
              text: `*Started:* <!date^${Math.floor(new Date(alert.startsAt).getTime()/1000)}^{date_short_pretty} at {time}|${new Date(alert.startsAt).toLocaleString()}>`
            }
          ]
        }
      ]
    };

    // Add analysis block if available
    if (shortAnalysis) {
      message.blocks.push({
        type: "context",
        elements: [
          {
            type: "image",
            image_url: "https://api.slack.com/img/blocks/bkb_template_images/approvalsNewDevice.png",
            alt_text: "Alert Analysis"
          },
          {
            type: "mrkdwn",
            text: `*Alert Analysis*: ${shortAnalysis}`
          }
        ]
      });
    }

    // Add divider and actions
    message.blocks.push(
      {
        type: "divider"
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "🔍 View Details",
              emoji: true
            },
            style: "primary",
            url: `${appUrl}/alerts/${alert._id}`,
            value: "view_details"
          }
        ]
      }
    );

    // Add annotations if available
    if (alert.annotations && alert.annotations.summary) {
      // Insert after the status section (index 2, after the divider)
      message.blocks.splice(3, 0, {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Summary:* ${alert.annotations.summary}`
        }
      });
    }

    console.log('Sending to Slack webhook');
    
    // Send to Slack webhook with timeout and proper headers
    const response = await axios.post(process.env.SLACK_WEBHOOK_URL, message, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Slack API response status:', response.status);
    return response.status === 200;
  } catch (error) {
    console.error('Error sending Slack notification:', error.message);
    
    if (error.response) {
      console.error('Slack API error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    // Try a simple fallback message
    try {
      console.log('Attempting simplified notification as fallback');
      const simpleMessage = { 
        text: `🚨 ALERT: ${alert.alertName} - ${alert.namespace}/${alert.podName} - Severity: ${
          alert.severity || (alert.labels && alert.labels.severity) || 'unknown'
        }` 
      };
      const fallbackResponse = await axios.post(process.env.SLACK_WEBHOOK_URL, simpleMessage, {
        timeout: 5000
      });
      console.log('Fallback notification status:', fallbackResponse.status);
      return fallbackResponse.status === 200;
    } catch (fallbackError) {
      console.error('Even fallback notification failed:', fallbackError.message);
      return false;
    }
  }
}

// Helper function to get severity emoji
function getSeverityEmoji(severity) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return '🔥';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '⚠️';
  }
}

// Simple test function to verify webhook connectivity
async function testWebhook() {
  try {
    if (!process.env.SLACK_WEBHOOK_URL) {
      console.error('SLACK_WEBHOOK_URL environment variable is not set');
      return false;
    }
    
    const testMessage = { text: "Test notification from alert system" };
    const response = await axios.post(process.env.SLACK_WEBHOOK_URL, testMessage, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    console.error('Test webhook failed:', error.message);
    return false;
  }
}

// Export functions - IMPORTANT: Make sure these are properly exported
module.exports = {
  sendSlackNotification,
  testWebhook
};