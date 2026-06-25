const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
    category: { 
    type: String, 
    required: true 
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor is required']
  },
  images: [{
    type: String
  }],
  thumbnail: {
    type: String
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountPrice: {
    type: Number,
    default: null
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

// Index for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ vendor: 1, isActive: 1 });
productSchema.index({ category: 1, isActive: 1 });

// Calculate discounted price
productSchema.pre('save', function(next) {
  if (this.discount > 0) {
    this.discountPrice = this.price - (this.price * this.discount / 100);
  } else {
    this.discountPrice = null;
  }
  next();
});

// Populate vendor on query
productSchema.pre(/^find/, function(next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'vendor',
    select: 'fullName profileImage email'
  }).populate({
    path: 'category',
    select: 'name'
  });
  next();
});

module.exports = mongoose.model('Product', productSchema);
