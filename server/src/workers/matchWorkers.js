const matchQueue = require('../config/redis');
const Item = require('../models/Item');
const { findMatches } = require('../utils/matching.util');

// Process matching jobs from the queue
matchQueue.process(async (job) => {
    try {
        const { itemId } = job.data;

        const item = await Item.findById(itemId);
        if (!item) {
            console.log(`❌ Item ${itemId} not found`);
            return;
        }

        console.log(`🔍 Running matching algorithm for item: ${item.title}`);

        // Compute top matches (this also creates notifications automatically)
        const topMatches = await findMatches(item);

        console.log(`✅ Matching complete for item ${item._id}:`, topMatches.map(m => ({
            title: m.item.title,
            score: m.score
        })));

        return topMatches;
    } catch (error) {
        console.error(`❌ Error processing match job:`, error);
        throw error;
    }
});

// Handle queue events
matchQueue.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

matchQueue.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
});