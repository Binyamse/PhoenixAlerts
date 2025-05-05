// middleware/auth.js
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

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Get JWT_SECRET from environment variable
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
    
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;