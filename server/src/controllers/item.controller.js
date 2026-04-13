const Item = require('../models/Item')
const Claim = require('../models/Claim')
const Category = require('../models/Category')
const Location = require('../models/Location')
const Match = require('../models/Match')
const { hasPermission } = ('../utils/permissions.util')
const matching = require('../utils/matching.util')
const matchQueue = require('../config/redis');
const { cloudinary } = require('../config/cloudinary');

const create = async (req, res) => {
    try {
        const { type, title, description, categoryId, locationId, attributes } = req.body;

        if (!type || !title || !categoryId || !locationId || !req.file) {

            if (req.file && req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
                console.log("Cleaned up orphaned Cloudinary image due to validation failure.");
            }

            return res.status(400).json({ success: false, message: 'Missing required fields or image.' });
        }

        const imageUrl = req.file.secure_url;
        const parsedAttributes = attributes ? JSON.parse(attributes) : {};

        const newItemData = await Item.create({
            type,
            title,
            description,
            categoryId,
            locationId,
            image: imageUrl,
            reportedBy: { userId: req.user._id, role: req.user.role },
            attributes: parsedAttributes
        });

        // Queue the matching job
        matchQueue.add({ itemId: newItemData._id }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000
            }
        }).then(job => {
            console.log(`📝 Matching job queued for item ${newItemData._id} (Job ID: ${job.id})`);
        }).catch(err => {
            console.error(`❌ Queue error for item ${newItemData._id}:`, err.message);
        });

        res.status(201).json({
            success: true,
            message: 'Item created successfully. Checking for matches...',
            item: newItemData
        });

    } catch (err) {
        console.log("Server Error during creation:", err);

        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
                console.log("Cleaned up orphaned Cloudinary image due to DB crash.");
            } catch (cleanupErr) {
                console.error("Failed to clean up Cloudinary image:", cleanupErr);
            }
        }

        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, description, categoryId, locationId, attributes } = req.body;

        const updatedItem = await Item.findByIdAndUpdate(id, {
            type: type,
            title: title,
            description: description,
            categoryId: categoryId,
            locationId: locationId,
            attributes: attributes
        }, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            item: updatedItem
        });
    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err}` });
    }
}

const updateStatus = async (req, res) => {
    try {
        const { currentRole } = req.user.role;
        const { id } = req.params;
        const { status } = req.body;

        const isAllowed = hasPermission(currentRole, 'admin');

        if (!isAllowed) {
            res.status(401).json({ success: false, message: 'Action denied.' })
        }

        const updatedItem = await Item.findByIdAndUpdate(id, { status }, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Item status updated successfully',
            item: updatedItem
        });
    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err}` });
    }
}

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedItem = await Item.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Item deleted successfully',
            item: deletedItem
        });
    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err}` });
    }
}

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id)
            .populate('categoryId', 'name')
            .populate('locationId', 'name')
            .populate('reportedBy.userId', 'name')

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.status(200).json({
            success: true,
            item: item
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
}

const getAll = async (req, res) => {
    try {
        const { type, categoryId, status } = req.query;
        let query = {};
        if (type) query.type = type;
        if (categoryId) query.categoryId = categoryId;
        if (status) query.status = status;

        const items = await Item.find(query)
            .sort({ createdAt: -1 })
            .populate('categoryId', 'name')
            .populate('locationId', 'name');

        res.status(200).json({
            success: true,
            count: items.length,
            items: items
        });
    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
}

const getByUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const userItems = await Item.find({ "reportedBy.userId": userId })
            .sort({ createdAt: -1 })
            .populate('categoryId', 'name')
            .populate('locationId', 'name');

        res.status(200).json({
            success: true,
            count: userItems.length,
            items: userItems
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: `Error fetching your items: ${err.message}`
        });
    }
}

const getByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const items = await Item.find({ categoryId }).populate('categoryId locationId', 'name');

        res.status(200).json({ success: true, count: items.length, items });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const getByLocation = async (req, res) => {
    try {
        const { locationId } = req.params;
        const items = await Item.find({ locationId }).populate('categoryId locationId', 'name');

        res.status(200).json({ success: true, count: items.length, items });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const getByType = async (req, res) => { // prolly no need for this
    try {
        const { type } = req.params;
        const items = await Item.find({ type }).populate('categoryId locationId', 'name');

        res.status(200).json({ success: true, count: items.length, items });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const getByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const items = await Item.find({ status }).populate('categoryId locationId', 'name');
        res.status(200).json({ success: true, count: items.length, items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const getByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const items = await Item.find({
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: items.length, items });
    } catch (err) {
        res.status(500).json({ success: false, message: "Invalid date format" });
    }
}

const getByAttributes = async (req, res) => {
    try {
        const items = await Item.find({ attributes: req.query });
        res.status(200).json({ success: true, count: items.length, items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const getMatches = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the item
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        // THE FIX 1: Search BOTH columns using $or
        const matches = await Match.find({
            $or: [{ itemId: id }, { matchedItemId: id }],
            status: 'potential'
        })
            // THE FIX 2: Populate BOTH sides of the match
            .populate({
                path: 'itemId matchedItemId',
                select: 'type title description image categoryId locationId attributes createdAt reportedBy',
                populate: [
                    { path: 'categoryId', select: 'name' },
                    { path: 'locationId', select: 'name' }
                ]
            })
            .sort({ score: -1 })
            .limit(5);

        // THE FIX 3: Conditionally map the "other" item
        const formattedMatches = matches.map(m => {
            // Figure out which item is the one we are currently viewing
            const isSourceItem = m.itemId && m.itemId._id.toString() === id;

            // Grab the item sitting on the other side of the relationship
            const otherItem = isSourceItem ? m.matchedItemId : m.itemId;

            // Failsafe in case a matched item was deleted from the database
            if (!otherItem) return null;

            return {
                matchId: m._id,
                score: m.score,
                matchedItem: otherItem, // Send the correct "other" item back to React
                createdAt: m.createdAt
            };
        }).filter(Boolean); // filter(Boolean) removes any null values

        res.status(200).json({
            success: true,
            itemId: id,
            matchCount: formattedMatches.length,
            matches: formattedMatches
        });
    } catch (err) {
        console.error('Error fetching matches:', err);
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
}

const getLocations = async (req, res) => {
    try {
        const locations = await Location.find()
            .sort({ name: 1 })
            .select('-createdAt -updatedAt'); // actual documents

        res.status(200).json({ success: true, locations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ name: 1 })
            .select('-createdAt -updatedAt'); // actual documents

        res.status(200).json({ success: true, categories });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateItemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g., 'resolved' or 'claimed'

        // 1. Find the item
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // 2. SECURITY CHECK: Ensure the logged-in user actually owns this post
        if (item.reportedBy.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to update this item." });
        }

        // 3. Update the status
        item.status = status;
        await item.save();

        res.status(200).json({ success: true, item });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Failed to update item status." });
    }
};

const forceMatch = async (req, res) => {
    try {
        const { itemId, matchedItemId } = req.body;

        if (!itemId || !matchedItemId) {
            return res.status(400).json({ success: false, message: 'itemId and matchedItemId are required.' });
        }

        if (itemId === matchedItemId) {
            return res.status(400).json({ success: false, message: 'An item cannot be matched with itself.' });
        }

        const [item, matchedItem] = await Promise.all([
            Item.findById(itemId),
            Item.findById(matchedItemId)
        ]);

        if (!item || !matchedItem) {
            return res.status(404).json({ success: false, message: 'One or both items were not found.' });
        }

        if (item.type === matchedItem.type) {
            return res.status(400).json({ success: false, message: 'Force-match requires one lost and one found item.' });
        }

        const isAdmin = req.user?.role === 'admin';
        const userId = req.user?._id?.toString();
        const ownsEitherItem = item.reportedBy?.userId?.toString() === userId || matchedItem.reportedBy?.userId?.toString() === userId;

        if (!isAdmin && !ownsEitherItem) {
            return res.status(403).json({ success: false, message: 'Unauthorized to force-match these items.' });
        }

        // Check for existing match record first
        const existingMatch = await Match.findOne({
            $or: [
                { itemId, matchedItemId },
                { itemId: matchedItemId, matchedItemId: itemId }
            ]
        });

        // If no existing match, run the scoring algorithm to get a proper score + reasons
        let score = 999;
        let reasons = ['Manually matched by user'];

        if (existingMatch) {
            score = existingMatch.score ?? 999;
            reasons = existingMatch.reasons?.length ? existingMatch.reasons : ['Manually matched by user'];
        } else {
            const { scoreMatch } = require('../utils/matching.util');
            const lost = item.type === 'lost' ? item : matchedItem;
            const found = item.type === 'found' ? item : matchedItem;
            const result = scoreMatch(lost, found);
            score = result.score ?? 999;
            reasons = result.reasons?.length ? result.reasons : ['Manually matched by user'];
        }

        const confirmedMatch = await Match.findOneAndUpdate(
            { itemId, matchedItemId },
            { itemId, matchedItemId, score, reasons, status: 'confirmed' },
            { upsert: true, new: true }
        );

        // Dismiss all other matches involving either item
        await Match.updateMany({
            _id: { $ne: confirmedMatch._id },
            $or: [
                { itemId: { $in: [itemId, matchedItemId] } },
                { matchedItemId: { $in: [itemId, matchedItemId] } }
            ]
        }, {
            $set: { status: 'dismissed' }
        });

        item.status = 'matched';
        item.matchedItemId = matchedItem._id;
        matchedItem.status = 'matched';
        matchedItem.matchedItemId = item._id;

        await Promise.all([item.save(), matchedItem.save()]);

        res.status(200).json({
            success: true,
            message: 'Items force-matched successfully.',
            match: confirmedMatch
        });
    } catch (error) {
        console.error('Error force-matching items:', error);
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

module.exports = {
    create,
    update,
    deleteItem,
    updateStatus,
    getById,
    getAll,
    getByUser,
    getByCategory,
    getByLocation,
    getByType,
    getByStatus,
    getByDateRange,
    getByAttributes,
    getMatches,
    getLocations,
    getCategories,
    updateItemStatus,
    forceMatch
};
