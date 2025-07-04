const Ride = require("../modals/Ride");
const User = require("../modals/User");
const { v4: uuidv4 } = require("uuid");


// Get available riders for passengers
exports.availableRiders = async (req, res) => {
  try {
    if (req.user.userType !== "passenger") {
      return res.status(403).json({ error: "Only passengers can view available riders" });
    }

    const { rideType } = req.query;

    let query = { userType: "rider", availabilityStatus: "available" };
    if (rideType) {
      query.vehicleType = rideType;
    }

    const availableRiders = await User.find(query).select("-password");

    res.json({ riders: availableRiders });
  } catch (error) {
    console.error("Get available riders error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

exports.bookRide = async (req, res) => {
  try {
    const { pickup, dropoff, rideType, riderId } = req.body;

    // Validation
    if (!pickup || !dropoff || !rideType) {
      return res.status(400).json({ error: "Pickup, dropoff, and ride type are required" });
    }

    if (!["bike", "car", "rickshaw"].includes(rideType)) {
      return res.status(400).json({ error: "Invalid ride type" });
    }

    // Check if user is passenger
    if (req.user.userType !== "passenger") {
      return res.status(403).json({ error: "Only passengers can book rides" });
    }

    // Get user details
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has an active ride
    const activeRide = await Ride.findOne({
      userId: req.user.id,
      status: { $in: ["requested", "accepted", "in-progress"] },
    });

    if (activeRide) {
      return res.status(400).json({ error: "You already have an active ride" });
    }

    // If specific rider is requested, validate rider
    let rider;
    if (riderId) {
      rider = await User.findOne({ id: riderId, userType: "rider" });
      if (!rider) {
        return res.status(404).json({ error: "Rider not found" });
      }
      if (rider.availabilityStatus !== "available") {
        return res.status(400).json({ error: "Selected rider is not available" });
      }
      if (rider.vehicleType !== rideType) {
        return res.status(400).json({ error: "Rider vehicle type does not match requested ride type" });
      }
    }

    // Create new ride
    const newRide = new Ride({
      id: uuidv4(),
      userId: req.user.id,
      pickup,
      dropoff,
      rideType,
      status: riderId ? "accepted" : "requested",
      customerName: user.name,
      customerPhone: user.phone,
      createdAt: new Date(),
    });

    // If specific rider is selected, assign immediately
    if (riderId) {
      newRide.riderId = riderId;
      newRide.riderName = rider.name;
      newRide.acceptedAt = new Date();
      await updateRiderAvailability(riderId, "busy");
    }

    await newRide.save();

    res.status(201).json({
      message: "Ride booked successfully",
      ride: newRide,
    });
  } catch (error) {
    console.error("Book ride error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

exports.updateRiderAvailability =  async (req, res) => {
  try {
    const { status } = req.body;

    if (req.user.userType !== "rider") {
      return res.status(403).json({ error: "Only riders can update availability status" });
    }

    if (!["available", "busy", "offline"].includes(status)) {
      return res.status(400).json({ error: "Invalid availability status" });
    }

    await updateRiderAvailability(req.user.id, status);

    res.json({
      message: "Availability status updated successfully",
      status,
    });
  } catch (error) {
    console.error("Update availability error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}