const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
    item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },

    claimant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    proof: {
        description: String,
        secret_answer: String
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    reviewed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    reviewed_at: Date
}, { timestamps: true })

module.exports = mongoose.model('Claim', claimSchema)
