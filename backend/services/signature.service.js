const crypto = require('crypto');
const env = require('../config/env');

/**
 * DIGITAL SIGNATURE SERVICE (PROTOTYPE)
 * 
 * Cryptographic Architecture:
 * - Asymmetric RSA-2048 / ECDSA digital signature
 * - Private key signs canonicalized evidence JSON payload
 * - Public key verifies payload authenticity without needing signing secret
 * 
 * PROTOTYPE DISCLAIMER:
 * This implementation uses an ephemeral RSA keypair generated on startup if no external 
 * PEM keys are supplied in environment variables. 
 * Production deployment MUST integrate Hardware Security Modules (HSM) or cloud KMS (e.g. AWS KMS / Azure Key Vault).
 */

let rsaKeyPair = {
  privateKey: env.RSA_PRIVATE_KEY,
  publicKey: env.RSA_PUBLIC_KEY,
};

// Auto-generate prototype RSA keypair if missing in development environment
if (!rsaKeyPair.privateKey || !rsaKeyPair.publicKey) {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  rsaKeyPair.privateKey = privateKey;
  rsaKeyPair.publicKey = publicKey;
  console.log('[Signature Service] Ephemeral prototype RSA-2048 keypair generated for evidence signing.');
}

/**
 * Signs a canonical record payload string
 * @param {string} canonicalPayload 
 * @returns {Object} { signature, algorithm, publicKeyFingerprint }
 */
const signRecord = (canonicalPayload) => {
  if (typeof canonicalPayload !== 'string') {
    throw new Error('Canonical payload must be a string for signing');
  }

  const signer = crypto.createSign('SHA256');
  signer.update(canonicalPayload);
  signer.end();

  const signature = signer.sign(rsaKeyPair.privateKey, 'base64');
  
  // Calculate public key fingerprint
  const fingerprint = crypto.createHash('sha256').update(rsaKeyPair.publicKey).digest('hex').substring(0, 16);

  return {
    signature,
    algorithm: 'RSA-SHA256-PROTOTYPE',
    publicKeyFingerprint: fingerprint,
    signedAt: new Date(),
  };
};

/**
 * Verifies digital signature against canonical record payload string
 * @param {string} canonicalPayload 
 * @param {string} signature Base64 signature
 * @param {string} [publicKeyPem] Optional public key PEM (defaults to system prototype public key)
 * @returns {boolean} isValid
 */
const verifySignature = (canonicalPayload, signature, publicKeyPem = null) => {
  try {
    const keyToUse = publicKeyPem || rsaKeyPair.publicKey;
    const verifier = crypto.createVerify('SHA256');
    verifier.update(canonicalPayload);
    verifier.end();

    return verifier.verify(keyToUse, signature, 'base64');
  } catch (error) {
    console.error('[Signature Verification Error]:', error.message);
    return false;
  }
};

/**
 * Returns public key string for verification purposes
 */
const getPublicKey = () => {
  return rsaKeyPair.publicKey;
};

module.exports = {
  signRecord,
  verifySignature,
  getPublicKey,
};
