const Item = require('../models/Item')

const create = async (req, res) => { 
    try { 
        const { type, title, description, categoryId, locationId, attributes } = req.body;

        if (!title || !title || !categoryId || !locationId || !type) { 
            return res.status(400).json({ message: 'Missing required fields' })
        }

        const newItemData = await Item.create({ 
            type: type,
            title: title,
            description: description,
            categoryId: categoryId,
            locationId: locationId,
            reportedBy: { 
                userId: req.user._id,
                role: req.user.role
                },
            attributes: attributes
         });
         
         res.status(201).json({
            message: 'Item created successfully',
            item: newItemData
         })

    } catch (err) {
        res.status(500).json({ message: `Server error: ${err}` })
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
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({
            message: 'Item updated successfully',
            item: updatedItem
        });
    } catch (err) {
        res.status(500).json({ message: `Server error: ${err}` });
    }
}

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedItem = await Item.findByIdAndUpdate(id, { status }, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({
            message: 'Item status updated successfully',
            item: updatedItem
        });
    } catch (err) {
        res.status(500).json({ message: `Server error: ${err}` });
    }
}

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedItem = await Item.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({
            message: 'Item deleted successfully',
            item: deletedItem
        });
    } catch (err) {
        res.status(500).json({ message: `Server error: ${err}` });
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