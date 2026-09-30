const express = require('express');
const router = express.Router();
const testProfileController = require('../controllers/testProfile.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', protect, testProfileController.listProfiles);
router.get('/:profileCode', protect, testProfileController.getProfileByCode);
router.post('/', protect, authorize('ADMIN'), testProfileController.createProfile);

module.exports = router;
