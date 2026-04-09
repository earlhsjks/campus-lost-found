const Item = require('../models/Item');
const Notification = require('../models/Notification');
const Match = require('../models/Match');

const DAY = 24 * 60 * 60 * 1000

const findMatches = async (item) => {
    const oppositeType = item.type === 'lost' ? 'found' : 'lost';

    const lastSeenTime = new Date(item.attributes.lastSeen).getTime();

    const candidates = await Item.find({
        type: oppositeType,
        status: 'open',
        categoryId: item.categoryId,
        "attributes.lastSeen": {
            $gte: new Date(lastSeenTime - 3 * DAY),
            $lte: new Date(lastSeenTime + 3 * DAY)
        }
    });

    const scored = candidates.map(candidate => ({
        item: candidate,
        score: scoreMatch(item, candidate)
    }));

    scored.sort((a, b) => b.score - a.score);

    const topMatches = scored.slice(0, 5);

    if (topMatches.length > 0) {
        console.log(`🎉 Found ${topMatches.length} strong matches!`);

        for (const matchObj of topMatches) {
            const matchedItem = matchObj.item;

            // Save the match record to database
            await Match.create({
                itemId: item._id,
                matchedItemId: matchedItem._id,
                score: matchObj.score,
                status: 'potential'
            });

            // Notify the owner of the matched item
            await Notification.create({
                recipientId: matchedItem.reportedBy.userId,
                type: 'match_found',
                message: `Good news! Someone just posted a ${item.type} item that strongly matches your "${matchedItem.title}".`,
                relatedItemId: item._id
            });

            // Notify the owner of the new item
            await Notification.create({
                recipientId: item.reportedBy.userId,
                type: 'match_found',
                message: `We found a potential match for the item you just posted: "${matchedItem.title}".`,
                relatedItemId: matchedItem._id
            });
        }
    }

    return topMatches;
}

const WEIGHTS = {
    category: 30,
    location: 20,
    date: 15,
    text: 20,
    attributes: 15,
    serial: 100
}

function scoreMatch(lost, found) {
    let score = 0;

    // 1. Serial number
    if (lost.attributes.serialNumber && lost.attributes.serialNumber === found.attributes.serialNumber)
        return 1000

    // 2. Category
    if (lost.categoryId.equals(found.categoryId)) {
        score += WEIGHTS.category
    }

    // 3. Location
    if (lost.locationId.equals(found.locationId)) {
        score += WEIGHTS.location
    }

    // 4. Date prox
    const diffDays = Math.abs(lost.lastSeen - found.createdAt) / (1000 * 60 * 60 * 24)
    if (diffDays <= 1) score += WEIGHTS.date
    else if (diffDays <= 3) score += WEIGHTS.date / 2

    // 5. Text similarity
    score += textSimilarity(lost.title + lost.description, found.title + found.description) * WEIGHTS.text

    // 6. Attributes
    if (lost.attributes.color === found.attributes.color) {
        score += 5
    }

    if (lost.attributes.brand === found.attributes.brand) {
        score += 10
    }

    return score
}

function textSimilarity(a, b) {
    const wordsA = new Set(a.toLowerCase().split(' '))
    const wordsB = new Set(b.toLowerCase().split(' '))

    const intersection = [...wordsA].filter(x => wordsB.has(x)).length
    const union = new Set([...wordsA, ...wordsB]).size

    return union === 0 ? 0 : intersection / union
}

// const results = candidates.map(found => ({
//     item: found,
//     score: scoreMatch(lostItem, found)
// }))

// results.sort((a, b) => b.score - a.score)

// const topMatches = results.slice(0, 5)

// module.exports = {
//     candidates
// }

module.exports = { findMatches }