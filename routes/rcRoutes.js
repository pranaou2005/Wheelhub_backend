const express = require("express");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware"); // Import JWT auth
const RC = require("../models/RC");

const router = express.Router();

// ✅ Configure Multer for RC Book Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/rcbooks/"); // Save RC books in "uploads/rcbooks/" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage });

// ✅ Upload RC Book
router.post("/upload", authMiddleware, upload.single("rcBook"), async (req, res) => {
  try {
    const { regNumber } = req.body;

    if (!regNumber) {
      return res.status(400).json({ message: "Registration number is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "RC book file is required" });
    }

    // Check if RC number already exists
    const existingRC = await RC.findOne({ regNumber });
    if (existingRC) {
      return res.status(400).json({ message: "RC Number already exists" });
    }

    // Save RC details
    const newRC = new RC({
      userId: req.user.id,
      regNumber,
      rcBookPath: `/uploads/rcbooks/${req.file.filename}`
    });

    await newRC.save();
    res.status(201).json({ message: "RC Book uploaded successfully", rc: newRC });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Fetch Uploaded RC Book for a User
router.get("/my-rc", authMiddleware, async (req, res) => {
  try {
    const rc = await RC.findOne({ userId: req.user.id });

    if (!rc) {
      return res.status(404).json({ message: "No RC book found" });
    }

    res.json(rc);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Serve Uploaded Files as Static Resources
router.use("/uploads/rcbooks", express.static("uploads/rcbooks"));

module.exports = router;
