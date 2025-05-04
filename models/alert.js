// ================ ALERT PROCESSING LOGIC ================

// models/alert.js
const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  alertName: String,
  status: String, // firing, resolved
  labels: Map,
  annotations: Map,
  startsAt: Date,
  endsAt: Date,
  duration: Number,
  silenced: Boolean,
  silenceReason: String,
  podName: String,
  namespace: String,
  cluster: String,
  llmAnalysis: String,
  debugSteps: [String],
  feedback: {
    correct: Boolean,
    comments: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Alert = mongoose.model('Alert', AlertSchema);
module.exports = Alert;