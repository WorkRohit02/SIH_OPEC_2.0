const { sendError } = require('../utils/response');

/**
 * Role-Based Access Control Middleware
 * @param  {...string} roles Allowed roles (e.g., 'ADMIN', 'OFFICER')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'User authentication required', 401, 'UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `User role '${req.user.role}' is not authorized to perform this action`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};

module.exports = { authorize };
