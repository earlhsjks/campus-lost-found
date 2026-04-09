const Item = require('../models/Item');
const Notification = require('../models/Notification');

/**
 * Auto-close idle items that haven't been updated in a long time
 * Items are considered idle if they haven't had activity (comments, status updates) in 30 days
 */
const closeIdleItems = async () => {
    try {
        const IDLE_DAYS = 30; // Close items that haven't been updated in 30 days
        const cutoffDate = new Date(Date.now() - IDLE_DAYS * 24 * 60 * 60 * 1000);

        // Find open items that haven't been updated since cutoff date
        const idleItems = await Item.find({
            status: 'open',
            updatedAt: { $lt: cutoffDate }
        });

        console.log(`🔍 Found ${idleItems.length} idle items to close`);

        for (const item of idleItems) {
            try {
                // Close the item
                await Item.findByIdAndUpdate(item._id, { status: 'closed' });

                // Notify the post owner
                await Notification.create({
                    recipientId: item.reportedBy.userId,
                    type: 'auto_closed',
                    message: `Your "${item.title}" item was automatically closed due to inactivity.`,
                    relatedItemId: item._id
                });

                console.log(`✅ Closed idle item: ${item.title} (${item._id})`);
            } catch (error) {
                console.error(`❌ Error closing item ${item._id}:`, error.message);
            }
        }

        console.log(`✅ Idle item cleanup complete`);
    } catch (error) {
        console.error(`❌ Error in closeIdleItems:`, error.message);
    }
};

module.exports = { closeIdleItems };
