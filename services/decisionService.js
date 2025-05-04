const Alert = require('../models/alert');

async function shouldSilenceAlert(alertData) {
  // Get historical data for similar alerts
  const historicalAlerts = await Alert.find({
    alertName: alertData.alertName,
    podName: alertData.podName,
    namespace: alertData.namespace,
    status: 'resolved'
  }).sort({ createdAt: -1 }).limit(20);

  // If no historical data, don't silence
  if (historicalAlerts.length < 5) {
    return { silenced: false, reason: 'Insufficient historical data' };
  }

  // Check for pattern of quick resolutions
  const quickResolutions = historicalAlerts.filter(alert => alert.duration && alert.duration < 600); // less than 10 minutes
  if (quickResolutions.length >= 3) {
    // Check if this alert occurs regularly on this day of week
    const today = new Date().getDay();
    const sameWeekdayAlerts = historicalAlerts.filter(alert => new Date(alert.startsAt).getDay() === today);
    
    if (sameWeekdayAlerts.length >= 2) {
      return { 
        silenced: true, 
        reason: `Pattern detected: ${alertData.alertName} on ${alertData.podName} regularly self-resolves on this day of week within 10 minutes`
      };
    }
  }

  // Check for time-of-day patterns (e.g. during known maintenance windows)
  const currentHour = new Date().getHours();
  const sameHourAlerts = historicalAlerts.filter(alert => new Date(alert.startsAt).getHours() === currentHour);
  
  if (sameHourAlerts.length >= 3 && historicalAlerts.every(alert => alert.duration < 900)) { // all resolve within 15 minutes
    return { 
      silenced: true, 
      reason: `Pattern detected: ${alertData.alertName} regularly self-resolves during this hour of the day`
    };
  }

  return { silenced: false, reason: 'No silencing pattern detected' };
}

module.exports = { shouldSilenceAlert };
