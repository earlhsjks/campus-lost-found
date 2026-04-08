const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware')
const { register, login, logout, me } = require('../controllers/auth.controller');

router.post('/signup', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);

module.exports = router;