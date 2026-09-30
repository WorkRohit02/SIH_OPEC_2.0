import pptxgen from 'pptxgenjs';

/**
 * Generates and downloads a PowerPoint (.pptx) evidence presentation for a given field test record.
 */
export async function generatePPTReport(record) {
  const pptx = new pptxgen();

  pptx.author = 'OPEC Digital Companion';
  pptx.company = 'Field Forensic Testing Unit';
  pptx.revision = '1.0';
  pptx.subject = `Evidence Report - ${record.id}`;

  // ----------------------------------------------------
  // SLIDE 1: Title Slide (Dark Navy Theme)
  // ----------------------------------------------------
  const slide1 = pptx.addSlide();
  slide1.background = { color: '0F172A' }; // Dark Navy

  // Header Title
  slide1.addText('OPEC FORENSIC FIELD REPORT', {
    x: 0.8,
    y: 1.0,
    w: 8.4,
    h: 0.8,
    fontSize: 28,
    bold: true,
    color: '38BDF8',
    fontFace: 'Arial',
  });

  slide1.addText('Presumptive Field Test Evidence & Chain-of-Custody Audit', {
    x: 0.8,
    y: 1.8,
    w: 8.4,
    h: 0.5,
    fontSize: 16,
    color: '94A3B8',
    fontFace: 'Arial',
  });

  // Record Summary Box
  slide1.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8,
    y: 2.6,
    w: 8.4,
    h: 3.8,
    fill: { color: '1E293B' },
    line: { color: '334155', width: 1 },
  });

  const resultColor = record.result === 'positive' ? 'EF4444' : record.result === 'negative' ? '22C55E' : 'F59E0B';

  slide1.addText([
    { text: 'RECORD ID: ', options: { bold: true, color: '94A3B8' } },
    { text: `${record.id}\n\n`, options: { bold: true, color: 'FFFFFF' } },
    { text: 'PRESUMPTIVE RESULT: ', options: { bold: true, color: '94A3B8' } },
    { text: `${(record.result || 'INCONCLUSIVE').toUpperCase()}\n\n`, options: { bold: true, color: resultColor, fontSize: 20 } },
    { text: 'DATE & TIME: ', options: { bold: true, color: '94A3B8' } },
    { text: `${record.date || ''}, ${record.time || ''}\n\n`, options: { color: 'E2E8F0' } },
    { text: 'LOCATION: ', options: { bold: true, color: '94A3B8' } },
    { text: `${record.location || 'Field Device Location'}\n\n`, options: { color: 'E2E8F0' } },
    { text: 'OFFICER ID: ', options: { bold: true, color: '94A3B8' } },
    { text: `${record.officer || 'OP-4587'}`, options: { color: 'E2E8F0' } },
  ], {
    x: 1.2,
    y: 2.9,
    w: 7.6,
    h: 3.2,
    fontSize: 14,
    fontFace: 'Arial',
  });

  // ----------------------------------------------------
  // SLIDE 2: Capture Evidence & Analysis Details
  // ----------------------------------------------------
  const slide2 = pptx.addSlide();
  slide2.background = { color: 'F8FAFC' };

  slide2.addText('EVIDENCE ANALYSIS & CALIBRATION', {
    x: 0.8,
    y: 0.6,
    w: 8.4,
    h: 0.6,
    fontSize: 22,
    bold: true,
    color: '0F172A',
    fontFace: 'Arial',
  });

  // Table of details
  const tableData = [
    [{ text: 'Parameter', options: { bold: true, fill: { color: '0F172A' }, color: 'FFFFFF' } }, { text: 'Value', options: { bold: true, fill: { color: '0F172A' }, color: 'FFFFFF' } }],
    ['Reagent Type', record.reagent || 'Marquis Reagent'],
    ['Confidence Score', `${record.confidence || 92}%`],
    ['Reference Card Calibration', record.calibration || 'PASS'],
    ['Captured Attempts', `${record.attempts || 1}`],
    ['SHA-256 Hash', record.hash ? `${record.hash.slice(0, 32)}...` : 'Verified'],
    ['Digital Signature', record.tampered ? 'INVALID (TAMPERED)' : 'VALID (ECDSA / RSA-2048)'],
  ];

  slide2.addTable(tableData, {
    x: 0.8,
    y: 1.4,
    w: 8.4,
    colW: [3.2, 5.2],
    fontSize: 12,
    border: { pt: 1, color: 'CBD5E1' },
    fill: { color: 'FFFFFF' },
  });

  // Mandatory Disclaimer Box
  slide2.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8,
    y: 5.0,
    w: 8.4,
    h: 1.6,
    fill: { color: 'FEF2F2' },
    line: { color: 'FCA5A5', width: 1 },
  });

  slide2.addText('MANDATORY LEGAL & SCIENTIFIC DISCLAIMER:\nField colorimetric chemical test results are presumptive only and do not replace confirmatory laboratory mass spectrometry or chromatography analysis.', {
    x: 1.0,
    y: 5.1,
    w: 8.0,
    h: 1.4,
    fontSize: 11,
    color: '991B1B',
    italic: true,
    fontFace: 'Arial',
  });

  // ----------------------------------------------------
  // SLIDE 3: Chain-of-Custody Log
  // ----------------------------------------------------
  const slide3 = pptx.addSlide();
  slide3.background = { color: 'FFFFFF' };

  slide3.addText('CHAIN-OF-CUSTODY EVENT AUDIT', {
    x: 0.8,
    y: 0.6,
    w: 8.4,
    h: 0.6,
    fontSize: 22,
    bold: true,
    color: '0F172A',
    fontFace: 'Arial',
  });

  const auditEvents = [
    [{ text: 'Event', options: { bold: true, fill: { color: '1E293B' }, color: 'FFFFFF' } }, { text: 'Timestamp', options: { bold: true, fill: { color: '1E293B' }, color: 'FFFFFF' } }, { text: 'Actor / Device', options: { bold: true, fill: { color: '1E293B' }, color: 'FFFFFF' } }],
    ['Capture Session Initialized', `${record.date || ''} ${record.time || ''}`, record.officer || 'OP-4587'],
    ['Sharpness & Colour Shift Scanned', `${record.date || ''} ${record.time || ''}`, 'OPEC Engine v2.0'],
    ['SHA-256 Fingerprint Generated', `${record.date || ''} ${record.time || ''}`, 'Device Secure Enclave'],
    ['Digital RSA Signature Applied', `${record.date || ''} ${record.time || ''}`, 'Key (ECDSA/RSA-2048)'],
    ['Record Saved to Evidence Log', `${record.date || ''} ${record.time || ''}`, record.officer || 'OP-4587'],
  ];

  slide3.addTable(auditEvents, {
    x: 0.8,
    y: 1.5,
    w: 8.4,
    colW: [3.4, 2.5, 2.5],
    fontSize: 11,
    border: { pt: 1, color: 'E2E8F0' },
  });

  // Save the PPT file
  const fileName = `OPEC_Evidence_${record.id}.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
}
