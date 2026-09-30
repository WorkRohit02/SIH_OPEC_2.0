const { sendError } = require('../utils/response');

/**
 * 404 Not Found Middleware
 */
const notFound = (req, res, next) => {
  return sendError(res, `Route Not Found - [${req.method}] ${req.originalUrl}`, 404, 'NOT_FOUND');
};

module.exports = notFound;
