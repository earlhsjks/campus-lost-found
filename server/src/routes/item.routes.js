const express = require('express');
const router = express.Router();
const { create } = require('../controllers/item.controller');

router.post('/create', create);

module.exports = router;