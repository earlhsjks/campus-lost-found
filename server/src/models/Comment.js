const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Item', 
    required: true 
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  senderName: { 
    type: String, 
    required: true 
  }, // Storing the name prevents us from having to populate() the user on every single message load
  text: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);