const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Get all pending claims for an item (for post owner)
const getClaimsByItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        // Verify the user owns this item
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        if (item.reportedBy.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view claims for this item' });
        }

        // Get all claims for this item (pending, approved, rejected)
        const claims = await Claim.find({ itemId })
            .populate('claimantID', 'name email')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            itemId,
            claimCount: claims.length,
            pendingCount: claims.filter(c => c.status === 'pending').length,
            claims
        });
    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
};

// Create a claim when user clicks "I Found This" / "That's Mine!"
const createClaim = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { proof = 'Auto-claimed' } = req.body;

        // Verify item exists
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        // Don't allow owner to claim their own item
        if (item.reportedBy.userId.toString() === req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Cannot claim your own item' });
        }

        // Check if user already has a pending claim for this item
        const existingClaim = await Claim.findOne({
            itemId,
            claimantID: req.user._id,
            status: 'pending'
        });

        if (existingClaim) {
            return res.status(400).json({ success: false, message: 'You already have a pending claim for this item' });
        }

        // Create the claim
        const newClaim = await Claim.create({
            itemId,
            claimantID: req.user._id,
            proof,
            status: 'pending'
        });

        // Notify the post owner about the new claim
        await Notification.create({
            recipientId: item.reportedBy.userId,
            type: 'new_claim',
            message: `Someone claimed your "${item.title}"! Review the claim in the item details.`,
            relatedItemId: itemId
        });

        res.status(201).json({
            success: true,
            message: 'Claim submitted successfully',
            claim: newClaim
        });
    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
};

// Approve a claim (only post owner)
const approveClaim = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { claimId } = req.params;

        const claim = await Claim.findById(claimId).session(session);
        if (!claim) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        const item = await Item.findById(claim.itemId).session(session);
        if (!item) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        // Verify the user is the post owner
        if (item.reportedBy.userId.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Update claim status
        const updatedClaim = await Claim.findByIdAndUpdate(
            claimId,
            {
                status: 'approved',
                reviewedBy: req.user._id,
                reviewedAt: new Date()
            },
            { new: true, session }
        );

        // Update item status
        const updatedItem = await Item.findByIdAndUpdate(
            claim.itemId,
            { status: 'claimed' },
            { new: true, session }
        );

        // Notify the claimant that their claim was approved
        await Notification.create(
            [{
                recipientId: claim.claimantID,
                type: 'claim_approved',
                message: `Great news! Your claim for "${item.title}" was approved!`,
                relatedItemId: item._id
            }],
            { session }
        );

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: 'Claim approved successfully',
            claim: updatedClaim,
            item: updatedItem
        });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    } finally {
        await session.endSession();
    }
};

// Reject a claim (only post owner)
const rejectClaim = async (req, res) => {
    try {
        const { claimId } = req.params;
        const { reason = 'Not approved' } = req.body;

        const claim = await Claim.findById(claimId);
        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        const item = await Item.findById(claim.itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        // Verify the user is the post owner
        if (item.reportedBy.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Update claim status
        const updatedClaim = await Claim.findByIdAndUpdate(
            claimId,
            {
                status: 'rejected',
                reviewedBy: req.user._id,
                reviewedAt: new Date()
            },
            { new: true }
        );

        // Notify the claimant that their claim was rejected
        await Notification.create({
            recipientId: claim.claimantID,
            type: 'claim_rejected',
            message: `Your claim for "${item.title}" was not approved. ${reason}`,
            relatedItemId: item._id
        });

        res.status(200).json({
            success: true,
            message: 'Claim rejected successfully',
            claim: updatedClaim
        });
    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
};

module.exports = {
    getClaimsByItem,
    createClaim,
    approveClaim,
    rejectClaim
};