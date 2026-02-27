const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/items', require('./routes/item.routes'));

app.get('/', (req, res) => {
  res.send('API running');
});

module.exports = app;
