const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Payment webhook (public)
router.post('/webhook', paymentController.webhookHandler);

router.use(authenticate);

router.post('/initialize', [
  body('orderId').notEmpty().withMessage('Order ID is required')
], paymentController.initializePayment);

router.post('/verify', [
  body('reference').notEmpty().withMessage('Payment reference is required')
], paymentController.verifyPayment);

router.get('/reference/:reference', paymentController.getPaymentByReference);

router.get('/order/:orderId', paymentController.getPaymentByOrder);

router.get('/', paymentController.getCustomerPayments);

module.exports = router;
