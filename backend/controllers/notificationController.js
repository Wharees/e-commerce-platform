const Notification = require('../models/Notification');

/**
 * Get user notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const skip = (page - 1) * limit;

    let query = { user: req.userId };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      notifications,
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
 * Get unread notification count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.userId,
      isRead: false
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.userId) {
      return res.status(403).json({
        message: 'You can only delete your own notifications'
      });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Clear all notifications
 */
exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.userId });

    res.status(200).json({
      message: 'All notifications cleared'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
