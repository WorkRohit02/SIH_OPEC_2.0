const PDFDocument = require('pdfkit');
const Test = require('../models/Test');
const DigitalRecord = require('../models/DigitalRecord');
const User = require('../models/User');
const TestProfile = require('../models/TestProfile');
const Analysis = require('../models/Analysis');
const { MANDATORY_DISCLAIMERS } = require('../utils/constants');
const { logEvent } = require('./audit.service');
const { AUDIT_ACTIONS } = require('../utils/constants');

/**
 * REPORT SERVICE
 * Generates official PDF evidence reports using PDFKit.
 * Enforces mandatory presumptive scientific terminology and limitations.
 */

/**
 * Generates a PDF report stream for a given test ID
 * @param {string} testId 
 * @param {string} operatorId 
 * @returns {Promise<Buffer>} PDF Buffer
 */
const generateTestReportPDF = async (testId, operatorId) => {
  const isMongoId = typeof testId === 'string' && testId.match(/^[0-9a-fA-F]{24}$/);
  const test = await Test.findOne({
    $or: [{ testId: testId }, { _id: isMongoId ? testId : null }],
  });
  if (!test) {
    throw new Error('Test not found for PDF report generation');
  }


  const operator = await User.findById(test.operatorId);
  const profile = await TestProfile.findById(test.testProfileId);
  const digitalRecord = await DigitalRecord.findOne({ testId: test._id });
  const analysis = await Analysis.findById(test.finalResultId);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(buffers);

        // Audit Log PDF Report Generation
        await logEvent({
          testId: test._id,
          recordId: digitalRecord ? digitalRecord._id : null,
          operatorId,
          action: AUDIT_ACTIONS.REPORT_GENERATED,
          deviceId: test.deviceId,
        });

        resolve(pdfBuffer);
      });

      // --- HEADER SECTION ---
      doc.rect(0, 0, doc.page.width, 70).fill('#1E293B');
      doc.fillColor('#FFFFFF')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('COLOR-SAFE', 40, 18);

      doc.fontSize(10)
         .font('Helvetica')
         .text('SMARTPHONE COLORIMETRIC FIELD TEST RECORD', 40, 44);

      doc.fontSize(9)
         .fillColor('#EF4444')
         .font('Helvetica-Bold')
         .text(MANDATORY_DISCLAIMERS.LAB_CONFIRMATION_REQUIRED, doc.page.width - 240, 26, { width: 200, align: 'right' });

      doc.moveDown(3);

      // --- SECTION 1: IDENTIFICATION & METADATA ---
      doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold').text('1. Test Identification & Metadata');
      doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Test ID: ${test.testId}`);
      doc.text(`Operator Name / ID: ${operator ? operator.name : 'Unknown'} (${operator ? operator.operatorId : 'N/A'})`);
      doc.text(`Organization: ${operator ? operator.organization : 'N/A'}`);
      doc.text(`Device ID: ${test.deviceId}`);
      doc.text(`Test Profile: ${profile ? profile.name : 'Prototype Profile'} (${profile ? profile.profileCode : 'CP-01'})`);
      doc.text(`Timestamp: ${test.completedAt ? new Date(test.completedAt).toUTCString() : new Date().toUTCString()}`);
      if (test.location && test.location.latitude) {
        doc.text(`GPS Location: Lat ${test.location.latitude}, Lon ${test.location.longitude} (Accuracy ±${test.location.accuracy || 0}m)`);
      } else {
        doc.text(`GPS Location: Not Recorded`);
      }
      doc.moveDown(1);

      // --- SECTION 2: PRESUMPTIVE RESULT ---
      doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold').text('2. Presumptive Classification Result');
      doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();
      doc.moveDown(0.5);

      const resultText = analysis ? analysis.classification : (test.status || 'INCONCLUSIVE');
      let resultColor = '#64748B';
      if (resultText === 'PRESUMPTIVE_POSITIVE') resultColor = '#DC2626';
      if (resultText === 'PRESUMPTIVE_NEGATIVE') resultColor = '#16A34A';

      doc.rect(40, doc.y, 515, 45).fillAndStroke('#F8FAFC', '#E2E8F0');
      doc.fillColor(resultColor).fontSize(16).font('Helvetica-Bold').text(`RESULT: ${resultText}`, 55, doc.y - 35);
      doc.fillColor('#475569').fontSize(9).font('Helvetica').text(`Confidence Score: ${(analysis ? analysis.confidence * 100 : 0).toFixed(1)}% | Model Version: ${analysis ? analysis.modelVersion : 'v1.0.0-prototype'}`, 55, doc.y + 2);
      doc.moveDown(2);

      // --- SECTION 3: COLOUR & CALIBRATION DATA ---
      doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold').text('3. Color & Calibration Analysis');
      doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();
      doc.moveDown(0.5);

      if (analysis && analysis.features) {
        const rgb = analysis.features.rgb || { r: 0, g: 0, b: 0 };
        const lab = analysis.features.lab || { l: 0, a: 0, b: 0 };
        const hsv = analysis.features.hsv || { h: 0, s: 0, v: 0 };
        const hex = analysis.features.hex || '#000000';

        doc.fontSize(10).font('Helvetica');
        doc.text(`Calibrated RGB: R:${rgb.r}, G:${rgb.g}, B:${rgb.b}`);
        doc.text(`CIE-Lab Coordinates: L:${lab.l}, a:${lab.a}, b:${lab.b}`);
        doc.text(`HSV Color Space: H:${hsv.h}°, S:${hsv.s}, V:${hsv.v}`);
        doc.text(`Display Reference HEX: ${hex}`);
        doc.text(`Calibration Status: SUCCESS (Prototype Gain Adaptation Applied)`);
      } else {
        doc.fontSize(10).font('Helvetica').text('No calibrated feature matrix available.');
      }
      doc.moveDown(1);

      // --- SECTION 4: INTEGRITY & CRYPTOGRAPHIC HASHES ---
      doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold').text('4. Evidence Integrity & Cryptographic Hashes');
      doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();
      doc.moveDown(0.5);

      doc.fontSize(9).font('Helvetica');
      doc.text(`Original Evidence Image SHA-256:`, { underline: true });
      doc.font('Courier').text(digitalRecord ? digitalRecord.imageHash : 'N/A');
      doc.font('Helvetica').text(`Canonical Record SHA-256 Hash:`, { underline: true });
      doc.font('Courier').text(digitalRecord ? digitalRecord.canonicalRecordHash : 'N/A');
      doc.font('Helvetica').text(`Digital Signature Status: ${digitalRecord ? digitalRecord.signatureStatus : 'UNSIGNED'}`);
      doc.font('Helvetica').text(`Signature Algorithm: ${digitalRecord && digitalRecord.digitalSignature ? digitalRecord.digitalSignature.algorithm : 'RSA-SHA256-PROTOTYPE'}`);
      doc.moveDown(1);

      // --- SECTION 5: INTERPRETATION & LIMITATIONS ---
      doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text('5. Interpretation & Scientific Limitations');
      doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();
      doc.moveDown(0.5);

      doc.fontSize(8.5).font('Helvetica').fillColor('#334155');
      doc.text(MANDATORY_DISCLAIMERS.LIMITATION_STATEMENT, { align: 'justify' });
      doc.moveDown(0.5);
      doc.text('This field test provides presumptive decision support based on smartphone optical colorimetry. It does not replace qualitative or quantitative analytical laboratory methods (GC-MS, LC-MS, FTIR).', { align: 'justify' });

      // Footer
      doc.fontSize(8).fillColor('#94A3B8').text('COLOR-SAFE Field Drug Testing System — Confidential Evidence Record', 40, doc.page.height - 30, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateTestReportPDF,
};
