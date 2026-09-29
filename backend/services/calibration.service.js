/**
 * CALIBRATION SERVICE (PROTOTYPE INTERFACE)
 * 
 * Responsibilities:
 * - Accept detected reference-card patch values captured under field illuminants
 * - Compare captured patch values against reference target patch values
 * - Calculate illuminant/camera color transformation parameters
 * - Return calibrated test-region color features
 * 
 * PROTOTYPE IMPLEMENTATION NOTICE:
 * This is a well-defined prototype interface. The mathematical color transformation algorithm
 * (e.g. 3x3 affine matrix, polynomial color correction, or Bradford chromatic adaptation)
 * will be plugged in when the CV team provides the final calibration model.
 */

const { extractFeaturesFromRgb } = require('./colour.service');

/**
 * Calibrates captured color features against reference calibration target patches.
 * 
 * @param {Object} capturedSamples - Captured RGB patch samples from field photo
 * @param {Object} calibrationCard - Calibration card reference schema document
 * @param {Object} [referenceSamples] - Optional manual reference overrides
 * @returns {Object} { calibratedFeatures, calibrationStatus, transformMatrix, calibrationVersion }
 */
const calibrate = (capturedSamples, calibrationCard, referenceSamples = null) => {
  if (!capturedSamples || !capturedSamples.testRegionRgb) {
    return {
      calibratedFeatures: null,
      calibrationStatus: 'FAILED',
      calibrationVersion: 'v1.0.0-prototype',
      transformMatrix: null,
      message: 'Missing testRegionRgb in captured samples',
    };
  }

  const rawRgb = capturedSamples.testRegionRgb;

  // PROTOTYPE CALIBRATION LOGIC:
  // Simple linear gain adjustment prototype based on white/grey patch if available
  let gain = { r: 1.0, g: 1.0, b: 1.0 };

  if (capturedSamples.referencePatches && capturedSamples.referencePatches.white) {
    const capWhite = capturedSamples.referencePatches.white;
    const refWhite = { r: 255, g: 255, b: 255 };
    gain.r = capWhite.r > 0 ? refWhite.r / capWhite.r : 1.0;
    gain.g = capWhite.g > 0 ? refWhite.g / capWhite.g : 1.0;
    gain.b = capWhite.b > 0 ? refWhite.b / capWhite.b : 1.0;
  }

  const calibratedRgb = {
    r: Math.max(0, Math.min(255, Math.round(rawRgb.r * gain.r))),
    g: Math.max(0, Math.min(255, Math.round(rawRgb.g * gain.g))),
    b: Math.max(0, Math.min(255, Math.round(rawRgb.b * gain.b))),
  };

  const calibratedFeatures = extractFeaturesFromRgb(calibratedRgb);

  return {
    calibratedFeatures,
    calibrationStatus: 'SUCCESS',
    calibrationVersion: 'v1.0.0-prototype',
    transformMatrix: {
      type: 'PROTOTYPE_LINEAR_GAIN',
      gain,
    },
    message: 'Prototype color calibration applied successfully.',
  };
};

module.exports = {
  calibrate,
};
