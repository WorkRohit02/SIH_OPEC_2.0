const { CLASSIFICATION_RESULT, MANDATORY_DISCLAIMERS } = require('../utils/constants');

/**
 * CLASSIFICATION SERVICE (PROTOTYPE CLASSIFIER)
 * 
 * Responsibilities:
 * - Accepts extracted color features, test profile rules, and model version
 * - Evaluates presumptive classification state
 * - Emits controlled presumptive terminology ONLY
 * 
 * PROTOTYPE CLASSIFIER DISCLAIMER:
 * This service implements a prototype decision-tree abstraction.
 * It does NOT claim scientific accuracy and does not confirm specific chemical identities.
 * Production models (KNN, SVM, CNN, or mobile edge inference) will be plugged in via this service signature.
 */

/**
 * Classifies color features into a presumptive result
 * 
 * @param {Object} features Calibrated color features (RGB/Lab/HSV)
 * @param {Object} testProfile Active TestProfile document or configuration
 * @param {string} [modelVersion] Model version string
 * @returns {Object} { classification, confidence, modelVersion, explanation, disclaimer }
 */
const classify = (features, testProfile, modelVersion = 'v1.0.0-prototype') => {
  // Defensive checks: if features or profile are missing/invalid, return INCONCLUSIVE
  if (!features || !features.rgb) {
    return {
      classification: CLASSIFICATION_RESULT.INCONCLUSIVE,
      confidence: 0.0,
      modelVersion,
      explanation: 'Insufficient feature data provided for presumptive color analysis.',
      disclaimer: MANDATORY_DISCLAIMERS.LAB_CONFIRMATION_REQUIRED,
    };
  }

  // Check quality/threshold flags in test profile decision rules if available
  const rules = (testProfile && testProfile.decisionRules) || {};

  // Prototype Classifier logic based on threshold rules
  let classification = CLASSIFICATION_RESULT.INCONCLUSIVE;
  let confidence = 0.50;
  let explanation = 'Color response evaluated against prototype decision profile thresholds.';

  if (rules.prototypePositiveCheck) {
    const { minHue, maxHue } = rules.prototypePositiveCheck;
    const hue = features.hsv ? features.hsv.h : 0;

    if (hue >= minHue && hue <= maxHue) {
      classification = CLASSIFICATION_RESULT.PRESUMPTIVE_POSITIVE;
      confidence = 0.85;
      explanation = `Presumptive color shift observed within expected profile hue range (${minHue}° - ${maxHue}°).`;
    } else {
      classification = CLASSIFICATION_RESULT.PRESUMPTIVE_NEGATIVE;
      confidence = 0.80;
      explanation = `Presumptive color response did not exhibit expected target hue shift.`;
    }
  } else {
    // Default prototype fallback behavior for unconfigured test profiles
    classification = CLASSIFICATION_RESULT.INCONCLUSIVE;
    confidence = 0.50;
    explanation = `Prototype test profile '${testProfile ? testProfile.profileCode : 'CP-01'}' requires laboratory confirmation. No definitive rule triggered.`;
  }

  return {
    classification,
    confidence,
    modelVersion,
    explanation: `${explanation} ${MANDATORY_DISCLAIMERS.LAB_CONFIRMATION_REQUIRED}`,
    disclaimer: MANDATORY_DISCLAIMERS.LAB_CONFIRMATION_REQUIRED,
  };
};

module.exports = {
  classify,
};
