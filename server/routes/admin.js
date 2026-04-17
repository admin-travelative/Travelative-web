const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Package = require('../models/Package');
const Enquiry = require('../models/Enquiry');
const Voucher = require('../models/Voucher');
const Itinerary = require('../models/Itinerary');
const auth = require('../middleware/auth');
const { invalidateCache } = require('../middleware/cache');
const { streamVoucherPdf } = require('../utils/voucherPdf');
const { streamItineraryPdf } = require('../utils/itineraryPdf');

function cleanList(values = []) {
    return values
        .map((value) => String(value || '').trim())
        .filter(Boolean);
}

function toOptionalNumber(value) {
    if (value === '' || value === null || value === undefined) {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeVoucherPayload(payload = {}) {
    return {
        voucherNumber: String(payload.voucherNumber || '').trim(),
        issueDate: payload.issueDate || new Date(),
        packageTitle: String(payload.packageTitle || '').trim(),
        customerName: String(payload.customerName || '').trim(),
        customerPhone: String(payload.customerPhone || '').trim(),
        customerEmail: String(payload.customerEmail || '').trim(),
        alternateContact: String(payload.alternateContact || '').trim(),
        destination: String(payload.destination || '').trim(),
        hotelName: String(payload.hotelName || '').trim(),
        hotelAddress: String(payload.hotelAddress || '').trim(),
        checkInDate: payload.checkInDate || undefined,
        checkOutDate: payload.checkOutDate || undefined,
        numberOfNights: toOptionalNumber(payload.numberOfNights),
        roomType: String(payload.roomType || '').trim(),
        mealPlan: String(payload.mealPlan || '').trim(),
        numberOfRooms: toOptionalNumber(payload.numberOfRooms),
        travelerCount: toOptionalNumber(payload.travelerCount),
        totalAmount: toOptionalNumber(payload.totalAmount),
        paymentStatus: payload.paymentStatus || 'Balance Due',
        paidAmount: toOptionalNumber(payload.paidAmount) || 0,
        balanceAmount: toOptionalNumber(payload.balanceAmount),
        specialRequests: cleanList(payload.specialRequests),
        inclusions: cleanList(payload.inclusions),
        terms: cleanList(payload.terms),
        notes: String(payload.notes || '').trim(),
        authorizedBy: String(payload.authorizedBy || '').trim(),
        customerSupport: String(payload.customerSupport || '').trim(),
    };
}

function normalizeItineraryDays(days = []) {
    return Array.isArray(days)
        ? days
            .map((day, index) => ({
                dayLabel: String(day?.dayLabel || `Day ${index + 1}`).trim(),
                title: String(day?.title || '').trim(),
                date: day?.date || undefined,
                location: String(day?.location || '').trim(),
                planSummary: String(day?.planSummary || '').trim(),
                stay: String(day?.stay || '').trim(),
                meals: String(day?.meals || '').trim(),
            }))
            .filter((day) => day.dayLabel || day.title || day.location || day.planSummary || day.stay || day.meals)
        : [];
}

function normalizeItineraryPayload(payload = {}) {
    return {
        itineraryNumber: String(payload.itineraryNumber || '').trim(),
        issueDate: payload.issueDate || new Date(),
        packageTitle: String(payload.packageTitle || '').trim(),
        destination: String(payload.destination || '').trim(),
        travelerName: String(payload.travelerName || '').trim(),
        travelerPhone: String(payload.travelerPhone || '').trim(),
        travelerEmail: String(payload.travelerEmail || '').trim(),
        alternateContact: String(payload.alternateContact || '').trim(),
        travelStartDate: payload.travelStartDate || undefined,
        travelEndDate: payload.travelEndDate || undefined,
        durationLabel: String(payload.durationLabel || '').trim(),
        travelerCount: toOptionalNumber(payload.travelerCount),
        pickupPoint: String(payload.pickupPoint || '').trim(),
        dropPoint: String(payload.dropPoint || '').trim(),
        hotelSummary: String(payload.hotelSummary || '').trim(),
        transportSummary: String(payload.transportSummary || '').trim(),
        overview: String(payload.overview || '').trim(),
        dayPlans: normalizeItineraryDays(payload.dayPlans),
        inclusions: cleanList(payload.inclusions),
        exclusions: cleanList(payload.exclusions),
        importantNotes: cleanList(payload.importantNotes),
        authorizedBy: String(payload.authorizedBy || '').trim(),
        customerSupport: String(payload.customerSupport || '').trim(),
    };
}

async function generateVoucherNumber() {
    const now = new Date();
    const datePart = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const prefix = `TV-${datePart}`;
    const count = await Voucher.countDocuments({
        voucherNumber: { $regex: `^${prefix}` }
    });

    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}

async function generateItineraryNumber() {
    const now = new Date();
    const datePart = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const prefix = `TI-${datePart}`;
    const count = await Itinerary.countDocuments({
        itineraryNumber: { $regex: `^${prefix}` }
    });

    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}

// POST /api/admin/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET || 'travelative_secret_key',
            { expiresIn: '7d' }
        );

        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                role: admin.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

router.get('/verify', auth, (req, res) => {
    res.json({ valid: true, admin: req.admin });
});

router.post('/logout', (req, res) => {
    res.clearCookie('adminToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });

    res.json({ success: true, message: 'Logged out successfully' });
});

router.post('/upload', auth, (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ message: 'No image data provided' });
        }

        res.json({ url: image });
    } catch (err) {
        res.status(500).json({ message: 'Error processing image', error: err.message });
    }
});

