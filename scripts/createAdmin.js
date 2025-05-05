// scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alert-manager');
    console.log('Connected to MongoDB');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user with default password (should be changed immediately)
    const adminUser = new User({
      username: 'admin',
      password: process.env.INITIAL_ADMIN_PASSWORD || 'changeMe!Now123',
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();