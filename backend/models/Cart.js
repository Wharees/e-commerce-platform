const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: Number,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalPrice: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Calculate total price
cartSchema.pre('save', async function(next) {
  try {
    const Product = require('./Product');
    let total = 0;

    for (let item of this.items) {
      const product = await Product.findById(item.product);
      if (product) {
        item.price = product.discountPrice || product.price;
        total += item.price * item.quantity;
      }
    }

    this.totalPrice = total;
    next();
  } catch (error) {
    next(error);
  }
});

// Populate products
cartSchema.pre(/^find/, function(next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'items.product',
    select: 'name price discountPrice thumbnail'
  }).populate({
    path: 'customer',
    select: 'fullName email'
  });
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
