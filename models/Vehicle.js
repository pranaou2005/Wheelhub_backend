const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  variant: { type: String },
  year: { type: Number, required: true },
  fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric", "Gas"], required: true },
  kilometersDriven: { type: Number, required: true },
  mileage: { type: Number },
  numberOfOwners: { type: Number, required: true },
  reasonForSelling: { type: String },
  price: { type: Number, required: true },
  images: [{ type: String }], // Array of image URLs
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Vehicle", VehicleSchema);
