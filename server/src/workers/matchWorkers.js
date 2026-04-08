const matchQueue = require('../queues/matchQueue');
const Item = require('../models/Item');
const matching = require('../services/matchService');

matchQueue.process(async (job) => {
    const { itemId } = job.data;

    const item = await Item.findById(itemId);
    if (!item) return;

    // Compute top matches
    const topMatches = await matching.findMatches(item);

    // Here: Instead of storing, you could:
    // 1) Send matches to frontend via websocket
    // 2) Or store in temporary cache (Redis) if needed
    console.log(`Top matches for item ${item._id}:`, topMatches.map(m => ({
        id: m.item._id,
        score: m.score
    })));
});