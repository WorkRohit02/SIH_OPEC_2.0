const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { sendError } = require('../utils/response');

/**
 * Middleware to verify JWT authentication token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication token missing. Please log in.', 401, 'UNAUTHORIZED');
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Fetch user from DB to ensure account is active
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return sendError(res, 'User associated with token no longer exists.', 401, 'UNAUTHORIZED');
    }

    if (!user.isActive) {
      return sendError(res, 'User account is deactivated.', 403, 'ACCOUNT_DISABLED');
    }

    // Attach user identity to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
