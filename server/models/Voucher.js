const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
    {
        voucherNumber: {
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
        customerName: {
            type: String,
            required: true,
            trim: true,
        },
        customerPhone: {
            type: String,
            required: true,
            trim: true,
        },
        customerEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },
        alternateContact: {
            type: String,
            trim: true,
        },
        destination: {
            type: String,
            trim: true,
        },
        hotelName: {
            type: String,
            trim: true,
        },
        hotelAddress: {
            type: String,
            trim: true,
        },
        checkInDate: Date,
        checkOutDate: Date,
        numberOfNights: Number,
        roomType: {
            type: String,
            trim: true,
        },
        mealPlan: {
            type: String,
            trim: true,
        },
        numberOfRooms: Number,
        travelerCount: Number,
        totalAmount: Number,
        paymentStatus: {
            type: String,
            enum: ['Paid', 'Partially Paid', 'Balance Due', 'Unpaid'],
            default: 'Balance Due',
        },
        paidAmount: Number,
        balanceAmount: Number,
        specialRequests: {
            type: [String],
            default: [],
        },
        inclusions: {
            type: [String],
            default: [],
        },
        terms: {
            type: [String],
            default: [],
        },
        notes: {
            type: String,
            trim: true,
        },
        authorizedBy: {
            type: String,
            trim: true,
            default: 'Prachi Tyagi',
        },
        customerSupport: {
            type: String,
            trim: true,
            default: '7088221122',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Voucher', voucherSchema);
