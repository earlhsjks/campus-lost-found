require('dotenv').config();
const { createClient } = require('redis');
const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => {
      // console.log('Server running on port 5000');
    });
  })
  .catch(err => console.error(err));
