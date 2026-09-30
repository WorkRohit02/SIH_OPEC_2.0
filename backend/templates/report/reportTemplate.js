const { MANDATORY_DISCLAIMERS } = require('../../utils/constants');

/**
 * Report Template constants and styling helpers for PDF generation
 */
const reportStyles = {
  colors: {
    primary: '#1E293B',
    secondary: '#0F172A',
    accent: '#2563EB',
    positive: '#DC2626',
    negative: '#16A34A',
    inconclusive: '#64748B',
    lightBg: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  fonts: {
    title: 'Helvetica-Bold',
    body: 'Helvetica',
    code: 'Courier',
  },
  disclaimer: MANDATORY_DISCLAIMERS.LIMITATION_STATEMENT,
};

module.exports = reportStyles;
