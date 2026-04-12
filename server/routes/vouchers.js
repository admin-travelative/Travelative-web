const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');
const { streamVoucherPdf } = require('../utils/voucherPdf');

router.get('/:id/download', async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id).lean();
        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        await streamVoucherPdf(res, voucher);
    } catch (err) {
        res.status(500).json({ message: 'Unable to generate voucher PDF', error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id).lean();
        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        res.json(voucher);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
