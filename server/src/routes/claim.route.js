const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getClaimsByItem, createClaim, approveClaim, rejectClaim } = require('../controllers/claim.controller');

// Get all claims for an item
router.get('/item/:itemId', protect, getClaimsByItem);

// Create a new claim (when user clicks I Found This / That's Mine)
router.post('/create/:itemId', protect, createClaim);

// Approve a claim (only post owner)
router.put('/approve/:claimId', protect, approveClaim);

// Reject a claim (only post owner)
router.put('/reject/:claimId', protect, rejectClaim);

module.exports = router;