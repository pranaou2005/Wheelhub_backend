const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Configure Multer for Local Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the "uploads/" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// ✅ Register User
router.post("/register", async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  try {
    if (!["seller", "buyer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Choose 'seller' or 'buyer'." });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, phone, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Update User Profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, bio } = req.body;
    let user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (bio) user.bio = bio;

    await user.save();
    res.json({ message: "Profile updated successfully", user });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Add or Remove Favorite Vehicle
router.post("/favorites/:vehicleId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "buyer") {
      return res.status(403).json({ message: "Only buyers can favorite vehicles" });
    }

    const vehicleId = req.params.vehicleId;
    let user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isFavorited = user.favorites.includes(vehicleId);

    if (isFavorited) {
      user.favorites = user.favorites.filter((id) => id.toString() !== vehicleId);
      await user.save();
      return res.json({ message: "Vehicle removed from favorites", favorites: user.favorites });
    } else {
      user.favorites.push(vehicleId);
      await user.save();
      return res.json({ message: "Vehicle added to favorites", favorites: user.favorites });
    }

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get All Favorite Vehicles
router.get("/favorites", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "buyer") {
      return res.status(403).json({ message: "Only buyers can access favorites" });
    }

    let user = await User.findById(req.user.id).populate("favorites");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ count: user.favorites.length, favorites: user.favorites });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Upload Government ID for Verification
router.post("/upload-id", authMiddleware, upload.single("governmentId"), async (req, res) => {
  try {
    const { idType } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!["Aadhaar", "PAN", "Driver’s License"].includes(idType)) {
      return res.status(400).json({ message: "Invalid ID type" });
    }

    user.governmentId = `/uploads/${req.file.filename}`;
    user.idType = idType;
    await user.save();

    res.json({ message: "ID uploaded successfully", user });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
