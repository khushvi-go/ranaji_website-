const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT Authentication Middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// Admin Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if credentials match environment variables
    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // For initial setup, compare plain password
    // In production, use bcrypt.compare(password, hashedPassword)
    const isMatch = password === 'ranaji123'; // Temporary plain text check
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        username,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        username,
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Verify token endpoint
const verifyToken = (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.json({ success: false, valid: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ 
      success: true, 
      valid: true,
      user: decoded 
    });
  } catch (error) {
    res.json({ success: false, valid: false });
  }
};

module.exports = {
  authenticate,
  login,
  verifyToken
};
