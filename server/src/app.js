const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express();

// --- 🛠️ DYNAMIC CORS CONFIGURATION ---
const allowedOrigins = [
  'https://seegson.fun',       // Your Production Frontend (Sit here)
  'https://www.seegson.fun',
  'http://localhost:5173',     // Your Local Vite Frontend
  'http://127.0.0.1:5173'      // Alternative Local IP
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Required for cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// --- 🛣️ ROUTES ---
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/item', require('./routes/item.route'));
app.use('/api/claim', require('./routes/claim.route')); // Fixed missing '/'
app.use('/api/notification', require('./routes/notification.route'));

app.get('/', (req, res) => {
  res.send('Campus Lost Found API Running');
});

module.exports = app;