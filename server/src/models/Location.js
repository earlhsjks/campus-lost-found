const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);