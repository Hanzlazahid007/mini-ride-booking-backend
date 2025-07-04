const User = require("../modals/User");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { generateToken } = require("../middleware/middleware");


exports.signUp = async (req, res) => {
  try {
    const { name, email, password, phone, userType, vehicleType } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !userType) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!["passenger", "rider"].includes(userType)) {
      return res.status(400).json({ error: "Invalid user type" });
    }

    if (userType === "rider" && !vehicleType) {
      return res.status(400).json({ error: "Vehicle type is required for riders" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      phone,
      userType,
      createdAt: new Date(),
    });

    // Add rider-specific fields
    if (userType === "rider") {
      newUser.availabilityStatus = "available";
      newUser.vehicleType = vehicleType;
      newUser.rating = 0;
      newUser.totalRides = 0;
    }

    await newUser.save();

    // Generate token
    const token = generateToken(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      message: "User created successfully",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


exports.Verify =  async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}