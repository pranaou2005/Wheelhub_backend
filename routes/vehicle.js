const express = require("express");
const multer = require("multer");
const path = require("path");
const Vehicle = require("../models/Vehicle");
const authMiddleware = require("../middleware/authMiddleware"); // Import JWT middleware

const router = express.Router();

console.log("✅ Vehicle routes loaded"); // Debugging log

// ✅ Configure Multer for Local Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save images in 'uploads/' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// ✅ Serve Images as Static Files
router.use("/uploads", express.static("uploads"));

// ✅ Get All Vehicles
router.get("/", async (req, res) => {
  try {
    console.log("✅ GET /api/vehicles called"); // Debugging log

    const vehicles = await Vehicle.find();
    res.json({ count: vehicles.length, vehicles });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get a Single Vehicle by ID
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Add a New Vehicle (with Image Upload)
router.post("/add", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can post vehicles" });
    }

    const {
      title, brand, model, variant, year,
      fuelType, kilometersDriven, mileage,
      numberOfOwners, reasonForSelling, price
    } = req.body;

    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

    const newVehicle = new Vehicle({
      title, brand, model, variant, year,
      fuelType, kilometersDriven, mileage,
      numberOfOwners, reasonForSelling, price,
      images: imagePaths, // Save image paths instead of URLs
      sellerId: req.user.id
    });

    await newVehicle.save();
    res.status(201).json({ message: "Vehicle posted successfully", vehicle: newVehicle });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Update a Vehicle by ID (Only seller can update their own vehicle)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Ensure that only the seller who posted the vehicle can update it
    if (vehicle.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own vehicle" });
    }

    // Update vehicle details
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Update only the fields provided in the request
      { new: true } // Return updated document
    );

    res.json({ message: "Vehicle updated successfully", vehicle: updatedVehicle });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Delete a Vehicle by ID (Only seller can delete their own vehicle)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Ensure that only the seller who posted the vehicle can delete it
    if (vehicle.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own vehicle" });
    }

    await vehicle.deleteOne();
    res.json({ message: "Vehicle deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
