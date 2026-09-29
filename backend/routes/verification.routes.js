const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');

// Verification endpoint can be called publicly or with auth header
router.get('/:recordId', verificationController.verifyRecord);
router.post('/:recordId/verify', verificationController.verifyRecord);

module.exports = router;
