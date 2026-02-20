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
                userId: res.user.name,
                role: res.user.role
                },
                attributes: attributes
         });
         
         res.stsatus(201).json({
            message: 'Item created successfully',
            item: newItemData
         })

    } catch (err) {
        res.status(500).json({ message: `Server error: ${err}` })
    }
}

module.exports = { create };