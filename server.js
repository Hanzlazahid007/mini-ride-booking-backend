const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routes/authRoutes");
const riderRoutes = require("./routes/riderRoutes")
const rideRoutes = require("./routes/rideRoutes")
const mongoose = require("mongoose");
const { authenticateToken } = require("./middleware/middleware");





const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ridebook";
console.log(MONGODB_URI)

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});


// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "RideBook API is running" });
});

// Auth Routes
app.use("/api/auth",authRoutes );
app.use("/api/rides",rideRoutes)
app.use("/api/riders",riderRoutes)

















// Get all rides (for debugging - remove in production)
app.get("/api/rides/all", authenticateToken, async (req, res) => {
  try {
    const allRides = await Ride.find().sort({ createdAt: -1 });
    res.json({ rides: allRides });
  } catch (error) {
    console.error("Get all rides error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
// app.use("*", (req, res) => {
//   res.status(404).json({ error: "Route not found" });
// });

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RideBook API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
});


module.exports = app;

// =======================
// const express = require("express");
// const cors = require("cors");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");
// const dotenv = require("dotenv");
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;
// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ridebook";

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log("Connected to MongoDB");
// }).catch((err) => {
//   console.error("MongoDB connection error:", err);
// });

// // Mongoose Schemas
// const userSchema = new mongoose.Schema({
//   id: { type: String, default: uuidv4, unique: true },
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   phone: { type: String, required: true },
//   userType: { type: String, required: true, enum: ["passenger", "rider"] },
//   availabilityStatus: { type: String, enum: ["available", "busy", "offline"], default: "available" },
//   vehicleType: { type: String, enum: ["car", "bike", "rickshaw"] },
//   rating: { type: Number, default: 0 },
//   totalRides: { type: Number, default: 0 },
//   createdAt: { type: Date, default: Date.now },
// });

// const rideSchema = new mongoose.Schema({
//   id: { type: String, default: uuidv4, unique: true },
//   userId: { type: String, required: true },
//   pickup: { type: String, required: true },
//   dropoff: { type: String, required: true },
//   rideType: { type: String, required: true, enum: ["car", "bike", "rickshaw"] },
//   status: { type: String, required: true, enum: ["requested", "accepted", "in-progress", "completed", "rejected"] },
//   customerName: { type: String, required: true },
//   customerPhone: { type: String, required: true },
//   riderId: { type: String },
//   riderName: { type: String },
//   createdAt: { type: Date, default: Date.now },
//   acceptedAt: { type: Date },
//   completedAt: { type: Date },
// });

// // Mongoose Models
// const User = mongoose.model("User", userSchema);
// const Ride = mongoose.model("Ride", rideSchema);

// // Authentication middleware
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ error: "Access token required" });
//   }

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ error: "Invalid or expired token" });
//     }
//     req.user = user;
//     next();
//   });
// };

// // Helper function to generate JWT token
// const generateToken = (user) => {
//   return jwt.sign(
//     {
//       id: user.id,
//       email: user.email,
//       userType: user.userType,
//     },
//     JWT_SECRET,
//     { expiresIn: "24h" },
//   );
// };

// // Helper function to update rider availability
// const updateRiderAvailability = async (riderId, status) => {
//   await User.findOneAndUpdate(
//     { id: riderId, userType: "rider" },
//     { availabilityStatus: status },
//   );
// };

// // Routes

// // Health check
// app.get("/api/health", (req, res) => {
//   res.json({ status: "OK", message: "RideBook API is running" });
// });
// // app.use("/api/auth",authRoutes)

// // Auth Routes
// app.post("/api/auth/signup", async (req, res) => {
//   try {
//     const { name, email, password, phone, userType, vehicleType } = req.body;

//     // Validation
//     if (!name || !email || !password || !phone || !userType) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     if (!["passenger", "rider"].includes(userType)) {
//       return res.status(400).json({ error: "Invalid user type" });
//     }

//     if (userType === "rider" && !vehicleType) {
//       return res.status(400).json({ error: "Vehicle type is required for riders" });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: "User with this email already exists" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const newUser = new User({
//       id: uuidv4(),
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       userType,
//       createdAt: new Date(),
//     });

//     // Add rider-specific fields
//     if (userType === "rider") {
//       newUser.availabilityStatus = "available";
//       newUser.vehicleType = vehicleType;
//       newUser.rating = 0;
//       newUser.totalRides = 0;
//     }

//     await newUser.save();

//     // Generate token
//     const token = generateToken(newUser);

