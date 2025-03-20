const express = require("express");
const Review = require("../models/Review");
const User = require("../models/User"); // ✅ Import User model
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Add a Review (Only buyers can submit reviews)
router.post("/add", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "buyer") {
      return res.status(403).json({ message: "Only buyers can leave reviews" });
    }

    const { vehicleId, reviewText, rating } = req.body;

    if (!vehicleId || !reviewText || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // ✅ Fetch user details from the database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Create and save the review with the correct userName
    const review = new Review({
      userId: req.user.id,
      userName: user.name, // ✅ Get userName from the database
      vehicleId,
      reviewText,
      rating,
    });

    await review.save();
    res.status(201).json({ message: "Review added successfully", review });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get All Reviews for a Vehicle
router.get("/:vehicleId", async (req, res) => {
  try {
    const reviews = await Review.find({ vehicleId: req.params.vehicleId }).sort({ createdAt: -1 });

    if (!reviews.length) {
      return res.status(404).json({ message: "No reviews found for this vehicle" });
    }

    res.json({ count: reviews.length, reviews });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
