const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Package = require('../models/Package');
const Enquiry = require('../models/Enquiry');
const auth = require('../middleware/auth');
// POST /api/admin/upload - Receive Base64 image and echo it back for MongoDB storage
router.post('/upload', auth, (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ message: 'No image data provided' });

        // Return the base64 string to be stored directly in MongoDB
        res.json({ url: image });
    } catch (err) {
        res.status(500).json({ message: 'Error processing image', error: err.message });
    }
});

// ── PACKAGES ──────────────────────────────────────────────

// GET /api/admin/packages
router.get('/packages', auth, async (req, res) => {
    try {
        const packages = await Package.find().sort({ createdAt: -1 });
        res.json(packages);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/admin/packages
router.post('/packages', auth, async (req, res) => {
    try {
        const pkg = new Package(req.body);
        await pkg.save();
        res.status(201).json(pkg);
    } catch (err) {
        res.status(400).json({ message: 'Validation error', error: err.message });
    }
});

// PUT /api/admin/packages/:id
router.put('/packages/:id', auth, async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id);
        if (!pkg) return res.status(404).json({ message: 'Package not found' });
        Object.assign(pkg, req.body);
        await pkg.save();
        res.json(pkg);
    } catch (err) {
        res.status(400).json({ message: 'Validation error', error: err.message });
    }
});

// DELETE /api/admin/packages/:id
router.delete('/packages/:id', auth, async (req, res) => {
    try {
        const pkg = await Package.findByIdAndDelete(req.params.id);
        if (!pkg) return res.status(404).json({ message: 'Package not found' });
        res.json({ message: 'Package deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ── ENQUIRIES ─────────────────────────────────────────────

// GET /api/admin/enquiries
router.get('/enquiries', auth, async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PATCH /api/admin/enquiries/:id — update status
router.patch('/enquiries/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
        res.json(enquiry);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/admin/stats
router.get('/stats', auth, async (req, res) => {
    try {
        const [totalPackages, totalEnquiries, newEnquiries, featuredPackages] = await Promise.all([
            Package.countDocuments(),
            Enquiry.countDocuments(),
            Enquiry.countDocuments({ status: 'new' }),
            Package.countDocuments({ isFeatured: true }),
        ]);
        res.json({ totalPackages, totalEnquiries, newEnquiries, featuredPackages });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
