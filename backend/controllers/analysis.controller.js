const analysisService = require('../services/analysis.service');
const recordService = require('../services/record.service');
const { sendSuccess } = require('../utils/response');

const runAnalysis = async (req, res, next) => {
  try {
    const captureId = req.params.captureId;
    const { testId, capturedSamples } = req.body;

    const analysis = await analysisService.runAnalysis({
      testId,
      captureId,
      capturedSamples: capturedSamples || { testRegionRgb: { r: 180, g: 40, b: 220 } },
      operatorId: req.user.id,
    });

    // Generate Canonical Digital Record
    let digitalRecord = null;
    if (analysis && analysis.analysisStatus === 'SUCCESS') {
      digitalRecord = await recordService.createDigitalRecord(testId, req.user.id);
    }

    return sendSuccess(res, 'Color analysis and record generation completed', { analysis, digitalRecord }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  runAnalysis,
};
