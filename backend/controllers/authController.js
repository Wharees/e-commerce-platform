const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');
const { comparePassword } = require('../utils/passwordUtils');
const { validationResult } = require('express-validator');

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, lasuEmail, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { lasuEmail }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      lasuEmail,
      password,
      phone,
      role: role || 'customer'
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user with password field (normally hidden)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        message: 'Your account has been suspended. Contact admin.'
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Verify email
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { isEmailVerified: true },
      { new: true }
    );

    res.status(200).json({
      message: 'Email verified successfully',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Forgot password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json({
        message: 'If an account exists with this email, a reset link will be sent.'
      });
    }

    // In production, send email with reset token
    // For now, return success
    res.status(200).json({
      message: 'Password reset link has been sent to your email'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Reset password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get current user profile
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Refresh access token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const { valid, decoded, error } = require('../utils/jwtUtils').verifyToken(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!valid) {
      const isExpired = error?.name === 'TokenExpiredError';
      return res.status(401).json({
        message: isExpired ? 'Refresh token expired. Please login again.' : 'Invalid or expired refresh token'
      });
    }

    const accessToken = generateAccessToken(decoded.userId);

    res.status(200).json({
      accessToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Logout
 */
exports.logout = async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled on the client
    // by removing the token from localStorage
    res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
