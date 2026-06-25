const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authenticate, isVendor } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

// Customer routes
router.post('/', [
  body('shippingAddress').notEmpty().withMessage('Shipping address is required')
], orderController.createOrder);

router.get('/', orderController.getCustomerOrders);

router.get('/:id', orderController.getOrderById);

router.post('/:id/cancel', orderController.cancelOrder);

// Vendor routes
router.get('/vendor/orders', isVendor, orderController.getVendorOrders);

router.put('/:id/status', isVendor, [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
], orderController.updateOrderStatus);

// Add this near your other put/post routes
router.put('/:id/receive', authenticate, orderController.markOrderAsReceived);

module.exports = router;
