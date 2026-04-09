const { Redis } = require('@upstash/redis');
require('dotenv').config();

let redis = null;

try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        console.log('⚡ Upstash Redis connected successfully');
    } else {
        console.log('⚠️  Redis variables not found. Bypassing cache.');
    }
} catch (error) {
    console.error('Redis connection failed:', error.message);
}

// Get the current version of the cache for an entity
const getCacheVersion = async (entity) => {
    if (!redis) return 1;
    try {
        const version = await redis.get(`${entity}_version`);
        if (!version) {
            await redis.set(`${entity}_version`, 1);
            return 1;
        }
        return Number(version);
    } catch (e) {
        console.error('Error fetching cache version:', e.message);
        return 1; // Fallback version
    }
};

// Invalidate the cache by incrementing the version
const invalidateCache = async (entity) => {
    if (!redis) return;
    try {
        const newVersion = await redis.incr(`${entity}_version`);
        console.log(`♻️ Cache invalidated for [${entity}]. New Version: ${newVersion}`);
    } catch (e) {
        console.error('Error invalidating cache:', e.message);
    }
};

module.exports = {
    redis,
    getCacheVersion,
    invalidateCache
};
