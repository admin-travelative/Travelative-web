const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema(
    {
        packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
        packageTitle: { type: String, trim: true, required: true },
        currentPrice: { type: Number, required: true },
        email: { type: String, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        budgetSelection: { type: String, trim: true },
        answers: {
            travelerType: { type: String, trim: true },
            vibe: { type: String, trim: true },
            destination: { type: String, trim: true },
            availability: { type: String, trim: true },
            budget: { type: String, trim: true },
        },
        status: {
            type: String,
            enum: ['active', 'notified', 'closed'],
            default: 'active',
        },
        source: { type: String, default: 'trip_planner' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
