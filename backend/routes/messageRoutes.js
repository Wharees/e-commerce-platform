const express = require('express');
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/authMiddleware');
const multer = require('multer'); // <-- NEW: Imported Multer

const router = express.Router();

// --- NEW: Configure Multer exactly like your products use ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    // This strips out spaces, parentheses, and all weird characters instantly!
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
    cb(null, Date.now() + '-' + cleanFileName);
  }
});
const upload = multer({ storage: storage });
// ------------------------------------------------------------

router.use(authenticate);

// --- NEW: The dedicated image upload door for chats ---
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Send the file path back to React, safely fixing Windows backslashes
  const cleanPath = req.file.path.replace(/\\/g, '/');
  res.status(200).json({ url: cleanPath });
});
// ------------------------------------------------------

// --- UPDATED: Removed the strict text validator so images can pass through! ---
router.post('/send', [
  body('receiverId').notEmpty().withMessage('Receiver ID is required')
], messageController.sendMessage);

router.get('/conversations', messageController.getConversations);

router.get('/conversation/:otherUserId', messageController.getConversation);

router.get('/unread/count', messageController.getUnreadCount);

router.post('/:id/read', messageController.markAsRead);

router.delete('/:id', messageController.deleteMessage);

module.exports = router;