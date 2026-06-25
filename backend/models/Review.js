const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    minlength: [10, 'Review must be at least 10 characters']
  },
  helpful: {
    type: Number,
    default: 0
  },
  unhelpful: {
    type: Number,
    default: 0
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  images: [String],
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for filtering
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ vendor: 1 });

// Populate references
reviewSchema.pre(/^find/, function(next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'customer',
    select: 'fullName profileImage'
  }).populate({
    path: 'product',
    select: 'name thumbnail'
  });
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
