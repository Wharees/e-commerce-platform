const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'cash_on_delivery'],
    default: 'paystack'
  },
  reference: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  paystackResponse: mongoose.Schema.Types.Mixed,
  receiptUrl: String,
  paidAt: Date,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Populate references
paymentSchema.pre(/^find/, function(next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'order',
    select: 'orderNumber totalAmount'
  }).populate({
    path: 'customer',
    select: 'fullName email'
  });
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
