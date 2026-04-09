const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const { redis, getCacheVersion } = require('../middleware/cache');

// GET /api/packages/version — lightweight version checker for frontend localStorage invalidation
router.get('/version', async (req, res) => {
    try {
        const version = await getCacheVersion('packages');
        res.json({ version });
    } catch (err) {
        res.status(500).json({ version: 1 });
    }
});

// GET /api/packages — all packages with optional category filter
router.get('/', async (req, res) => {
    try {
        const { category, featured } = req.query;
        
        // Tell CDN to cache the response (s-maxage=300s, stale-while-revalidate=1day)
        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');

        // Versioning for cache invalidations
        const version = await getCacheVersion('packages');
        const cacheKey = `packages:v${version}:cat_${category || 'all'}:feat_${featured || 'all'}`;

        if (redis) {
            const cachedPackages = await redis.get(cacheKey);
            if (cachedPackages) {
                // If the object returned is already parsed, send it. Upstash Auto-parses JSON.
                return res.json(typeof cachedPackages === 'string' ? JSON.parse(cachedPackages) : cachedPackages);
            }
        }

        const filter = {};
        if (category) filter.category = category;
        if (featured === 'true') filter.isFeatured = true;
        
        // Light DB Query (Projection): Fetch only essential fields to save bandwidth
        const packages = await Package.find(filter)
            .select('_id slug title location country category price rating isFeatured images')
            .sort({ isFeatured: -1, createdAt: -1 });

        if (redis) {
            try {
                // Save to Redis with Expiry of 24 Hours (86400 seconds)
                await redis.set(cacheKey, packages, { ex: 86400 });
            } catch (redisErr) {
                console.error("Redis caching error (skipping cache write):", redisErr.message);
            }
        }

        res.json(packages);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/packages/:slug — single package by slug
router.get('/:slug', async (req, res) => {
    try {
        const pkg = await Package.findOne({ slug: req.params.slug });
        if (!pkg) return res.status(404).json({ message: 'Package not found' });
        res.json(pkg);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
