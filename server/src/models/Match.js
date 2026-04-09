const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Item',
    required: true 
  },
  matchedItemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Item',
    required: true 
  },
  score: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    enum: ['potential', 'confirmed', 'dismissed'],
    default: 'potential'
  }
}, { timestamps: true });

// Create index for faster queries
matchSchema.index({ itemId: 1, score: -1 });

module.exports = mongoose.model('Match', matchSchema);
