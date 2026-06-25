const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Public routes
 */

router.post('/register', [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('lasuEmail').isEmail().withMessage('Invalid LASU email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required')
], authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

router.post('/forgot-password', authController.forgotPassword);

router.post('/refresh-token', authController.refreshToken);

/**
 * Protected routes
 */

router.get('/me', authenticate, authController.getCurrentUser);

router.post('/verify-email', authenticate, authController.verifyEmail);

router.post('/reset-password', authenticate, authController.resetPassword);

router.post('/logout', authenticate, authController.logout);

module.exports = router;
