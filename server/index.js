const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow all origins dynamically (required for production Vercel domain)
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Serve static files from public config (mainly for user uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Root route for API server
app.get('/', (req, res) => {
    res.json({
        name: 'Travelative API',
        status: 'OK',
        frontend: 'http://localhost:3000',
        health: '/api/health'
    });
});

// Routes
app.use('/api/packages', require('./routes/packages'));
app.use('/api/enquiry', require('./routes/enquiry'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/alerts', require('./routes/alerts'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Travelative API running' }));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });
