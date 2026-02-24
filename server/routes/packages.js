const express = require('express');
const router = express.Router();
const Package = require('../models/Package');

// GET /api/packages — all packages with optional category filter
router.get('/', async (req, res) => {
    try {
        const { category, featured } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (featured === 'true') filter.isFeatured = true;
        const packages = await Package.find(filter).sort({ isFeatured: -1, createdAt: -1 });
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
