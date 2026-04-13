const Item = require('../models/Item');
const Notification = require('../models/Notification');
const Match = require('../models/Match');

const DAY = 24 * 60 * 60 * 1000

const getRelevantDate = (item) => {
    if (!item) return null;
    return item?.attributes?.lastSeen || item?.createdAt || null;
}

const normalizeText = (value) => (value || '').toString().trim().toLowerCase();

const findMatches = async (item) => {
    const oppositeType = item.type === 'lost' ? 'found' : 'lost';
    const itemDate = getRelevantDate(item);

    const query = {
        type: oppositeType,
        status: 'open',
        categoryId: item.categoryId
    };

    if (itemDate) {
        const itemDateTime = new Date(itemDate).getTime();
        query.$or = [
            {
                "attributes.lastSeen": {
                    $gte: new Date(itemDateTime - 3 * DAY),
                    $lte: new Date(itemDateTime + 3 * DAY)
                }
            },
            {
                createdAt: {
                    $gte: new Date(itemDateTime - 3 * DAY),
                    $lte: new Date(itemDateTime + 3 * DAY)
                }
            }
        ];
    }

    const candidates = await Item.find(query);

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
            await Match.findOneAndUpdate({
                itemId: item._id,
                matchedItemId: matchedItem._id
            }, {
                itemId: item._id,
                matchedItemId: matchedItem._id,
                score: matchObj.score,
                status: 'potential'
            }, {
                upsert: true,
                new: true
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
    const lostSerial = normalizeText(lost?.attributes?.serialNumber);
    const foundSerial = normalizeText(found?.attributes?.serialNumber);
    if (lostSerial && foundSerial && lostSerial === foundSerial)
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
    const lostDate = getRelevantDate(lost);
    const foundDate = getRelevantDate(found);
    const diffDays = (lostDate && foundDate)
        ? Math.abs(new Date(lostDate) - new Date(foundDate)) / DAY
        : Number.POSITIVE_INFINITY;
    if (diffDays <= 1) score += WEIGHTS.date
    else if (diffDays <= 3) score += WEIGHTS.date / 2

    // 5. Text similarity
    score += textSimilarity(`${lost?.title || ''} ${lost?.description || ''}`, `${found?.title || ''} ${found?.description || ''}`) * WEIGHTS.text

    // 6. Attributes
    if (normalizeText(lost?.attributes?.color) && normalizeText(lost?.attributes?.color) === normalizeText(found?.attributes?.color)) {
        score += 5
    }

    if (normalizeText(lost?.attributes?.brand) && normalizeText(lost?.attributes?.brand) === normalizeText(found?.attributes?.brand)) {
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