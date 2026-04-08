const Notification = require('../models/Notification');

const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipientId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
            
        const unreadCount = notifications.filter(n => !n.isRead).length;

        res.status(200).json({ notifications, unreadCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ message: "Failed to update notification." });
    }
};

module.exports = { getUserNotifications, markAsRead };