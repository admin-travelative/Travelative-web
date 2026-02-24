const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true },
        packageTitle: { type: String, trim: true },
        packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
        travelDate: { type: String },
        travelers: { type: Number, default: 1 },
        message: { type: String, trim: true },
        status: {
            type: String,
            enum: ['new', 'read', 'handled'],
            default: 'new',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
