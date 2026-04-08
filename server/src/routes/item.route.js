const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    create, update, deleteItem, updateStatus, getById, 
    getByUser, getByCategory, getByLocation, getByStatus,
    getByDateRange, getByAttributes, getAll, getMatches,
    getLocations, getCategories } = require('../controllers/item.controller');
const { getItemComments, addComment } = require('../controllers/comment.controller');
const { upload } =  require('../config/cloudinary');

router.post('/create', protect, upload.single('image'), create);
router.put('/update/:id', protect, update);
router.delete('/delete/:id', protect, deleteItem);
router.put('/updateStatus/:id', protect, updateStatus);

// Get Items
router.get('/getAll', getAll);
router.get('/getById/:id', getById);
router.get('/getByUser', protect, getByUser);
router.get('/getByCategory', protect, getByCategory);
router.get('/getByLocation', protect, getByLocation);
router.get('/getByStatus', protect, getByStatus);
router.get('/getByDateRange', protect, getByDateRange);
router.get('/getByAttributes', protect, getByAttributes);
router.get('/matches/:id', protect, getMatches);

// Chat / Coordination Routes
router.get('/comments/:id', getItemComments);
router.post('/comments/:id', addComment);

router.get('/getLocations', protect, getLocations);
router.get('/getCategories', protect, getCategories)

module.exports = router;