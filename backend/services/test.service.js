const Test = require('../models/Test');
const TestProfile = require('../models/TestProfile');
const { ensurePrototypeProfileExists } = require('./testProfile.service');
const generateTestId = require('../utils/generateTestId');
const { logEvent } = require('./audit.service');
const { AUDIT_ACTIONS, TEST_STATUS, ROLES } = require('../utils/constants');

/**
 * TEST SERVICE
 * Manages master field test lifecycles, human-readable ID generation, and ownership enforcement.
 */

/**
 * Creates a new Field Test master record
 */
const createTest = async ({ operatorId, testProfileCode = 'CP-01', deviceId, location, appVersion = '1.0.0' }) => {
  let profile = await TestProfile.findOne({ profileCode: testProfileCode.toUpperCase() });
  if (!profile) {
    profile = await ensurePrototypeProfileExists();
  }

  // Generate unique human-readable Test ID (FT-YYYY-XXXXXX)
  const currentYear = new Date().getFullYear();
  const testCountThisYear = await Test.countDocuments({
    createdAt: {
      $gte: new Date(currentYear, 0, 1),
      $lt: new Date(currentYear + 1, 0, 1),
    },
  });

  const humanReadableTestId = generateTestId(testCountThisYear + 1);

  const test = await Test.create({
    testId: humanReadableTestId,
    operatorId,
    deviceId,
    testProfileId: profile._id,
    status: TEST_STATUS.IN_PROGRESS,
    startedAt: new Date(),
    location: location || { latitude: null, longitude: null, accuracy: null },
    appVersion,
  });

  // Log Audit Event
  await logEvent({
    testId: test._id,
    operatorId,
    action: AUDIT_ACTIONS.TEST_CREATED,
    deviceId,
    metadata: { testId: humanReadableTestId, profileCode: profile.profileCode },
  });

  return test;
};

/**
 * Retrieves a test by ID with ownership authorization check
 */
const getTestById = async (testId, requestingUser) => {
  const test = await Test.findOne({
    $or: [{ testId: testId }, { _id: testId.match(/^[0-9a-fA-F]{24}$/) ? testId : null }],
  })
    .populate('operatorId', 'operatorId name email organization role')
    .populate('testProfileId')
    .populate('currentCaptureId')
    .populate('finalResultId');

  if (!test) {
    const error = new Error(`Field Test '${testId}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  // Enforce Ownership Security Rule: Officer can only view their own test unless ADMIN
  if (requestingUser.role !== ROLES.ADMIN && test.operatorId._id.toString() !== requestingUser.id.toString()) {
    const error = new Error('Access denied. You are not authorized to view this test record.');
    error.statusCode = 403;
    throw error;
  }

  return test;
};

/**
 * Lists tests with pagination, status, date range, and search filtering
 */
const listTests = async (requestingUser, queryParams = {}) => {
  const { page = 1, limit = 10, search, status, dateFrom, dateTo } = queryParams;

  const query = {};

  // Officer scope: only see own tests unless Admin
  if (requestingUser.role !== ROLES.ADMIN) {
    query.operatorId = requestingUser.id;
  }

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { testId: { $regex: search, $options: 'i' } },
      { deviceId: { $regex: search, $options: 'i' } },
    ];
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await Test.countDocuments(query);

  const tests = await Test.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .populate('operatorId', 'operatorId name organization')
    .populate('testProfileId', 'profileCode name')
    .populate('finalResultId', 'classification confidence');

  return {
    tests,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createTest,
  getTestById,
  listTests,
};
