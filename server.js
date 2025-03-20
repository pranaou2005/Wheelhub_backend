require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};
connectDB();

// ✅ Debugging logs
console.log("📂 Current Directory:", __dirname);

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicle");
const chatRoutes = require("./routes/chatRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const rcRoutes = require("./routes/rcRoutes"); // ✅ Added RC Routes

// ✅ Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/rc", rcRoutes); // ✅ Corrected RC Route Placement

// ✅ Serve Uploaded Files as Static Resources
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Test Route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

// ✅ Start the Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ✅ Handle Errors
process.on("uncaughtException", (err) => {
  console.error("⚠️ Uncaught Exception:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("⚠️ Unhandled Rejection:", err.message);
  process.exit(1);
});
