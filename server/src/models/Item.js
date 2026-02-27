const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: String,

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true,
    },

    reportedBy: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: String,
    },

    status: {
        type: String,
        enum: ['open', 'matched', 'claimed', 'closed'],
        default: 'open'
    },

    attributes: {
        color: String,
        brand: String,
        serialNumber: String
    },

    matchedItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }

}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema)