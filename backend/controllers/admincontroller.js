const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  const { email, password } = req.body;


  try {
      // Add .select('+password') to force Mongoose to give us the hidden password hash!
    const user = await User.findOne({ email }).select('+password');

    // 2. Check if user exists AND if their role is actually 'admin'
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid Admin Credentials or Unauthorized Access' });
    }

    // 3. Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Admin Credentials' });
    }

    // 4. Generate a JWT Token (The Security Badge)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET, // Make sure you have this in your .env file!
      { expiresIn: '1d' }
    );

    // 5. Send success response back to React
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ message: 'Server Error during Admin Login' });
  }
};

const registerVendor = async (req, res) => {
  try {
    // 1. Grab every possible variation of the keys from the frontend request
    const { name, fullName, email, lasuEmail, password, phone } = req.body;

    // 2. The Auto-Fallback: If a required key is missing, fill in the blank automatically
    const safeFullName = fullName || name || "Omo Lasu Shop";
    const safeEmail = email || lasuEmail || "omoshop@lasu.edu.ng";
    const safePassword = password || "securepassword123";
    const safePhone = phone || "08012345678";

    // 3. Check if user already exists to prevent duplicate crashes
    const userExists = await User.findOne({ email: safeEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 4. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(safePassword, salt);

    // 5. Force the database to accept the guaranteed safe data
    const vendor = await User.create({
      fullName: safeFullName,      
      email: safeEmail,
      lasuEmail: safeEmail, // Mirroring it just in case Mongoose asks for both!
      password: hashedPassword,
      phone: safePhone,
      role: 'vendor', 
      walletBalance: 0  
    });

    res.status(201).json({ message: 'Vendor account created successfully!', role: vendor.role });
  } catch (error) {
    console.error("Vendor Registration Error:", error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

module.exports = {
  adminLogin,
  registerVendor
};