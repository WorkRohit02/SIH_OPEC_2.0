const express = require('express');
const router = express.Router();
const syncController = require('../controllers/sync.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { syncBatchValidator } = require('../utils/validators');

router.use(protect);

router.post('/', syncBatchValidator, validate, syncController.syncRecords);

module.exports = router;
