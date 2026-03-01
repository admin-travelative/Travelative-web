const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Package = require('../models/Package');
const Enquiry = require('../models/Enquiry');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for local file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// POST /api/admin/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: admin._id, username: admin.username, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, admin: { username: admin.username, role: admin.role } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/admin/upload - Upload a package image
router.post('/upload', auth, upload.single('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        // Return relative path from server root (will be fetched via /uploads/...)
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
    } catch (err) {
        res.status(500).json({ message: 'Error uploading file', error: err.message });
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
