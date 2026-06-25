const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);

router.get('/unread/count', notificationController.getUnreadCount);

router.post('/:id/read', notificationController.markAsRead);

router.post('/read-all', notificationController.markAllAsRead);

router.delete('/:id', notificationController.deleteNotification);

router.post('/clear-all', notificationController.clearAll);

module.exports = router;
