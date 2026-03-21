const Item = require('../models/Item')
const { hasPermission } = ('../utils/permissions.util')
const { upload } = require('../config/cloudinary')

const create = async (req, res) => {
    try {
        const { type, title, description, categoryId, locationId, attributes } = req.body;

        if (!type || !title || !categoryId || !locationId || !req.file.path ) {
            return res.status(400).json({ success: false, message: 'Missing required fields' })
        }

        const imageUrl = req.file.path;

        const newItemData = await Item.create({
            type: type,
            title: title,
            description: description,
            categoryId: categoryId,
            locationId: locationId,
            image: imageUrl, 
            reportedBy: {
                userId: req.user._id,
                role: req.user.role
            },
            attributes: attributes
        });

        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            item: newItemData
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: `Server error: ${err}` })
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

// TODO: Get items (filter: lost/found) - PEEJ

const getById = async (req, res) => {

}

const getAll = async (req, res) => {

}

const getByUser = async (req, res) => {

}

const getByCategory = async (req, res) => {

}

const getByLocation = async (req, res) => {

}

const getByType = async (req, res) => {

}

const getByStatus = async (req, res) => {

}

const getByDateRange = async (req, res) => {

}

const getByAttributes = async (req, res) => {

}

module.exports = {
    create,
    update,
    deleteItem,
    updateStatus
};