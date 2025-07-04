const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  userId: { type: String, required: true },
  pickup: { type: String, required: true },
  dropoff: { type: String, required: true },
  rideType: { type: String, required: true, enum: ["car", "bike", "rickshaw"] },
  status: { type: String, required: true, enum: ["requested", "accepted", "in-progress", "completed", "rejected"] },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  riderId: { type: String },
  riderName: { type: String },
  createdAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  completedAt: { type: Date },
});


const Ride = mongoose.model("Ride", rideSchema);

module.exports = Ride;