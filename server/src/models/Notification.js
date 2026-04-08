const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['match_found', 'new_comment', 'system'],
    default: 'match_found'
  },
  message: { 
    type: String, 
    required: true 
  },
  relatedItemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Item' 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);