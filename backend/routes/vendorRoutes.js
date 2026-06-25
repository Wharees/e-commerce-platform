const express = require('express');
const router = express.Router();
const { authenticate, isVendor } = require('../middleware/authMiddleware');

// Vendor Dashboard
router.get('/dashboard', authenticate, isVendor, async (req, res) => {
  try {
    const Product = require('../models/Product');
    const Order = require('../models/Order');
    const Payment = require('../models/Payment');

    const totalProducts = await Product.countDocuments({ vendor: req.userId });
    const totalOrders = await Order.countDocuments({ 'items.vendor': req.userId });
    
    const payments = await Payment.find({
      order: { $in: await Order.find({ 'items.vendor': req.userId }).distinct('_id') },
      status: 'success'
    });
    
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      dashboard: {
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders: await Order.countDocuments({ 'items.vendor': req.userId, status: 'pending' })
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vendor Profile
router.get('/profile', authenticate, isVendor, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    res.status(200).json({ vendor: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
