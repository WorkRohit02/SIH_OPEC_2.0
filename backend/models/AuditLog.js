const mongoose = require('mongoose');
const { AUDIT_ACTIONS } = require('../utils/constants');

const AuditLogSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      default: null,
      index: true,
    },
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DigitalRecord',
      default: null,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    deviceId: {
      type: String,
      default: 'UNKNOWN_DEVICE',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    previousHash: {
      type: String,
      default: '0000000000000000000000000000000000000000000000000000000000000000',
    },
    currentHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
