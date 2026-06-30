const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/authMiddleware');
const { adminLogin } = require('../controllers/adminController'); 
const { registerVendor } = require('../controllers/adminController');

// ==========================================
// 🟢 PUBLIC ROUTES (Must go BEFORE the middleware)
// ==========================================

// Admin Login Route
router.post('/login', adminLogin);

router.post('/register-vendor', registerVendor);

// Dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const User = require('../models/User');
    const Product = require('../models/Product');
    const Order = require('../models/Order');
    const Payment = require('../models/Payment');

    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const successfulPayments = await Payment.find({ status: 'success' });
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

    const recentActivities = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'fullName email');

    res.status(200).json({
      dashboard: {
        totalUsers,
        totalVendors,
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentActivities
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 🔴 PROTECTED ROUTES (Requires Admin Token)
// !
router.use(authenticate, isAdmin);


// Get pending payouts
router.get('/payouts/pending', async (req, res) => {
  try {
    const Payout = require('../models/Payout'); // Assuming you have a Payout model
    const pendingPayouts = await Payout.find({ status: 'pending' })
      .populate('vendor', 'fullName email');
    
    res.status(200).json({ payouts: pendingPayouts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve a payout
router.put('/payouts/:id/approve', async (req, res) => {
  try {
    const Payout = require('../models/Payout');
    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      { status: 'paid' },
      { new: true }
    );
    res.status(200).json({ message: 'Payout approved', payout });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage users
router.get('/users', async (req, res) => {
  try {
    const User = require('../models/User');
    const { page = 1, limit = 20, role } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalItems: total }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Suspend/Unsuspend user
router.put('/users/:id/suspend', async (req, res) => {
  try {
    const User = require('../models/User');
    const { isSuspended } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended },
      { new: true }
    );

    res.status(200).json({ message: 'User updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage products
router.get('/products', async (req, res) => {
  try {
    const Product = require('../models/Product');
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments();

    res.status(200).json({
      products,
      pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalItems: total }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject product
router.put('/products/:id/approve', async (req, res) => {
  try {
    const Product = require('../models/Product');
    const { isApproved } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );

    res.status(200).json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales report
router.get('/reports/sales', async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const Order = require('../models/Order');

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      reports: {
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;