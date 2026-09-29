const TestProfile = require('../models/TestProfile');
const CalibrationCard = require('../models/CalibrationCard');

/**
 * TEST PROFILE SERVICE
 * Manages colorimetric field test profile configurations.
 * 
 * PROTOTYPE PROFILE POLICY:
 * Does NOT seed real-world reagent names (Marquis, Duquenois-Levine, etc.) or fake chemical thresholds.
 * Initializes a clearly labelled prototype profile 'CP-01' ("Prototype Colorimetric Test Profile").
 */

/**
 * Ensures prototype profile CP-01 exists in database
 */
const ensurePrototypeProfileExists = async () => {
  let prototypeCard = await CalibrationCard.findOne({ cardCode: 'CC-PROTOTYPE-01' });
  if (!prototypeCard) {
    prototypeCard = await CalibrationCard.create({
      cardCode: 'CC-PROTOTYPE-01',
      name: 'Prototype Calibration Reference Card Target',
      version: '1.0.0',
      status: 'PROTOTYPE',
      patches: [
        { patchId: 'W1', position: { x: 0, y: 0 }, referenceRGB: { r: 255, g: 255, b: 255 }, referenceHex: '#FFFFFF' },
        { patchId: 'K1', position: { x: 1, y: 0 }, referenceRGB: { r: 0, g: 0, b: 0 }, referenceHex: '#000000' },
        { patchId: 'G1', position: { x: 0, y: 1 }, referenceRGB: { r: 128, g: 128, b: 128 }, referenceHex: '#808080' },
      ],
    });
  }

  let profile = await TestProfile.findOne({ profileCode: 'CP-01' });
  if (!profile) {
    profile = await TestProfile.create({
      profileCode: 'CP-01',
      name: 'Prototype Colorimetric Test Profile',
      description: 'Prototype test profile for field testing verification and decision support layer demonstration.',
      version: '1.0.0-prototype',
      status: 'PROTOTYPE',
      observationWindow: { recommendedSeconds: 60, maxWindowSeconds: 180 },
      calibrationCardId: prototypeCard._id,
      decisionRules: {
        prototypePositiveCheck: { minHue: 200, maxHue: 280 }, // Example prototype hue check range
      },
    });
  }
  return profile;
};

const getActiveProfiles = async () => {
  await ensurePrototypeProfileExists();
  return await TestProfile.find({ status: { $in: ['ACTIVE', 'PROTOTYPE'] } }).populate('calibrationCardId');
};

const getProfileByCode = async (profileCode) => {
  await ensurePrototypeProfileExists();
  const profile = await TestProfile.findOne({ profileCode: profileCode.toUpperCase() }).populate('calibrationCardId');
  if (!profile) {
    const error = new Error(`Test Profile '${profileCode}' not found.`);
    error.statusCode = 404;
    throw error;
  }
  return profile;
};

const createProfile = async (profileData, createdBy) => {
  const existing = await TestProfile.findOne({ profileCode: profileData.profileCode.toUpperCase() });
  if (existing) {
    const error = new Error(`Profile code '${profileData.profileCode}' already exists.`);
    error.statusCode = 409;
    throw error;
  }

  return await TestProfile.create({
    ...profileData,
    profileCode: profileData.profileCode.toUpperCase(),
    createdBy,
  });
};

module.exports = {
  ensurePrototypeProfileExists,
  getActiveProfiles,
  getProfileByCode,
  createProfile,
};
