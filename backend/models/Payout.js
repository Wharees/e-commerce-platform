const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'rejected'],
    default: 'pending'
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String
  },
  adminNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Populate vendor info when fetching
payoutSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'vendor',
    select: 'fullName email'
  });
  next();
});

module.exports = mongoose.model('Payout', payoutSchema);