const express = require('express');
const router = express.Router();
const { login, verifyToken } = require('../middleware/auth');

// POST login
router.post('/login', login);

// GET verify token
router.get('/verify', verifyToken);

module.exports = router;
