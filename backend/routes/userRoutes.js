const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, [
  body('fullName').trim().optional(),
  body('phone').optional(),
  body('bio').trim().optional()
], async (req, res) => {
  try {
    const User = require('../models/User');
    const { fullName, phone, bio, address } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (address) user.address = { ...user.address, ...address };

    await user.save();
    res.status(200).json({ message: 'Profile updated', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.id).select('fullName profileImage bio createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user purchase history
router.get('/purchases/history', authenticate, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ customer: req.userId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments({ customer: req.userId });

    res.status(200).json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
