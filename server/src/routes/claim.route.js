const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { claimItem, approveClaim } = require('../controllers/claim.controller')

router.post('/claim', protect, claimItem);
router.put('/approve', protect, approveClaim)

module.exports = router;