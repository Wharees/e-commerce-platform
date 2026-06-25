const express = require('express');
const { body } = require('express-validator');
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', cartController.getCart);

router.post('/add', [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], cartController.addToCart);

router.put('/update', [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], cartController.updateCartItem);

router.delete('/remove/:productId', cartController.removeFromCart);

router.post('/clear', cartController.clearCart);

router.get('/count', cartController.getCartCount);

module.exports = router;
