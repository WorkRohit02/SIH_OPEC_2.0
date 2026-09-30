const mongoose = require('mongoose');

const ModelVersionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: String,
      required: true,
      trim: true,
    },
    algorithm: {
      type: String,
      required: true,
      default: 'PROTOTYPE_CLASSIFIER',
    },
    profileCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    datasetVersion: {
      type: String,
      default: 'v1.0-prototype',
    },
    modelHash: {
      type: String,
      default: '0000000000000000000000000000000000000000000000000000000000000000',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PROTOTYPE', 'DEPRECATED'],
      default: 'PROTOTYPE',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ModelVersion', ModelVersionSchema);
