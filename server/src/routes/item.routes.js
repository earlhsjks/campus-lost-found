const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { create, update, deleteItem, updateStatus } = require('../controllers/item.controller');

router.post('/create', protect, create);
router.put('/update/:id', protect, update);
router.delete('/delete/:id', protect, deleteItem);
router.put('/updateStatus/:id', protect, updateStatus);

module.exports = router;