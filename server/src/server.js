require('dotenv').config();
const { createClient } = require('redis');
const mongoose = require('mongoose');
const app = require('./app');

// Initialize match workers
require('./workers/matchWorkers');

// Initialize idle item cleanup
const { closeIdleItems } = require('./workers/idleItems');

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error('MONGO_URI environment variable is not set');
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    console.log('🚀 Match workers initialized');
    
    // Run idle item cleanup every 24 hours
    const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
    setInterval(closeIdleItems, CLEANUP_INTERVAL);
    console.log('⏰ Idle item cleanup scheduled (every 24 hours)');
    
    app.listen(5000, () => {
      console.log('✅ Server running on port 5000');
      // DEV Init Collections
      // const Category = require('./models/Category');
      // Category.createCollection();
    });
  })
  .catch(err => console.error(err));
