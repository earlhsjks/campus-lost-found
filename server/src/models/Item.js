const mongoose = ruquire('mongoose');

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
        deafult: 'open'
    },

    attrubutes: {
        color: String,
        brand: String,
        serialNumber: String
    },

    matchedItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }

}, { timestamp: true });

module.exports = mongoose.model('Item', itemSchema)