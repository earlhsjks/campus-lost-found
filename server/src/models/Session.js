const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },

  token: { 
    type: String, 
    unique: true 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  },

  expiresAt: { 
    type: Date 
  }

});

module.exports = mongoose.model('Session', sessionSchema);
