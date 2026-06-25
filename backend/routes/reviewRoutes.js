const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/product/:id', reviewController.getProductReviews);

router.get('/:id', reviewController.getReviewById);

// Protected routes
router.post('/', authenticate, [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').trim().notEmpty().withMessage('Review title is required'),
  body('comment').trim().isLength({ min: 10 }).withMessage('Review comment must be at least 10 characters')
], reviewController.createReview);

router.put('/:id', authenticate, reviewController.updateReview);

router.delete('/:id', authenticate, reviewController.deleteReview);

router.post('/:id/helpful', authenticate, reviewController.markReviewHelpful);

module.exports = router;
