const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Validates request payload against express-validator rules
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return sendError(res, 'Validation failed', 422, 'VALIDATION_ERROR', formattedErrors);
  }
  next();
};

module.exports = validate;
