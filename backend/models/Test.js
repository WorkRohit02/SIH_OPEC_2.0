const mongoose = require('mongoose');
const { TEST_STATUS } = require('../utils/constants');

const LocationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    accuracy: { type: Number, default: null },
  },
  { _id: false }
);

const TestSchema = new mongoose.Schema(
  {
    testId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    testProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestProfile',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TEST_STATUS),
      default: TEST_STATUS.DRAFT,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    location: LocationSchema,
    appVersion: {
      type: String,
      default: '1.0.0',
    },
    currentCaptureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Capture',
      default: null,
    },
    finalResultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Test', TestSchema);
