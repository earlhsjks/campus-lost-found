const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/item', require('./routes/item.route'));
app.use('api/claim', require('./routes/claim.route'));
app.use('/api/notification', require('./routes/notification.route'));

app.get('/', (req, res) => {
  res.send('API running');
});

module.exports = app;
