const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["seller", "buyer"], required: true },
  bio: { type: String },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }], // Store favorite vehicle IDs
  governmentId: { type: String }, // Store the uploaded file path
  idType: { type: String, enum: ["Aadhaar", "PAN", "Driver’s License"] }, // Type of ID
  isVerified: { type: Boolean, default: false } // Admin verification status
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
