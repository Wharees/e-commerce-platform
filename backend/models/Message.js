const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  content: {
    type: String,
    default: '' // We removed "required: true" so images can pass alone!
  },
  attachments: [String],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for conversation queries
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ sender: 1, receiver: 1 });

// Populate references
messageSchema.pre(/^find/, function(next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'sender',
    select: 'fullName profileImage'
  }).populate({
    path: 'receiver',
    select: 'fullName profileImage'
  });
  next();
});

module.exports = mongoose.model('Message', messageSchema);
