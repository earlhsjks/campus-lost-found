const Queue = require('bull');
const { REDIS_URL } = process.env;

const matchQueue = new Queue('item-matching', REDIS_URL); 

module.exports = matchQueue;