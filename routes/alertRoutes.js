// routes/alertRoutes.js
const express = require('express');
const router = express.Router();
const Alert = require('../models/alert');
const Settings = require('../models/settings');

// Get all alerts with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Alert.countDocuments();
    
    res.json({
      alerts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get alert statistics - MOVED BEFORE /:id
router.get('/stats/summary', async (req, res) => {
  try {
    const totalAlerts = await Alert.countDocuments();
    const firingAlerts = await Alert.countDocuments({ status: 'firing' });
    const silencedAlerts = await Alert.countDocuments({ silenced: true });
    const resolvedAlerts = await Alert.countDocuments({ status: 'resolved' });
    
    // Get top alert types
    const topAlertTypes = await Alert.aggregate([
      { $group: { _id: '$alertName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Get resolution time statistics
    const resolutionStats = await Alert.aggregate([
      { $match: { duration: { $exists: true, $ne: null } } },
      { 
        $group: { 
          _id: null, 
          avgResolutionTime: { $avg: '$duration' },
          minResolutionTime: { $min: '$duration' },
          maxResolutionTime: { $max: '$duration' }
        } 
      }
    ]);
    
    res.json({
      totalAlerts,
      firingAlerts,
      silencedAlerts,
      resolvedAlerts,
      topAlertTypes,
      resolutionStats: resolutionStats[0] || { avgResolutionTime: 0, minResolutionTime: 0, maxResolutionTime: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get settings - MOVED BEFORE /:id
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update settings - MOVED BEFORE /:id
router.post('/settings', async (req, res) => {
  try {
    console.log('Received settings update:', req.body);
    
    // Get current settings or create new ones
    let settings = await Settings.findOne({});
    
    if (settings) {
      // Update existing settings
      Object.assign(settings, req.body);
      settings.updatedAt = new Date();
      await settings.save();
      console.log('Updated existing settings:', settings._id);
    } else {
      // Create new settings
      settings = new Settings(req.body);
      await settings.save();
      console.log('Created new settings from POST:', settings._id);
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get alert by ID - MOVED AFTER specific routes
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit feedback for an alert
router.post('/:id/feedback', async (req, res) => {
  try {
    const { correct, comments } = req.body;
    console.log(`Receiving feedback for alert ${req.params.id}:`, { correct, comments });
    
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { 
        feedback: { correct, comments }
      },
      { new: true }
    );
    
    if (!alert) {
      console.log(`Alert not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    console.log(`Alert updated with feedback: ${alert._id}`);
    res.json(alert);
  } catch (error) {
    console.error('Error updating alert feedback:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;