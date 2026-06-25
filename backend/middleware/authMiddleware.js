const { verifyToken } = require('../utils/jwtUtils');

/**
 * Verify JWT token from request
 */
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const verification = verifyToken(token);
    if (!verification.valid) {
      const isExpired = verification.error?.name === 'TokenExpiredError';
      return res.status(401).json({
        message: isExpired ? 'JWT expired. Please login again.' : 'Invalid or expired token'
      });
    }

    req.userId = verification.decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Authorize based on user roles
 */
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          message: `Access denied. Required role: ${roles.join(' or ')}`
        });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Authorization failed' });
    }
  };
};

/**
 * Check if user is admin
 */
const isAdmin = authorize('admin');

/**
 * Check if user is vendor
 */
const isVendor = authorize('vendor');

/**
 * Check if user is customer
 */
const isCustomer = authorize('customer');

module.exports = {
  authenticate,
  authorize,
  isAdmin,
  isVendor,
  isCustomer
};