//     // Return user without password
//     const { password: _, ...userWithoutPassword } = newUser.toObject();

//     res.status(201).json({
//       message: "User created successfully",
//       token,
//       user: userWithoutPassword,
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.post("/api/auth/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validation
//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     // Check password
//     const isValidPassword = await bcrypt.compare(password, user.password);
//     if (!isValidPassword) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     // Generate token
//     const token = generateToken(user);

//     // Return user without password
//     const { password: _, ...userWithoutPassword } = user.toObject();

//     res.json({
//       message: "Login successful",
//       token,
//       user: userWithoutPassword,
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.get("/api/auth/verify", authenticateToken, async (req, res) => {
//   try {
//     const user = await User.findOne({ id: req.user.id });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const { password: _, ...userWithoutPassword } = user.toObject();
//     res.json({ user: userWithoutPassword });
//   } catch (error) {
//     console.error("Verify token error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get available riders for passengers
// app.get("/api/riders/available", authenticateToken, async (req, res) => {
//   try {
//     if (req.user.userType !== "passenger") {
//       return res.status(403).json({ error: "Only passengers can view available riders" });
//     }

//     const { rideType } = req.query;

//     let query = { userType: "rider", availabilityStatus: "available" };
//     if (rideType) {
//       query.vehicleType = rideType;
//     }

//     const availableRiders = await User.find(query).select("-password");

//     res.json({ riders: availableRiders });
//   } catch (error) {
//     console.error("Get available riders error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Book a ride with specific rider (passengers only)
// app.post("/api/rides/book", authenticateToken, async (req, res) => {
//   try {
//     const { pickup, dropoff, rideType, riderId } = req.body;

//     // Validation
//     if (!pickup || !dropoff || !rideType) {
//       return res.status(400).json({ error: "Pickup, dropoff, and ride type are required" });
//     }

//     if (!["bike", "car", "rickshaw"].includes(rideType)) {
//       return res.status(400).json({ error: "Invalid ride type" });
//     }

//     // Check if user is passenger
//     if (req.user.userType !== "passenger") {
//       return res.status(403).json({ error: "Only passengers can book rides" });
//     }

//     // Get user details
//     const user = await User.findOne({ id: req.user.id });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Check if user has an active ride
//     const activeRide = await Ride.findOne({
//       userId: req.user.id,
//       status: { $in: ["requested", "accepted", "in-progress"] },
//     });

//     if (activeRide) {
//       return res.status(400).json({ error: "You already have an active ride" });
//     }

//     // If specific rider is requested, validate rider
//     let rider;
//     if (riderId) {
//       rider = await User.findOne({ id: riderId, userType: "rider" });
//       if (!rider) {
//         return res.status(404).json({ error: "Rider not found" });
//       }
//       if (rider.availabilityStatus !== "available") {
//         return res.status(400).json({ error: "Selected rider is not available" });
//       }
//       if (rider.vehicleType !== rideType) {
//         return res.status(400).json({ error: "Rider vehicle type does not match requested ride type" });
//       }
//     }

//     // Create new ride
//     const newRide = new Ride({
//       id: uuidv4(),
//       userId: req.user.id,
//       pickup,
//       dropoff,
//       rideType,
//       status: riderId ? "accepted" : "requested",
//       customerName: user.name,
//       customerPhone: user.phone,
//       createdAt: new Date(),
//     });

//     // If specific rider is selected, assign immediately
//     if (riderId) {
//       newRide.riderId = riderId;
//       newRide.riderName = rider.name;
//       newRide.acceptedAt = new Date();
//       await updateRiderAvailability(riderId, "busy");
//     }

//     await newRide.save();

//     res.status(201).json({
//       message: "Ride booked successfully",
//       ride: newRide,
//     });
//   } catch (error) {
//     console.error("Book ride error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Update rider availability status
// app.patch("/api/riders/availability", authenticateToken, async (req, res) => {
//   try {
//     const { status } = req.body;

//     if (req.user.userType !== "rider") {
//       return res.status(403).json({ error: "Only riders can update availability status" });
//     }

//     if (!["available", "busy", "offline"].includes(status)) {
//       return res.status(400).json({ error: "Invalid availability status" });
//     }

//     await updateRiderAvailability(req.user.id, status);

//     res.json({
//       message: "Availability status updated successfully",
//       status,
//     });
//   } catch (error) {
//     console.error("Update availability error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get ride history for passenger
// app.get("/api/rides/history", authenticateToken, async (req, res) => {
//   try {
//     if (req.user.userType !== "passenger") {
//       return res.status(403).json({ error: "Only passengers can view ride history" });
//     }

//     const userRides = await Ride.find({ userId: req.user.id }).sort({ createdAt: -1 });

//     res.json({ rides: userRides });
//   } catch (error) {
//     console.error("Get ride history error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get current active ride for passenger
// app.get("/api/rides/current", authenticateToken, async (req, res) => {
//   try {
//     if (req.user.userType !== "passenger") {
//       return res.status(403).json({ error: "Only passengers can view current ride" });
//     }

//     const currentRide = await Ride.findOne({
//       userId: req.user.id,
//       status: { $in: ["requested", "accepted", "in-progress"] },
//     });

//     if (!currentRide) {
//       return res.status(404).json({ error: "No active ride found" });
//     }

//     res.json({ ride: currentRide });
//   } catch (error) {
//     console.error("Get current ride error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get available rides for riders
// app.get("/api/rides/available", authenticateToken, async (req, res) => {
//   try {
//     if (req.user.userType !== "rider") {
//       return res.status(403).json({ error: "Only riders can view available rides" });
//     }

//     const availableRides = await Ride.find({ status: "requested", riderId: null }).sort({ createdAt: -1 });

//     res.json({ rides: availableRides });
//   } catch (error) {
//     console.error("Get available rides error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get rider's accepted rides
// app.get("/api/rides/my-rides", authenticateToken, async (req, res) => {
//   try {
//     if (req.user.userType !== "rider") {
//       return res.status(403).json({ error: "Only riders can view their rides" });
//     }

//     const myRides = await Ride.find({ riderId: req.user.id }).sort({ createdAt: -1 });

//     res.json({ rides: myRides });
//   } catch (error) {
//     console.error("Get my rides error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Update ride status (riders only)
// app.patch("/api/rides/:rideId/status", authenticateToken, async (req, res) => {
//   try {
//     const { rideId } = req.params;
//     const { status } = req.body;

//     // Validation
//     if (!status) {
//       return res.status(400).json({ error: "Status is required" });
//     }

//     if (!["accepted", "rejected", "in-progress", "completed"].includes(status)) {
//       return res.status(400).json({ error: "Invalid status" });
//     }

//     // Check if user is rider
//     if (req.user.userType !== "rider") {
//       return res.status(403).json({ error: "Only riders can update ride status" });
//     }

//     // Find ride
//     const ride = await Ride.findOne({ id: rideId });
//     if (!ride) {
//       return res.status(404).json({ error: "Ride not found" });
//     }

//     // Get rider details
//     const rider = await User.findOne({ id: req.user.id });
//     if (!rider) {
//       return res.status(404).json({ error: "Rider not found" });
//     }

//     // Handle different status updates
//     if (status === "rejected") {
//       await Ride.deleteOne({ id: rideId });
//       return res.json({ message: "Ride rejected successfully" });
//     }

//     if (status === "accepted") {
//       // Check if ride is available for acceptance
//       if (ride.status !== "requested") {
//         return res.status(400).json({ error: "Ride is not available for acceptance" });
//       }

//       // Assign rider to the ride
//       ride.status = "accepted";
//       ride.riderId = req.user.id;
//       ride.riderName = rider.name;
//       ride.acceptedAt = new Date();
//       await ride.save();

//       // Update rider availability to busy
//       await updateRiderAvailability(req.user.id, "busy");
//     } else {
//       // For in-progress and completed status
//       if (ride.riderId !== req.user.id) {
//         return res.status(403).json({ error: "You can only update rides assigned to you" });
//       }

//       ride.status = status;
//       if (status === "completed") {
//         ride.completedAt = new Date();
//         await updateRiderAvailability(req.user.id, "available");
//       }
//       await ride.save();
//     }

//     res.json({
//       message: `Ride ${status} successfully`,
//       ride,
//     });
//   } catch (error) {
//     console.error("Update ride status error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get all rides (for debugging - remove in production)
// app.get("/api/rides/all", authenticateToken, async (req, res) => {
//   try {
//     const allRides = await Ride.find().sort({ createdAt: -1 });
//     res.json({ rides: allRides });
//   } catch (error) {
//     console.error("Get all rides error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: "Something went wrong!" });
// });

// // 404 handler
// // app.use("*", (req, res) => {
// //   res.status(404).json({ error: "Route not found" });
// // });

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 RideBook API Server running on port ${PORT}`);
//   console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
//   console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
// });

// module.exports = app;