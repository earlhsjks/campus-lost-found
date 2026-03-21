const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },

    claimantID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    proof: {
        description: String,
        secretAnswer: String
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    reviewedAt: Date
}, { timestamps: true })

module.exports = mongoose.model('Claim', claimSchema)
