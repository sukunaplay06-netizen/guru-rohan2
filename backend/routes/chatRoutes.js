const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const {
  getMessages,
  postMessage,
  adminBroadcast,
} = require('../controllers/chatController');

// ================================
// Admin authentication middleware
// ================================
const authAdmin = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin only' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ================================
// Routes
// ================================

// Chat history (admin only)
router.get('/messages', authAdmin, getMessages);

// Save message (user or admin – optional use)
router.post('/send', postMessage);

// Admin broadcast (admin only)
router.post('/broadcast', authAdmin, adminBroadcast);

module.exports = router;
