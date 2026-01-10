//backend/models/Message.js
const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true },
    user: { type: String, required: true },
    text: { type: String, required: true },

    isAdminReply: { type: Boolean, default: false },
    isBroadcast: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
