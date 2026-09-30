const { body, param, query } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('organization').trim().notEmpty().withMessage('Organization is required'),
  body('role').optional().isIn(['OFFICER', 'ADMIN']).withMessage('Role must be OFFICER or ADMIN'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const createTestValidator = [
  body('testProfileCode').trim().notEmpty().withMessage('testProfileCode is required'),
  body('deviceId').trim().notEmpty().withMessage('deviceId is required'),
  body('location').optional().isObject().withMessage('Location must be an object'),
  body('location.latitude').optional().isNumeric().withMessage('Latitude must be numeric'),
  body('location.longitude').optional().isNumeric().withMessage('Longitude must be numeric'),
];

const syncBatchValidator = [
  body('records').isArray().withMessage('Records must be an array'),
];

module.exports = {
  registerValidator,
  loginValidator,
  createTestValidator,
  syncBatchValidator,
};
