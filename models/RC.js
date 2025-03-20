const mongoose = require("mongoose");

const RCSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who uploaded
  regNumber: { type: String, required: true, unique: true }, // Registration number
  rcBookPath: { type: String, required: true }, // Path to uploaded RC book
  uploadedAt: { type: Date, default: Date.now } // Timestamp
});

module.exports = mongoose.model("RC", RCSchema);
