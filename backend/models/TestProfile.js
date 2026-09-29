const mongoose = require('mongoose');

const TestProfileSchema = new mongoose.Schema(
  {
    profileCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    version: {
      type: String,
      required: true,
      default: '1.0.0',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'PROTOTYPE', 'DEPRECATED'],
      default: 'PROTOTYPE',
    },
    observationWindow: {
      recommendedSeconds: { type: Number, default: 60 },
      maxWindowSeconds: { type: Number, default: 180 },
    },
    calibrationCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CalibrationCard',
      default: null,
    },
    modelVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ModelVersion',
      default: null,
    },
    decisionRules: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TestProfile', TestProfileSchema);
