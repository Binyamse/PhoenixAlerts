// routes/dashboardRoutes.js
const express = require('express');
const Alert = require('../models/alert');
const router = express.Router();

// Get alert activity for last 24 hours
router.get('/activity', async (req, res) => {
  try {
    // Log the current time for debugging
    console.log('Current server time:', new Date());
    
    // Make the filter more lenient - look at the last 30 days instead of 24 hours
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    
    console.log('Looking for alerts since:', lastMonth);
    
    // First, check if we have any alerts at all
    const totalAlerts = await Alert.countDocuments();
    console.log('Total alerts in database:', totalAlerts);
    
    // Then check how many fall within our time window
    const recentAlerts = await Alert.countDocuments({ startsAt: { $gte: lastMonth } });
    console.log('Alerts in last 30 days:', recentAlerts);
    
    // Get alert counts by hour and severity
    const hourlyAlerts = await Alert.aggregate([
      {
        $match: {
          startsAt: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$startsAt' },
            severity: { $ifNull: ['$severity', '$labels.severity'] } // Try both severity fields
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.hour': 1 }
      }
    ]);
    
    console.log('Hourly alerts data:', JSON.stringify(hourlyAlerts, null, 2));
    
    // Get counts by severity with fallbacks
    const severityCounts = await Alert.aggregate([
      {
        $project: {
          // Use either direct severity field or from labels
          effectiveSeverity: { 
            $cond: { 
              if: { $ifNull: ['$severity', false] }, 
              then: '$severity', 
              else: { $ifNull: ['$labels.severity', 'unknown'] } 
            } 
          }
        }
      },
      {
        $group: {
          _id: '$effectiveSeverity',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('Severity counts:', JSON.stringify(severityCounts, null, 2));
    
    // Get most affected namespaces
    const namespaces = await Alert.aggregate([
      {
        $group: {
          _id: '$namespace',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Get counts by cluster
    const clusters = await Alert.aggregate([
      {
        $group: {
          _id: '$cluster',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json({
      hourlyAlerts,
      severityCounts,
      namespaces,
      clusters,
      totalAlerts
    });
  } catch (error) {
    console.error('Error fetching alert activity:', error);
    res.status(500).json({ message: 'Error fetching alert activity' });
  }
});

// Get alert predictions
router.get('/predictions', async (req, res) => {
  try {
    // Use a longer timeframe to ensure we have data
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    // Get historical alert patterns by hour and day
    const alertPatterns = await Alert.aggregate([
      {
        $match: {
          startsAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$startsAt' },
            day: { $dayOfWeek: '$startsAt' },
            namespace: '$namespace'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Identify recurring patterns (patterns that occur more than twice)
    const recurringPatterns = alertPatterns.filter(pattern => pattern.count > 2);
    
    // Get pods with most alerts
    const problematicPods = await Alert.aggregate([
      {
        $group: {
          _id: '$podName',
          namespace: { $first: '$namespace' },
          cluster: { $first: '$cluster' },
          count: { $sum: 1 },
          lastAlert: { $max: '$startsAt' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Simple prediction model based on historical patterns
    const predictions = [];
    
    // Current hour and day
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay() + 1; // MongoDB uses 1-7 for days of week
    
    // Look for patterns that match current time context
    for (const pattern of recurringPatterns) {
      if (pattern._id.hour === currentHour || 
          pattern._id.day === currentDay) {
        
        // Calculate prediction confidence based on frequency
        const confidence = Math.min(90, Math.round((pattern.count / 7) * 100));
        
        if (confidence > 30) {
          predictions.push({
            namespace: pattern._id.namespace,
            likelihood: confidence,
            timeContext: pattern._id.hour === currentHour ? 'hour' : 'day',
            message: `Alert pattern detected in namespace ${pattern._id.namespace} during this ${pattern._id.hour === currentHour ? 'hour' : 'day'}`
          });
        }
      }
    }
    
    // Add predictions based on problematic pods
    for (const pod of problematicPods) {
      // Only include if pod has had multiple alerts
      if (pod.count > 3) {
        const hoursSinceLastAlert = Math.round((now - new Date(pod.lastAlert)) / (1000 * 60 * 60));
        
        // If it's been a while since the last alert, it might be due soon
        if (hoursSinceLastAlert > 12 && hoursSinceLastAlert < 24) {
          predictions.push({
            pod: pod._id,
            namespace: pod.namespace,
            likelihood: Math.min(85, Math.round(pod.count * 10)),
            message: `Pod ${pod._id} has a history of alerts (${pod.count} in past week) and may be due for another alert soon`
          });
        }
      }
    }
    
    // Count alerts by alert type
    const alertTypes = await Alert.aggregate([
      {
        $group: {
          _id: '$alertName',
          count: { $sum: 1 },
          lastSeen: { $max: '$startsAt' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Count total alerts
    const totalAlerts = await Alert.countDocuments();
    
    res.json({
      predictions: predictions.sort((a, b) => b.likelihood - a.likelihood),
      historicalPatterns: {
        recurringPatterns,
        problematicPods,
        alertTypes
      },
      totalAlerts
    });
  } catch (error) {
    console.error('Error generating predictions:', error);
    res.status(500).json({ message: 'Error generating predictions' });
  }
});

// Add a debugging endpoint
router.get('/debug', async (req, res) => {
  try {
    const alerts = await Alert.find().limit(5);
    const total = await Alert.countDocuments();
    
    // Check what fields are available in the alerts
    const fields = {};
    alerts.forEach(alert => {
      Object.keys(alert._doc).forEach(key => {
        fields[key] = (fields[key] || 0) + 1;
      });
    });
    
    // Check severity field specifically
    const severityInfo = await Alert.aggregate([
      {
        $project: {
          hasSeverity: { $cond: [{ $ifNull: ['$severity', false] }, true, false] },
          hasLabelsSeverity: { $cond: [{ $ifNull: ['$labels.severity', false] }, true, false] }
        }
      },
      {
        $group: {
          _id: null,
          withSeverity: { $sum: { $cond: ['$hasSeverity', 1, 0] } },
          withLabelsSeverity: { $sum: { $cond: ['$hasLabelsSeverity', 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      totalAlerts: total,
      sampleAlerts: alerts,
      fieldCounts: fields,
      severityInfo: severityInfo[0]
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ message: 'Error in debug endpoint', error: error.toString() });
  }
});

module.exports = router;