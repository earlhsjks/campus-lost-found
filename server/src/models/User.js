const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  schoolId: { 
    type: Number, 
    unique: true, 
    required: true 
  },
  
  name: String,
  
  email: { 
    type: String, 
    unique: true, 
    required: true 
  },

  password: { 
    type: String, 
    required: true 
  },

  role: { 
    type: String, 
    default: 'student' 
  },

  isActive: { 
    type: Boolean, 
    default: true 
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