// Packages
router.get('/packages', auth, async (req, res) => {
    try {
        const packages = await Package.find().sort({ createdAt: -1 });
        res.json(packages);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/packages', auth, async (req, res) => {
    try {
        const pkg = new Package(req.body);
        await pkg.save();
        await invalidateCache('packages');
        res.status(201).json(pkg);
    } catch (err) {
        res.status(400).json({ message: 'Validation error', error: err.message });
    }
});

router.put('/packages/:id', auth, async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id);
        if (!pkg) {
            return res.status(404).json({ message: 'Package not found' });
        }

        Object.assign(pkg, req.body);
        await pkg.save();
        await invalidateCache('packages');
        res.json(pkg);
    } catch (err) {
        res.status(400).json({ message: 'Validation error', error: err.message });
    }
});

router.delete('/packages/:id', auth, async (req, res) => {
    try {
        const pkg = await Package.findByIdAndDelete(req.params.id);
        if (!pkg) {
            return res.status(404).json({ message: 'Package not found' });
        }

        await invalidateCache('packages');
        res.json({ message: 'Package deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Enquiries
router.get('/enquiries', auth, async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.patch('/enquiries/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        res.json(enquiry);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Vouchers
router.get('/vouchers', auth, async (req, res) => {
    try {
        const vouchers = await Voucher.find().sort({ createdAt: -1 });
        res.json(vouchers);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/vouchers', auth, async (req, res) => {
    try {
        const payload = normalizeVoucherPayload(req.body);

        if (!payload.voucherNumber) {
            payload.voucherNumber = await generateVoucherNumber();
        }

        if (payload.balanceAmount === undefined) {
            payload.balanceAmount = Math.max((payload.totalAmount || 0) - (payload.paidAmount || 0), 0);
        }

        const voucher = new Voucher(payload);
        await voucher.save();

        res.status(201).json(voucher);
    } catch (err) {
        const status = err.code === 11000 ? 409 : 400;
        res.status(status).json({ message: 'Could not create voucher', error: err.message });
    }
});

router.put('/vouchers/:id', auth, async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        const payload = normalizeVoucherPayload(req.body);

        if (!payload.voucherNumber) {
            payload.voucherNumber = voucher.voucherNumber || await generateVoucherNumber();
        }

        if (payload.balanceAmount === undefined) {
            payload.balanceAmount = Math.max((payload.totalAmount || 0) - (payload.paidAmount || 0), 0);
        }

        Object.assign(voucher, payload);
        await voucher.save();

        res.json(voucher);
    } catch (err) {
        const status = err.code === 11000 ? 409 : 400;
        res.status(status).json({ message: 'Could not update voucher', error: err.message });
    }
});

router.delete('/vouchers/:id', auth, async (req, res) => {
    try {
        const voucher = await Voucher.findByIdAndDelete(req.params.id);
        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        res.json({ success: true, message: 'Voucher deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/vouchers/download', auth, async (req, res) => {
    try {
        const payload = normalizeVoucherPayload(req.body);

        if (!payload.voucherNumber) {
            payload.voucherNumber = await generateVoucherNumber();
        }

        if (payload.balanceAmount === undefined) {
            payload.balanceAmount = Math.max((payload.totalAmount || 0) - (payload.paidAmount || 0), 0);
        }

        await streamVoucherPdf(res, payload);
    } catch (err) {
        res.status(400).json({ message: 'Could not generate voucher PDF', error: err.message });
    }
});

// Itineraries
router.get('/itineraries', auth, async (req, res) => {
    try {
        const itineraries = await Itinerary.find().sort({ createdAt: -1 });
        res.json(itineraries);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/itineraries', auth, async (req, res) => {
    try {
        const payload = normalizeItineraryPayload(req.body);

        if (!payload.itineraryNumber) {
            payload.itineraryNumber = await generateItineraryNumber();
        }

        const itinerary = new Itinerary(payload);
        await itinerary.save();

        res.status(201).json(itinerary);
    } catch (err) {
        const status = err.code === 11000 ? 409 : 400;
        res.status(status).json({ message: 'Could not create itinerary', error: err.message });
    }
});

router.put('/itineraries/:id', auth, async (req, res) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);
        if (!itinerary) {
            return res.status(404).json({ message: 'Itinerary not found' });
        }

        const payload = normalizeItineraryPayload(req.body);

        if (!payload.itineraryNumber) {
            payload.itineraryNumber = itinerary.itineraryNumber || await generateItineraryNumber();
        }

        Object.assign(itinerary, payload);
        await itinerary.save();

        res.json(itinerary);
    } catch (err) {
        const status = err.code === 11000 ? 409 : 400;
        res.status(status).json({ message: 'Could not update itinerary', error: err.message });
    }
});

router.delete('/itineraries/:id', auth, async (req, res) => {
    try {
        const itinerary = await Itinerary.findByIdAndDelete(req.params.id);
        if (!itinerary) {
            return res.status(404).json({ message: 'Itinerary not found' });
        }

        res.json({ success: true, message: 'Itinerary deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/itineraries/download', auth, async (req, res) => {
    try {
        const payload = normalizeItineraryPayload(req.body);

        if (!payload.itineraryNumber) {
            payload.itineraryNumber = await generateItineraryNumber();
        }

        await streamItineraryPdf(res, payload);
    } catch (err) {
        res.status(400).json({ message: 'Could not generate itinerary PDF', error: err.message });
    }
});

router.get('/itineraries/:id/download', auth, async (req, res) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id).lean();
        if (!itinerary) {
            return res.status(404).json({ message: 'Itinerary not found' });
        }

        await streamItineraryPdf(res, itinerary);
    } catch (err) {
        res.status(500).json({ message: 'Could not download itinerary', error: err.message });
    }
});

router.get('/stats', auth, async (req, res) => {
    try {
        const [totalPackages, totalEnquiries, newEnquiries, featuredPackages, totalVouchers, totalItineraries] = await Promise.all([
            Package.countDocuments(),
            Enquiry.countDocuments(),
            Enquiry.countDocuments({ status: 'new' }),
            Package.countDocuments({ isFeatured: true }),
            Voucher.countDocuments(),
            Itinerary.countDocuments(),
        ]);

        res.json({ totalPackages, totalEnquiries, newEnquiries, featuredPackages, totalVouchers, totalItineraries });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
