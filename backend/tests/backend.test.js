const request = require('supertest');
const app = require('../app');
const canonicalizeRecord = require('../utils/canonicalizeRecord');
const { hashString, hashBuffer } = require('../utils/hash');
const { signRecord, verifySignature } = require('../services/signature.service');
const { calibrate } = require('../services/calibration.service');
const { classify } = require('../services/classification.service');
const { verifyRecordIntegrity } = require('../services/verification.service');
const { CLASSIFICATION_RESULT, MANDATORY_DISCLAIMERS } = require('../utils/constants');

describe('COLOR-SAFE Backend Core Unit & Integration Tests', () => {

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health should return 200 OK', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('COLOR-SAFE');
    });
  });

  describe('2. SHA-256 Cryptographic Hashing & Canonicalization', () => {
    it('hashBuffer should generate consistent 64-char hex digest', () => {
      const sampleBuffer = Buffer.from('COLOR-SAFE EVIDENCE SAMPLE');
      const hash1 = hashBuffer(sampleBuffer);
      const hash2 = hashBuffer(sampleBuffer);
      expect(hash1).toHaveLength(64);
      expect(hash1).toEqual(hash2);
    });

    it('canonicalizeRecord should deterministically sort object keys regardless of insertion order', () => {
      const objA = { z: 1, a: 'test', m: { b: 2, a: 1 } };
      const objB = { a: 'test', m: { a: 1, b: 2 }, z: 1 };
      
      const strA = canonicalizeRecord(objA);
      const strB = canonicalizeRecord(objB);
      expect(strA).toEqual(strB);

      const hashA = hashString(strA);
      const hashB = hashString(strB);
      expect(hashA).toEqual(hashB);
    });
  });

  describe('3. Asymmetric Digital Signature Service', () => {
    it('signRecord should sign canonical string and verifySignature should return true', () => {
      const canonicalPayload = canonicalizeRecord({ testId: 'FT-2026-000001', result: 'PRESUMPTIVE_POSITIVE' });
      const signatureOutput = signRecord(canonicalPayload);

      expect(signatureOutput.signature).toBeDefined();
      expect(signatureOutput.algorithm).toEqual('RSA-SHA256-PROTOTYPE');

      const isValid = verifySignature(canonicalPayload, signatureOutput.signature);
      expect(isValid).toBe(true);
    });

    it('verifySignature should return false if payload is tampered', () => {
      const originalPayload = canonicalizeRecord({ testId: 'FT-2026-000001', result: 'PRESUMPTIVE_POSITIVE' });
      const signatureOutput = signRecord(originalPayload);

      const tamperedPayload = canonicalizeRecord({ testId: 'FT-2026-000001', result: 'PRESUMPTIVE_NEGATIVE' });
      const isValid = verifySignature(tamperedPayload, signatureOutput.signature);
      expect(isValid).toBe(false);
    });
  });

  describe('4. Prototype Calibration & Classification Services', () => {
    it('calibrate should accept raw RGB samples and return gain-adjusted features', () => {
      const captured = {
        testRegionRgb: { r: 100, g: 150, b: 200 },
        referencePatches: { white: { r: 250, g: 250, b: 250 } },
      };

      const result = calibrate(captured, null);
      expect(result.calibrationStatus).toEqual('SUCCESS');
      expect(result.calibratedFeatures.rgb).toBeDefined();
      expect(result.calibratedFeatures.lab).toBeDefined();
      expect(result.calibratedFeatures.hsv).toBeDefined();
      expect(result.calibratedFeatures.hex).toBeDefined();
    });

    it('classify should enforce presumptive terminology and disclaimers', () => {
      const features = {
        rgb: { r: 100, g: 50, b: 200 },
        hsv: { h: 250, s: 0.75, v: 0.78 },
        lab: { l: 40, a: 40, b: -50 },
      };

      const mockProfile = {
        profileCode: 'CP-01',
        decisionRules: { prototypePositiveCheck: { minHue: 200, maxHue: 280 } },
      };

      const result = classify(features, mockProfile);
      expect([
        CLASSIFICATION_RESULT.PRESUMPTIVE_POSITIVE,
        CLASSIFICATION_RESULT.PRESUMPTIVE_NEGATIVE,
        CLASSIFICATION_RESULT.INCONCLUSIVE
      ]).toContain(result.classification);

      expect(result.explanation).toContain(MANDATORY_DISCLAIMERS.LAB_CONFIRMATION_REQUIRED);
      expect(result.explanation).not.toContain('Drug Detected');
      expect(result.explanation).not.toContain('Confirmed Positive');
    });
  });

  describe('5. Unauthorized Route Protection', () => {
    it('GET /api/tests without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/tests');
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toEqual('UNAUTHORIZED');
    });
  });

});
