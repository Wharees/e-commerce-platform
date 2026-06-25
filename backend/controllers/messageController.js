const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const mongoose = require('mongoose');

/**
 * Helper function to generate conversation ID
 */
const generateConversationId = (userId1, userId2) => {
  // THE FIX: Force both IDs to be normal text before sorting them!
  const ids = [userId1.toString(), userId2.toString()].sort().join('-');
  return crypto.createHash('md5').update(ids).digest('hex');
};

/**
 * Send message
 */
exports.sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 1. ADDED 'attachments' to the package we pull from the frontend
    const { receiverId, content, productId, orderId, attachments } = req.body; 

    // 2. UPDATED RULE: Reject ONLY if both text AND attachments are empty
    if ((!content || content.trim().length === 0) && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Message text or image is required' });
    }

    const conversationId = generateConversationId(req.userId, receiverId);

    const message = new Message({
      conversationId,
      sender: req.userId,
      receiver: receiverId,
      content: content || "",           // Safely handles empty text
      attachments: attachments || [],  // 3. ADDED the image array to the database save
      product: productId,
      order: orderId
    });

    await message.save();
    
    // ... (Keep your Notification code and res.status(201) below exactly the same!) ...

    // Notify receiver
    await Notification.create({
      user: receiverId,
      type: 'message',
      title: 'New Message',
      message: 'You have a new message',
      relatedId: message._id,
      relatedModel: 'Message'
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get conversation
 */
exports.getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const conversationId = generateConversationId(req.userId, otherUserId);

    const messages = await Message.find({ conversationId })
      .populate('sender', 'fullName name')    // <--- INJECTS THE NAMES HERE
      .populate('receiver', 'fullName name')  // <--- INJECTS THE NAMES HERE
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Message.countDocuments({ conversationId });

    // Mark all unread messages from other user as read
    await Message.updateMany(
      { conversationId, receiver: req.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      conversationId,
      messages: messages.reverse(),
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
 * Get all conversations for user
 */
exports.getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const userObjId = new mongoose.Types.ObjectId(req.userId);

    // CHANGED 'const' to 'let' here so we can inject the names below!
    let conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userObjId },
            { receiver: userObjId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ]);

  // 👇 REPLACE THE OLD POPULATE BLOCK WITH THIS ONE 👇
    // By adding "model: 'User'", we force Mongoose to fetch the names
    // even inside the temporary aggregate groups!
    conversations = await Message.populate(conversations, [
      { path: 'lastMessage.sender', model: 'User', select: 'fullName profileImage' },
      { path: 'lastMessage.receiver', model: 'User', select: 'fullName profileImage' }
    ]);
    // 👆 ----------------------------------------------- 👆
    // 👆 ----------------------------------- 👆

    const total = await Message.distinct('conversationId', {
      $or: [
        { sender: userObjId },
        { receiver: userObjId }
      ]
    });

    res.status(200).json({
      conversations: conversations.map(c => ({
        conversationId: c._id,
        lastMessage: c.lastMessage
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total.length / limit),
        totalItems: total.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get unread message count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.userId,
      isRead: false
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mark message as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json({ message: 'Message marked as read', data: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete message
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.userId) {
      return res.status(403).json({
        message: 'You can only delete your own messages'
      });
    }

    await Message.findByIdAndDelete(id);

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};