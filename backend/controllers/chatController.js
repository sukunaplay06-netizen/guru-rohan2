const Message = require('../models/Message');

// ================================
// GET chat messages (room wise)
// ================================
const getMessages = async (req, res) => {
  try {
    const { room, limit = 50 } = req.query;

    if (!room) {
      return res.status(400).json({ message: 'Room is required' });
    }

    const messages = await Message.find({ room })
      .sort({ createdAt: 1 })
      .limit(parseInt(limit));

    const formattedMessages = messages.map(m => ({
      _id: m._id,
      room: m.room,
      userName: m.user,
      message: m.text,
      timestamp: m.createdAt.getTime(),
      isAdminReply: m.isAdminReply,
      isBroadcast: m.isBroadcast,
    }));

    res.json({ success: true, messages: formattedMessages });
  } catch (err) {
    console.error('❌ getMessages error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ================================
// POST message (user / admin)
// ================================
const postMessage = async (req, res) => {
  try {
    const { user, text, room, isAdmin } = req.body;

    if (!room || !text) {
      return res.status(400).json({ message: 'Room & text required' });
    }

    const newMessage = await Message.create({
      user,
      text,
      room,
      isAdminReply: isAdmin === true,
    });

    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    console.error('❌ postMessage error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ================================
// ADMIN broadcast message
// ================================
const adminBroadcast = async (req, res) => {
  try {
    const { adminName, message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message required' });
    }

    const newMessage = await Message.create({
      user: adminName || 'Admin',
      text: message,
      room: 'general',          // 🔥 socket.io ke saath match
      isBroadcast: true,
      isAdminReply: true,
    });

    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    console.error('❌ adminBroadcast error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getMessages,
  postMessage,
  adminBroadcast,
};
