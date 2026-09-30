const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const { ROLES } = require('../utils/constants');

/**
 * AUTH SERVICE
 * Handles user authentication, registration, password hashing, and JWT token issuance.
 */

/**
 * Generates JWT Access and Refresh Tokens
 */
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

/**
 * Registers a new Operator or Admin User
 */
const registerUser = async ({ name, email, password, organization, phone, role = ROLES.OFFICER }) => {
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    const error = new Error('Email address already registered.');
    error.statusCode = 409;
    error.code = 'DUPLICATE_EMAIL';
    throw error;
  }

  // Generate unique operator ID
  const count = await User.countDocuments();
  const prefix = role === ROLES.ADMIN ? 'ADM' : 'OFF';
  const operatorId = `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    operatorId,
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    organization,
    role,
    passwordHash,
  });

  const tokens = generateTokens(user._id, user.role);

  return {
    user: {
      id: user._id,
      operatorId: user.operatorId,
      name: user.name,
      email: user.email,
      organization: user.organization,
      role: user.role,
    },
    ...tokens,
  };
};

/**
 * Authenticates user login
 */
const loginUser = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    const error = new Error('Invalid email or password credentials.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('User account is deactivated. Contact Administrator.');
    error.statusCode = 403;
    error.code = 'ACCOUNT_DISABLED';
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password credentials.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = generateTokens(user._id, user.role);

  return {
    user: {
      id: user._id,
      operatorId: user.operatorId,
      name: user.name,
      email: user.email,
      organization: user.organization,
      role: user.role,
    },
    ...tokens,
  };
};

/**
 * Refreshes JWT token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      const error = new Error('Invalid refresh token or inactive user.');
      error.statusCode = 401;
      throw error;
    }

    return generateTokens(user._id, user.role);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token.');
    error.statusCode = 401;
    error.code = 'INVALID_REFRESH_TOKEN';
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
};
