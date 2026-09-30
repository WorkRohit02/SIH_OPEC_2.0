const mongoose = require('mongoose');

const MediaFileSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true },
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
    sha256: { type: String, required: true },
    storagePath: { type: String, default: '' },
    category: { type: String, enum: ['ORIGINAL', 'PROCESSED', 'OVERLAY'], default: 'ORIGINAL' },
  },
  { _id: false }
);

const QualityChecksSchema = new mongoose.Schema(
  {
    blurPassed: { type: Boolean, default: true },
    exposurePassed: { type: Boolean, default: true },
    lightingPassed: { type: Boolean, default: true },
    framingPassed: { type: Boolean, default: true },
    sharpnessPassed: { type: Boolean, default: true },
    referenceCardDetected: { type: Boolean, default: true },
    testRegionDetected: { type: Boolean, default: true },
  },
  { _id: false }
);

const CaptureSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    imageFiles: [MediaFileSchema],
    videoFiles: [MediaFileSchema],
    capturedAt: {
      type: Date,
      default: Date.now,
    },
    qualityChecks: QualityChecksSchema,
    referenceCardDetection: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    testRegionDetection: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    calibrationStatus: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'NOT_APPLIED'],
      default: 'NOT_APPLIED',
    },
    captureStatus: {
      type: String,
      enum: ['CAPTURED', 'FAILED', 'CANCELLED'],
      default: 'CAPTURED',
    },
    imageHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Capture', CaptureSchema);
