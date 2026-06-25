const jwt = require('jsonwebtoken');

/**
 * Generate JWT access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '2h'
  });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '30d'
  });
};

/**
 * Verify JWT token and return structured result
 */
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return { valid: true, decoded: jwt.verify(token, secret) };
  } catch (error) {
    return { valid: false, error };
  }
};

/**
 * Decode JWT token without verification
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken
};
