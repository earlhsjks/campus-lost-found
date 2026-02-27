require('dotenv').config();
const { createClient } = require('redis');
const mongoose = require('mongoose');
const app = require('./app');

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error('MONGO_URI environment variable is not set');
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => {
      // DEV Init Collections
      // const Category = require('./models/Category');
      // Category.createCollection();
    });
  })
  .catch(err => console.error(err));
