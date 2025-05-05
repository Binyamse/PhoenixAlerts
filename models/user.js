// models/user.js - Check for existing mongoose import
// Remove this line if mongoose is already imported elsewhere
// const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Check if mongoose.Schema is available, if not require mongoose
const mongoose = global.mongoose || require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'viewer'],
    default: 'viewer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if User model already exists to avoid overwriting
const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;