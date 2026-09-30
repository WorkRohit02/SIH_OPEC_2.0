/**
 * COLOUR SERVICE
 * Handles RGB, HSV, Lab color space conversions and DeltaE calculations.
 * NOTE: HEX is exclusively for display/UI purposes and must never be the core scientific measurement.
 */

/**
 * Converts RGB object { r, g, b } (0-255) to HSV { h (0-360), s (0-1), v (0-1) }
 */
const rgbToHsv = ({ r, g, b }) => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = max === 0 ? 0 : delta / max;
  let v = max;

  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h * 100) / 100,
    s: Math.round(s * 1000) / 1000,
    v: Math.round(v * 1000) / 1000,
  };
};

/**
 * Converts RGB object { r, g, b } (0-255) to CIE-Lab { l, a, b }
 */
const rgbToLab = ({ r, g, b }) => {
  // Pivot RGB values to XYZ
  let rP = r / 255;
  let gP = g / 255;
  let bP = b / 255;

  rP = rP > 0.04045 ? Math.pow((rP + 0.055) / 1.055, 2.4) : rP / 12.92;
  gP = gP > 0.04045 ? Math.pow((gP + 0.055) / 1.055, 2.4) : gP / 12.92;
  bP = bP > 0.04045 ? Math.pow((bP + 0.055) / 1.055, 2.4) : bP / 12.92;

  // D65 Standard Illuminant Reference
  const x = (rP * 0.4124 + gP * 0.3576 + bP * 0.1805) * 100;
  const y = (rP * 0.2126 + gP * 0.7152 + bP * 0.0722) * 100;
  const z = (rP * 0.0193 + gP * 0.1192 + bP * 0.9505) * 100;

  // XYZ to CIE-Lab
  let xNorm = x / 95.047;
  let yNorm = y / 100.0;
  let zNorm = z / 108.883;

  xNorm = xNorm > 0.008856 ? Math.pow(xNorm, 1 / 3) : 7.787 * xNorm + 16 / 116;
  yNorm = yNorm > 0.008856 ? Math.pow(yNorm, 1 / 3) : 7.787 * yNorm + 16 / 116;
  zNorm = zNorm > 0.008856 ? Math.pow(zNorm, 1 / 3) : 7.787 * zNorm + 16 / 116;

  const l = 116 * yNorm - 16;
  const aVal = 500 * (xNorm - yNorm);
  const bVal = 200 * (yNorm - zNorm);

  return {
    l: Math.round(l * 100) / 100,
    a: Math.round(aVal * 100) / 100,
    b: Math.round(bVal * 100) / 100,
  };
};

/**
 * Converts RGB to HEX representation string for UI display
 */
const rgbToHex = ({ r, g, b }) => {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

/**
 * Calculates CIE76 DeltaE (Euclidean distance in CIE-Lab space)
 */
const calculateDeltaE76 = (lab1, lab2) => {
  const dL = lab1.l - lab2.l;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.round(Math.sqrt(dL * dL + da * da + db * db) * 100) / 100;
};

/**
 * Helper to construct full feature set from raw RGB
 */
const extractFeaturesFromRgb = (rgb) => {
  const hsv = rgbToHsv(rgb);
  const lab = rgbToLab(rgb);
  const hex = rgbToHex(rgb);

  return {
    rgb,
    hsv,
    lab,
    hex,
    deltaE: 0,
  };
};

module.exports = {
  rgbToHsv,
  rgbToLab,
  rgbToHex,
  calculateDeltaE76,
  extractFeaturesFromRgb,
};
