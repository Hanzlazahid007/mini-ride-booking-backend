const { v4: uuidv4 } = require("uuid");
const User = require("../modals/User");
const Ride = require("../modals/Ride");

exports.bookSpecificRide =  async (req, res) => {
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

exports.rideHistoryPassenger  = async (req, res) => {
  try {
    if (req.user.userType !== "passenger") {
      return res.status(403).json({ error: "Only passengers can view ride history" });
    }

    const userRides = await Ride.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.json({ rides: userRides });
  } catch (error) {
    console.error("Get ride history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

exports.currentRidePassenger = async (req, res) => {
  try {
    if (req.user.userType !== "passenger") {
      return res.status(403).json({ error: "Only passengers can view current ride" });
    }

    const currentRide = await Ride.findOne({
      userId: req.user.id,
      status: { $in: ["requested", "accepted", "in-progress"] },
    });

    if (!currentRide) {
      return res.status(404).json({ error: "No active ride found" });
    }

    res.json({ ride: currentRide });
  } catch (error) {
    console.error("Get current ride error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

exports.availableRideForRider = async (req, res) => {
  try {
    if (req.user.userType !== "rider") {
      return res.status(403).json({ error: "Only riders can view available rides" });
    }

    const availableRides = await Ride.find({ status: "requested", riderId: null }).sort({ createdAt: -1 });

    res.json({ rides: availableRides });
  } catch (error) {
    console.error("Get available rides error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

exports.myRides = async (req, res) => {
  try {
    if (req.user.userType !== "rider") {
      return res.status(403).json({ error: "Only riders can view their rides" });
    }

    const myRides = await Ride.find({ riderId: req.user.id }).sort({ createdAt: -1 });

    res.json({ rides: myRides });
  } catch (error) {
    console.error("Get my rides error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

exports.updateRideStatus = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;

    // Validation
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    if (!["accepted", "rejected", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Check if user is rider
    if (req.user.userType !== "rider") {
      return res.status(403).json({ error: "Only riders can update ride status" });
    }

    // Find ride
    const ride = await Ride.findOne({ id: rideId });
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Get rider details
    const rider = await User.findOne({ id: req.user.id });
    if (!rider) {
      return res.status(404).json({ error: "Rider not found" });
    }

    // Handle different status updates
    if (status === "rejected") {
      await Ride.deleteOne({ id: rideId });
      return res.json({ message: "Ride rejected successfully" });
    }

    if (status === "accepted") {
      // Check if ride is available for acceptance
      if (ride.status !== "requested") {
        return res.status(400).json({ error: "Ride is not available for acceptance" });
      }

      // Assign rider to the ride
      ride.status = "accepted";
      ride.riderId = req.user.id;
      ride.riderName = rider.name;
      ride.acceptedAt = new Date();
      await ride.save();

      // Update rider availability to busy
      await updateRiderAvailability(req.user.id, "busy");
    } else {
      // For in-progress and completed status
      if (ride.riderId !== req.user.id) {
        return res.status(403).json({ error: "You can only update rides assigned to you" });
      }

      ride.status = status;
      if (status === "completed") {
        ride.completedAt = new Date();
        await updateRiderAvailability(req.user.id, "available");
      }
      await ride.save();
    }

    res.json({
      message: `Ride ${status} successfully`,
      ride,
    });
  } catch (error) {
    console.error("Update ride status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}