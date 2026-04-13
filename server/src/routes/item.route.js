const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    create, update, deleteItem, updateStatus, getById, 
    getByUser, getByCategory, getByLocation, getByStatus,
    getByDateRange, getByAttributes, getAll, getMatches,
    getLocations, getCategories, updateItemStatus, forceMatch } = require('../controllers/item.controller');
const { getItemComments, addComment } = require('../controllers/comment.controller');
const { upload } =  require('../config/cloudinary');

const Item = require('../models/Item.js')
const { findMatches } = require('../utils/matching.util');

router.post('/create', protect, upload.single('image'), create);
router.put('/update/:id', protect, update);
router.delete('/delete/:id', protect, deleteItem);
router.put('/updateStatus/:id', protect, updateStatus);

// Items
router.get('/getAll', getAll);
router.get('/getById/:id', getById);
router.get('/getByUser', protect, getByUser);
router.get('/getByCategory', protect, getByCategory);
router.get('/getByLocation', protect, getByLocation);
router.get('/getByStatus', protect, getByStatus);
router.get('/getByDateRange', protect, getByDateRange);
router.get('/getByAttributes', protect, getByAttributes);
router.get('/matches/:id', getMatches);
router.post('/force-match', protect, forceMatch);
router.put('/:id/status', protect, updateItemStatus);

router.get('/force/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;

        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        // --- DEBUG ---
        const oppositeType = item.type === 'lost' ? 'found' : 'lost';
        const DAY = 24 * 60 * 60 * 1000;
        const MATCH_WINDOW = 14 * DAY;
        const itemDate = item?.attributes?.lastSeen || item?.createdAt;
        const itemDateTime = new Date(itemDate).getTime();

        const rawCandidates = await Item.find({
            type: oppositeType,
            status: 'open',
            categoryId: item.categoryId
        });
        console.log('✅ Candidates ignoring date filter:', rawCandidates.map(c => c.title));

        const withDateFilter = await Item.find({
            type: oppositeType,
            status: 'open',
            categoryId: item.categoryId,
            $or: [
                { "attributes.lastSeen": { $gte: new Date(itemDateTime - MATCH_WINDOW), $lte: new Date(itemDateTime + MATCH_WINDOW) } },
                { createdAt: { $gte: new Date(itemDateTime - MATCH_WINDOW), $lte: new Date(itemDateTime + MATCH_WINDOW) } }
            ]
        });
        console.log('✅ Candidates WITH date filter:', withDateFilter.map(c => c.title));
        // --- END DEBUG ---

        const topMatches = await findMatches(item);

        return res.status(200).json({
            success: true,
            itemId: item._id,
            title: item.title,
            type: item.type,
            categoryId: item.categoryId,
            itemDate,
            windowStart: new Date(itemDateTime - MATCH_WINDOW),
            windowEnd: new Date(itemDateTime + MATCH_WINDOW),
            rawCandidateCount: rawCandidates.length,
            filteredCandidateCount: withDateFilter.length,
            matchesFound: topMatches.length,
            matches: topMatches.map(m => ({
                matchedItemId: m.item._id,
                title: m.item.title,
                score: m.score,
                reasons: m.reasons
            }))
        });
    } catch (error) {
        console.error('❌ Force match error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid item ID format' });
        }
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Chat / Coordination Routes
router.get('/comments/:id', getItemComments);
router.post('/comments/:id', addComment);

router.get('/getLocations', protect, getLocations);
router.get('/getCategories', protect, getCategories)

module.exports = router;
