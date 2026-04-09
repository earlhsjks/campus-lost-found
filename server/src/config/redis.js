const Queue = require('bull');
const { REDIS_URL } = process.env;

// Pass the configuration options as the 3rd parameter
const matchQueue = new Queue('item-matching', REDIS_URL, {
    redis: {
        maxRetriesPerRequest: null, // Disables the 20-retry crash limit
        enableReadyCheck: false,
        tls: { rejectUnauthorized: false } // Helps prevent SSL drops with cloud Redis like Upstash
    }
}); 

module.exports = matchQueue;