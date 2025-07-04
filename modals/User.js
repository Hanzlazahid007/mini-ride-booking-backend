const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Mongoose Schemas
const userSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  userType: { type: String, required: true, enum: ["passenger", "rider"] },
  availabilityStatus: { type: String, enum: ["available", "busy", "offline"], default: "available" },
  vehicleType: { type: String, enum: ["car", "bike", "rickshaw"] },
  rating: { type: Number, default: 0 },
  totalRides: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

module.exports = User