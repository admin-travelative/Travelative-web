const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');

// POST /api/enquiry — save new enquiry
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, packageTitle, packageId, travelDate, travelers, message } = req.body;
        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'Name, email, and phone are required' });
        }
        const enquiry = new Enquiry({ name, email, phone, packageTitle, packageId, travelDate, travelers, message });
        await enquiry.save();
        res.status(201).json({ message: 'Enquiry submitted successfully', enquiry });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
