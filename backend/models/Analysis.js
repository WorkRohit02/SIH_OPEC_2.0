const mongoose = require('mongoose');
const { CLASSIFICATION_RESULT } = require('../utils/constants');

const FeatureDataSchema = new mongoose.Schema(
  {
    rgb: {
      r: { type: Number, required: true },
      g: { type: Number, required: true },
      b: { type: Number, required: true },
    },
    lab: {
      l: { type: Number, default: 0 },
      a: { type: Number, default: 0 },
      b: { type: Number, default: 0 },
    },
    hsv: {
      h: { type: Number, default: 0 },
      s: { type: Number, default: 0 },
      v: { type: Number, default: 0 },
    },
    hex: { type: String, default: '#000000' }, // UI reference representation only
    deltaE: { type: Number, default: 0 },
  },
  { _id: false }
);

const TimePointSchema = new mongoose.Schema(
  {
    timestampSeconds: { type: Number, required: true },
    features: FeatureDataSchema,
  },
  { _id: false }
);

const AnalysisSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    captureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Capture',
      required: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestProfile',
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
    features: FeatureDataSchema,
    colourTrajectory: [TimePointSchema],
    classification: {
      type: String,
      enum: Object.values(CLASSIFICATION_RESULT),
      required: true,
      default: CLASSIFICATION_RESULT.INCONCLUSIVE,
    },
    confidence: {
      type: Number,
      default: 0.0,
      min: 0.0,
      max: 1.0,
    },
    explanation: {
      type: String,
      default: 'Presumptive test analysis output.',
    },
    analysisStatus: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'INCONCLUSIVE'],
      default: 'SUCCESS',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Analysis', AnalysisSchema);
