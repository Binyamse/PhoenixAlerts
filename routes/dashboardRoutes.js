// routes/dashboardRoutes.js
const express = require('express');
const Alert = require('../models/alert');
const router = express.Router();

// Get alert activity for last 24 hours
router.get('/activity', async (req, res) => {
  try {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    // Get alert counts by hour and severity
    const hourlyAlerts = await Alert.aggregate([
      {
        $match: {
          startsAt: { $gte: last24Hours }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$startsAt' },
            severity: '$severity'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.hour': 1 }
      }
    ]);
    
    // Get counts by severity
    const severityCounts = await Alert.aggregate([
      {
        $match: {
          startsAt: { $gte: last24Hours }
        }
      },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get most affected namespaces
    const namespaces = await Alert.aggregate([
      {
        $match: {
          startsAt: { $gte: last24Hours }
        }
      },
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
        $match: {
          startsAt: { $gte: last24Hours }
        }
      },
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
      totalAlerts: await Alert.countDocuments({ startsAt: { $gte: last24Hours } })
    });
  } catch (error) {
    console.error('Error fetching alert activity:', error);
    res.status(500).json({ message: 'Error fetching alert activity' });
  }
});

// Get alert predictions
router.get('/predictions', async (req, res) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    // Get historical alert patterns by hour and day
    const alertPatterns = await Alert.aggregate([
      {
        $match: {
          startsAt: { $gte: last7Days }
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
        $match: {
          startsAt: { $gte: last7Days }
        }
      },
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
        $match: {
          startsAt: { $gte: last7Days }
        }
      },
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
    
    res.json({
      predictions: predictions.sort((a, b) => b.likelihood - a.likelihood),
      historicalPatterns: {
        recurringPatterns,
        problematicPods,
        alertTypes
      }
    });
  } catch (error) {
    console.error('Error generating predictions:', error);
    res.status(500).json({ message: 'Error generating predictions' });
  }
});

module.exports = router;