// routes/authRoutes.js
const express = require('express');
// Check if jwt is already defined globally
let jwt;
try {
  jwt = global.jwt || require('jsonwebtoken');
  // Make jwt available globally to avoid redeclaration
  global.jwt = jwt;
} catch (error) {
  // If there's an error, just require it normally
  jwt = require('jsonwebtoken');
}

const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeMe!Now123';
    
    // Simple credential check
    if (username === adminUsername && password === adminPassword) {
      // Generate token
      const jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
      const token = jwt.sign(
        { username: adminUsername, role: 'admin' },
        jwtSecret,
        { expiresIn: '1d' }
      );
      
      res.json({
        message: 'Login successful',
        user: {
          username: adminUsername,
          role: 'admin'
        },
        token
      });
    } else {
      // Unauthorized
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    username: req.user.username,
    role: req.user.role
  });
});

// Logout (client-side only)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;