const { sendError } = require('../utils/response');
const env = require('../config/env');

/**
 * Centralized HTTP Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.code || 'INTERNAL_ERROR';
  let details = err.details || null;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Database Schema Validation Failed';
    details = Object.values(err.errors).map((e) => e.message);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = `Invalid resource ID format: ${err.value}`;
  }

  // Handle Duplicate Key Error (11000)
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate field value entered: ${field}`;
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid Authentication Token';
  }

  // Handle JWT Token Expired
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication Token Expired';
  }

  // Handle Multer Errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    errorCode = 'FILE_TOO_LARGE';
    message = 'Uploaded file exceeds maximum allowed size limit';
  }

  const stack = env.NODE_ENV === 'development' ? err.stack : undefined;

  return sendError(res, message, statusCode, errorCode, details || stack);
};

module.exports = errorHandler;
