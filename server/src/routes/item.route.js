const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { create, update, deleteItem, updateStatus } = require('../controllers/item.controller');
const { upload } =  require('../config/cloudinary')

router.post('/create', protect, upload.single('image'), create);
router.put('/update/:id', protect, update);
router.delete('/delete/:id', protect, deleteItem);
router.put('/updateStatus/:id', protect, updateStatus);

module.exports = router;