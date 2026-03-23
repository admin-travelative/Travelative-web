const mongoose = require('mongoose');

const TAG_KEYWORDS = [
    'mountains', 'beaches', 'snowfall', 'heritage', 'wildlife', 'adventure',
    'luxury', 'relax', 'romantic', 'privacy', 'kid-friendly', 'sightseeing',
    'trek', 'safari', 'island', 'culture',
];

function normalize(value = '') {
    return String(value).trim().toLowerCase();
}

function parseDurationDays(duration) {
    if (!duration) return null;
    const text = String(duration);
    const dayMatch = text.match(/(\d+)\s*day/i);
    if (dayMatch) return Number(dayMatch[1]);
    const anyNumberMatch = text.match(/(\d+)/);
    return anyNumberMatch ? Number(anyNumberMatch[1]) : null;
}

function inferTagsFromText(pkg) {
    const text = [
        pkg.title,
        pkg.description,
        pkg.shortDescription,
        pkg.category,
        pkg.location,
        pkg.country,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    const tags = new Set(Array.isArray(pkg.tags) ? pkg.tags.map((item) => normalize(item)) : []);
    TAG_KEYWORDS.forEach((keyword) => {
        if (text.includes(keyword)) tags.add(keyword);
    });

    const category = normalize(pkg.category);
    if (category) tags.add(category);

    if (normalize(pkg.country) === 'india') tags.add('domestic');
    else tags.add('international');

    return Array.from(tags).filter(Boolean);
}

function inferTravelerTypes(pkg, tags) {
    if (Array.isArray(pkg.travelerTypes) && pkg.travelerTypes.length > 0) {
        return pkg.travelerTypes.map((item) => normalize(item));
    }

    const derived = new Set();
    const category = normalize(pkg.category);
    const tagsText = (tags || []).join(' ');

    if (category === 'honeymoon' || tagsText.includes('romantic') || tagsText.includes('privacy')) {
        derived.add('couple');
    }
    if (category === 'family' || tagsText.includes('kid-friendly') || tagsText.includes('sightseeing')) {
        derived.add('family');
    }
    if (category === 'adventure' || tagsText.includes('backpacking')) {
        derived.add('solo');
        derived.add('friends');
    }
    if (category === 'relax') {
        derived.add('couple');
        derived.add('family');
    }

    if (derived.size === 0) {
        derived.add('couple');
        derived.add('family');
    }

    return Array.from(derived);
}

const hotelSchema = new mongoose.Schema({
    name: { type: String },
    stars: { type: Number, min: 1, max: 5, default: 3 },
    location: { type: String },
    amenities: [String],
});

const itinerarySchema = new mongoose.Schema({
    day: { type: Number },
    title: { type: String },
    description: { type: String },
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
        tags: [{ type: String, trim: true, lowercase: true }],
        travelerTypes: [{
            type: String,
            enum: ['couple', 'family', 'solo', 'friends'],
        }],
        locationType: {
            type: String,
            enum: ['domestic', 'international'],
        },
        durationDays: { type: Number, min: 1 },
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

packageSchema.pre('validate', function preValidate(next) {
    this.tags = inferTagsFromText(this);
    this.travelerTypes = inferTravelerTypes(this, this.tags);

    if (!this.locationType) {
        this.locationType = normalize(this.country) === 'india' ? 'domestic' : 'international';
    }

    if (!this.durationDays) {
        const parsed = parseDurationDays(this.duration);
        if (parsed) this.durationDays = parsed;
    }

    next();
});

module.exports = mongoose.model('Package', packageSchema);
