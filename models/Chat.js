const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      isImportant: { type: Boolean, default: false } // Mark messages as important
    }
  ],
  isDeleted: { type: Boolean, default: false } // Soft delete
}, { timestamps: true });

module.exports = mongoose.model("Chat", ChatSchema);
