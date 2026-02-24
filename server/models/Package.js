const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    stars: { type: Number, min: 1, max: 5, default: 3 },
    location: { type: String },
    amenities: [String],
});

const itinerarySchema = new mongoose.Schema({
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    activities: [String],
});

const packageSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        duration: { type: String, required: true }, // e.g. "7 Days / 6 Nights"
        description: { type: String, required: true },
        shortDescription: { type: String },
        images: [{ type: String }], // array of image URLs
        category: {
            type: String,
            enum: ['Adventure', 'Relax', 'Honeymoon', 'Family'],
            required: true,
        },
        isFeatured: { type: Boolean, default: false },
        isTrending: { type: Boolean, default: false },
        isLimitedSlots: { type: Boolean, default: false },
        slotsLeft: { type: Number, default: null },
        hotels: [hotelSchema],
        itinerary: [itinerarySchema],
        inclusions: [String],
        exclusions: [String],
        location: { type: String },
        country: { type: String },
        rating: { type: Number, min: 0, max: 5, default: 4.5 },
        reviewCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Package', packageSchema);
