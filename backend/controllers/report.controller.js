const reportService = require('../services/report.service');

const downloadReportPDF = async (req, res, next) => {
  try {
    const testId = req.params.testId;
    const pdfBuffer = await reportService.generateTestReportPDF(testId, req.user.id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="TestReport_${testId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadReportPDF,
};
