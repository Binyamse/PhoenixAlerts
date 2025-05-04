// models/settings.js
const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  // AI Settings
  aiEnabled: { type: Boolean, default: true },
  confidenceThreshold: { type: Number, default: 75 },
  llmModel: { type: String, default: 'gpt-4' },
  llmProvider: { type: String, default: 'openai' },
  
  // Alert Processing
  minHistoricalAlerts: { type: Number, default: 5 },
  maxSilenceDuration: { type: Number, default: 15 },
  learnFromFeedback: { type: Boolean, default: true },
  
  // Notification Settings
  slackEnabled: { type: Boolean, default: true },
  slackChannel: { type: String, default: '#alerts' },
  slackWebhook: String,
  emailEnabled: { type: Boolean, default: false },
  emailRecipients: String,
  
  // UI Settings
  refreshInterval: { type: Number, default: 60 },
  defaultView: { type: String, default: 'dashboard' },
  theme: { type: String, default: 'light' },
  
  // Last updated
  updatedAt: { type: Date, default: Date.now }
});

const Settings = mongoose.model('Settings', SettingsSchema);
module.exports = Settings;