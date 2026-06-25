const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

/**
 * Create review for product
 */
exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, orderId, rating, title, comment } = req.body;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify customer purchased the product (verify purchase)
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.customer.toString() === req.userId) {
        const hasPurchased = order.items.some(
          item => item.product.toString() === productId
        );
        isVerifiedPurchase = hasPurchased;
      }
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      product: productId,
      customer: req.userId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      product: productId,
      customer: req.userId,
      vendor: product.vendor,
      order: orderId,
      rating,
      title,
      comment,
      isVerifiedPurchase,
      status: 'approved' // Auto-approve for now, can be changed to pending
    });

    await review.save();

    // Update product rating
    const reviews = await Review.find({ product: productId, status: 'approved' });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = totalRating / reviews.length;
    product.reviewCount = reviews.length;
    await product.save();

    // Notify vendor
    await Notification.create({
      user: product.vendor,
      type: 'review',
      title: 'New Review Received',
      message: `${req.userId} left a ${rating}-star review on your product`,
      relatedId: review._id,
      relatedModel: 'Review'
    });

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get product reviews
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    const skip = (page - 1) * limit;

    let query = { product: id, status: 'approved' };
    let sortOption = { createdAt: -1 };

    if (sort === 'helpful') {
      sortOption = { helpful: -1 };
    } else if (sort === 'rating-high') {
      sortOption = { rating: -1 };
    } else if (sort === 'rating-low') {
      sortOption = { rating: 1 };
    }

    const reviews = await Review.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortOption);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get review by ID
 */
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update review
 */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.customer.toString() !== req.userId) {
      return res.status(403).json({
        message: 'You can only update your own reviews'
      });
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    await review.save();

    // Update product rating
    const reviews = await Review.find({ product: review.product, status: 'approved' });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const product = await Product.findById(review.product);
    product.rating = totalRating / reviews.length;
    await product.save();

    res.status(200).json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete review
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.customer.toString() !== req.userId) {
      return res.status(403).json({
        message: 'You can only delete your own reviews'
      });
    }

    await Review.findByIdAndDelete(id);

    // Update product rating
    const reviews = await Review.find({ product: review.product, status: 'approved' });
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const product = await Product.findById(review.product);
      product.rating = totalRating / reviews.length;
      product.reviewCount = reviews.length;
      await product.save();
    }

    res.status(200).json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mark review as helpful
 */
exports.markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful = true } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (helpful) {
      review.helpful += 1;
    } else {
      review.unhelpful += 1;
    }

    await review.save();

    res.status(200).json({
      message: 'Review marked',
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
