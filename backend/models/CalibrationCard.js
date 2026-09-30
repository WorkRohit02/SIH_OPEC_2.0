const mongoose = require('mongoose');

const PatchSchema = new mongoose.Schema(
  {
    patchId: { type: String, required: true },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    referenceRGB: {
      r: { type: Number, required: true },
      g: { type: Number, required: true },
      b: { type: Number, required: true },
    },
    referenceLab: {
      l: { type: Number, default: 0 },
      a: { type: Number, default: 0 },
      b: { type: Number, default: 0 },
    },
    referenceHSV: {
      h: { type: Number, default: 0 },
      s: { type: Number, default: 0 },
      v: { type: Number, default: 0 },
    },
    referenceHex: { type: String, default: '#000000' }, // For UI reference only
  },
  { _id: false }
);

const CalibrationCardSchema = new mongoose.Schema(
  {
    cardCode: {
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
    version: {
      type: String,
      required: true,
      default: '1.0.0',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PROTOTYPE', 'DEPRECATED'],
      default: 'PROTOTYPE',
    },
    patches: [PatchSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CalibrationCard', CalibrationCardSchema);
