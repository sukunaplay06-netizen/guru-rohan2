const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  ip: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  page: String,
  isUniqueToday: { type: Boolean, default: true },
});

module.exports = mongoose.model("Visitor", visitorSchema);
