const express = require("express");
const Chat = require("../models/Chat");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Start or Get an Existing Chat
router.post("/start", authMiddleware, async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    // Prevent duplicate chats
    let chat = await Chat.findOne({ participants: { $all: [senderId, receiverId] } });

    if (!chat) {
      chat = new Chat({ participants: [senderId, receiverId], messages: [] });
      await chat.save();
    }

    res.json({ message: "Chat started successfully", chat });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Send a Message
router.post("/send/:chatId", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.messages.push({ senderId: req.user.id, text });
    await chat.save();

    res.json({ message: "Message sent", chat });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get All Chats for a User
router.get("/", authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate("participants", "name email");

    res.json({ count: chats.length, chats });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get a Single Chat by ID
router.get("/:chatId", authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("messages.senderId", "name");

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    res.json(chat);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Mark a Message as Important
router.put("/important/:chatId/:messageId", authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    let message = chat.messages.id(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.isImportant = true;
    await chat.save();

    res.json({ message: "Message marked as important", chat });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Soft Delete a Chat
router.delete("/:chatId", authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.isDeleted = true;
    await chat.save();

    res.json({ message: "Chat deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
