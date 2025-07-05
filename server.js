const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routes/authRoutes");
const riderRoutes = require("./routes/riderRoutes");
const rideRoutes = require("./routes/rideRoutes");
const mongoose = require("mongoose");
const { authenticateToken } = require("./middleware/middleware");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
console.log(MONGODB_URI);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "RideBook API is running" });
});

// Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/riders", riderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RideBook API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
