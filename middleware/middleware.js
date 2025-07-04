const jwt = require("jsonwebtoken");
const User = require("../modals/User");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";


// Authentication middleware
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate JWT token
exports.generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      userType: user.userType,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  );
};

// Helper function to update rider availability
exports.updateRiderAvailability = async (riderId, status) => {
  await User.findOneAndUpdate(
    { id: riderId, userType: "rider" },
    { availabilityStatus: status },
  );
};
