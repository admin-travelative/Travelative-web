const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema(
    {
        dayLabel: {
            type: String,
            trim: true,
        },
        title: {
            type: String,
            trim: true,
        },
        date: Date,
        location: {
            type: String,
            trim: true,
        },
        planSummary: {
            type: String,
            trim: true,
        },
        stay: {
            type: String,
            trim: true,
        },
        meals: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const itinerarySchema = new mongoose.Schema(
    {
        itineraryNumber: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        issueDate: {
            type: Date,
            default: Date.now,
        },
        packageTitle: {
            type: String,
            trim: true,
        },
        destination: {
            type: String,
            trim: true,
        },
        travelerName: {
            type: String,
            required: true,
            trim: true,
        },
        travelerPhone: {
            type: String,
            required: true,
            trim: true,
        },
        travelerEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },
        alternateContact: {
            type: String,
            trim: true,
        },
        travelStartDate: Date,
        travelEndDate: Date,
        durationLabel: {
            type: String,
            trim: true,
        },
        travelerCount: Number,
        pickupPoint: {
            type: String,
            trim: true,
        },
        dropPoint: {
            type: String,
            trim: true,
        },
        hotelSummary: {
            type: String,
            trim: true,
        },
        transportSummary: {
            type: String,
            trim: true,
        },
        overview: {
            type: String,
            trim: true,
        },
        dayPlans: {
            type: [itineraryDaySchema],
            default: [],
        },
        inclusions: {
            type: [String],
            default: [],
        },
        exclusions: {
            type: [String],
            default: [],
        },
        importantNotes: {
            type: [String],
            default: [],
        },
        authorizedBy: {
            type: String,
            trim: true,
        },
        customerSupport: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Itinerary', itinerarySchema);
