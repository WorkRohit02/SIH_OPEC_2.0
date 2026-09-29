const mongoose = require('mongoose');
const { CLASSIFICATION_RESULT } = require('../utils/constants');

const DigitalRecordSchema = new mongoose.Schema(
  {
    recordId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    humanReadableTestId: {
      type: String,
      required: true,
      index: true,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    testProfileCode: {
      type: String,
      required: true,
    },
    profileVersion: {
      type: String,
      default: '1.0.0',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
    },
    evidence: {
      imageKitFileId: String,
      imageUrl: String,
      sha256: String,
    },
    qualityChecks: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    analysisSummary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    result: {
      type: String,
      enum: Object.values(CLASSIFICATION_RESULT),
      required: true,
    },
    modelVersion: {
      type: String,
      default: 'v1.0.0-prototype',
    },
    calibrationVersion: {
      type: String,
      default: 'v1.0.0-prototype',
    },
    imageHash: {
      type: String,
      required: true,
    },
    canonicalRecordHash: {
      type: String,
      required: true,
      index: true,
    },
    digitalSignature: {
      signature: { type: String, required: true },
      algorithm: { type: String, default: 'RSA-SHA256-PROTOTYPE' },
      publicKeyFingerprint: { type: String, default: 'EPHEMERAL_PROTOTYPE_KEY' },
      signedAt: { type: Date, default: Date.now },
    },
    signatureStatus: {
      type: String,
      enum: ['SIGNED', 'UNSIGNED', 'INVALID'],
      default: 'SIGNED',
    },
    recordVersion: {
      type: String,
      default: '1.0.0',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DigitalRecord', DigitalRecordSchema);
