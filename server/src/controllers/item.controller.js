const Item = require('../models/Item')
const Claim = require('../models/Claim')
const Category = require('../models/Category')
const Location = require('../models/Location')
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

        matchQueue.add({ itemId: newItemData._id }).catch(err => {
            console.error("Queue error (Ignored):", err.message);
        });

        res.status(201).json({
            success: true,
            message: 'Item created successfully. Matching in background.',
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
            .populate('locationId', 'name');

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
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const topMatches = await matching.findMatches(item);
    res.json({ matches: topMatches });
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
    getCategories
};