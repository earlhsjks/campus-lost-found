const Item = require('../models/Item');
const Notification = require('../models/Notification');
const Match = require('../models/Match');

const DAY = 24 * 60 * 60 * 1000;
const MATCH_WINDOW = 14 * DAY; // 2 weeks

const getRelevantDate = (item) => {
    if (!item) return null;
    return item?.attributes?.lastSeen || item?.createdAt || null;
};

const normalizeText = (value) => (value || '').toString().trim().toLowerCase();

// ─── Text Similarity ──────────────────────────────────────────────────────────

const STOPWORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'my', 'i', 'it', 'is', 'was', 'this', 'that', 'have',
    'has', 'had', 'be', 'been', 'are', 'its', 'found', 'lost', 'item'
]);

function stem(word) {
    if (word.length < 4) return word;
    if (word.endsWith('ing')) return word.slice(0, -3);
    if (word.endsWith('tion')) return word.slice(0, -4);
    if (word.endsWith('ed')) return word.slice(0, -2);
    if (word.endsWith('es')) return word.slice(0, -2);
    if (word.endsWith('s')) return word.slice(0, -1);
    return word;
}

function tokenize(text) {
    return (text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 1 && !STOPWORDS.has(w))
        .map(stem);
}

function textSimilarity(a, b) {
    const tokensA = tokenize(a);
    const tokensB = tokenize(b);

    if (tokensA.length === 0 && tokensB.length === 0) return 0;

    const freqA = {};
    const freqB = {};
    tokensA.forEach(w => freqA[w] = (freqA[w] || 0) + 1);
    tokensB.forEach(w => freqB[w] = (freqB[w] || 0) + 1);

    let matchScore = 0;
    const totalA = tokensA.length;
    const totalB = tokensB.length;

    for (const word of Object.keys(freqA)) {
        if (freqB[word]) {
            const rarity = 1 + (1 / (freqA[word] + freqB[word]));
            matchScore += Math.min(freqA[word], freqB[word]) * rarity;
        }
    }

    const normalized = matchScore / Math.max(totalA, totalB);
    return Math.min(normalized, 1);
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

const WEIGHTS = {
    category: 30,
    location: 20,
    date: 15,
    text: 20,
    attributes: 15,
    serial: 100
};

function scoreMatch(lost, found) {
    let score = 0;
    const reasons = [];

    // 1. Serial number — instant high-confidence match
    const lostSerial = normalizeText(lost?.attributes?.serialNumber);
    const foundSerial = normalizeText(found?.attributes?.serialNumber);
    if (lostSerial && foundSerial && lostSerial === foundSerial) {
        return { score: 1000, reasons: ['Serial number is an exact match'] };
    }

    // 2. Category
    if (lost.categoryId.equals(found.categoryId)) {
        score += WEIGHTS.category;
        reasons.push('Same category');
    }

    // 3. Location
    if (lost.locationId && found.locationId && lost.locationId.equals(found.locationId)) {
        score += WEIGHTS.location;
        reasons.push('Same location');
    }

    // 4. Date proximity
    const lostDate = getRelevantDate(lost);
    const foundDate = getRelevantDate(found);
    const diffDays = (lostDate && foundDate)
        ? Math.abs(new Date(lostDate) - new Date(foundDate)) / DAY
        : Number.POSITIVE_INFINITY;
    if (diffDays <= 1) {
        score += WEIGHTS.date;
        reasons.push('Dates are within 1 day of each other');
    } else if (diffDays <= 3) {
        score += WEIGHTS.date / 2;
        reasons.push('Dates are within 3 days of each other');
    } else if (diffDays <= 7) {
        score += WEIGHTS.date / 4;
        reasons.push('Dates are within 1 week of each other');
    } else if (diffDays <= 14) {
        score += WEIGHTS.date / 8;
        reasons.push('Dates are within 2 weeks of each other');
    }

    // 5. Text similarity
    const textScore = textSimilarity(
        `${lost?.title || ''} ${lost?.description || ''}`,
        `${found?.title || ''} ${found?.description || ''}`
    );
    score += textScore * WEIGHTS.text;
    if (textScore > 0.5) {
        reasons.push('Title and description are very similar');
    } else if (textScore > 0.2) {
        reasons.push('Title and description share some keywords');
    }

    // 6. Attributes
    const lostColor = normalizeText(lost?.attributes?.color);
    const foundColor = normalizeText(found?.attributes?.color);
    if (lostColor && lostColor === foundColor) {
        score += 5;
        reasons.push(`Color matches (${foundColor})`);
    }

    const lostBrand = normalizeText(lost?.attributes?.brand);
    const foundBrand = normalizeText(found?.attributes?.brand);
    if (lostBrand && lostBrand === foundBrand) {
        score += 10;
        reasons.push(`Brand matches (${foundBrand})`);
    }

    return { score, reasons };
}

// ─── Match Runner ─────────────────────────────────────────────────────────────

const findMatches = async (item) => {
    const oppositeType = item.type === 'lost' ? 'found' : 'lost';
    const itemDate = getRelevantDate(item);

    const query = {
        type: oppositeType,
        status: 'open',
        _id: { $ne: item._id }
    };

    if (itemDate) {
        const itemDateTime = new Date(itemDate).getTime();
        query.$or = [
            {
                "attributes.lastSeen": {
                    $gte: new Date(itemDateTime - MATCH_WINDOW),
                    $lte: new Date(itemDateTime + MATCH_WINDOW)
                }
            },
            {
                createdAt: {
                    $gte: new Date(itemDateTime - MATCH_WINDOW),
                    $lte: new Date(itemDateTime + MATCH_WINDOW)
                }
            }
        ];
    }

    const candidates = await Item.find(query);

    const scored = candidates.map(candidate => {
        const { score, reasons } = scoreMatch(item, candidate);
        return { item: candidate, score, reasons };
    });

    scored.sort((a, b) => b.score - a.score);

    const topMatches = scored.slice(0, 5);

    if (topMatches.length > 0) {
        console.log(`🎉 Found ${topMatches.length} potential matches for "${item.title}"`);

        for (const matchObj of topMatches) {
            const matchedItem = matchObj.item;

            await Match.findOneAndUpdate(
                { itemId: item._id, matchedItemId: matchedItem._id },
                {
                    itemId: item._id,
                    matchedItemId: matchedItem._id,
                    score: matchObj.score,
                    reasons: matchObj.reasons,
                    status: 'potential'
                },
                { upsert: true, new: true }
            );

            await Notification.create({
                recipientId: matchedItem.reportedBy.userId,
                type: 'match_found',
                message: `Good news! Someone just posted a ${item.type} item that strongly matches your "${matchedItem.title}".`,
                relatedItemId: item._id
            });

            await Notification.create({
                recipientId: item.reportedBy.userId,
                type: 'match_found',
                message: `We found a potential match for the item you just posted: "${matchedItem.title}".`,
                relatedItemId: matchedItem._id
            });
        }
    }

    return topMatches;
};

module.exports = { findMatches };