const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const PriceAlert = require('../models/PriceAlert');
const auth = require('../middleware/auth');

// POST /api/alerts
router.post('/', async (req, res) => {
    try {
        const {
            packageId,
            email,
            phone,
            budgetSelection,
            answers = {},
        } = req.body;

        if (!packageId) {
            return res.status(400).json({ message: 'Package is required' });
        }

        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedPhone = String(phone || '').trim();

        if (!normalizedEmail && !normalizedPhone) {
            return res.status(400).json({ message: 'Email or phone is required' });
        }

        const pkg = await Package.findById(packageId);
        if (!pkg) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const duplicate = await PriceAlert.findOne({
            packageId,
            email: normalizedEmail || undefined,
            phone: normalizedPhone || undefined,
            status: 'active',
        });

        if (duplicate) {
            return res.json({ message: 'You are already tracking price updates for this package.' });
        }

        await PriceAlert.create({
            packageId,
            packageTitle: pkg.title,
            currentPrice: pkg.price,
            email: normalizedEmail || undefined,
            phone: normalizedPhone || undefined,
            budgetSelection,
            answers: {
                travelerType: answers.travelerType,
                vibe: answers.vibe,
                destination: answers.destination,
                availability: answers.availability,
                budget: answers.budget,
            },
        });

        return res.status(201).json({ message: 'Price alert enabled successfully.' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/alerts (admin)
router.get('/', auth, async (req, res) => {
    try {
        const alerts = await PriceAlert.find()
            .sort({ createdAt: -1 })
            .limit(200)
            .lean();
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
