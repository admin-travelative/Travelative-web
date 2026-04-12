const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Workaround for MongoDB querySrv ECONNREFUSED error (ISP DNS Block)
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (error) {
    console.error('Could not set DNS servers:', error);
}

const app = express();

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or server-to-server)
        if (!origin) return callback(null, true);

        // Allow strictly whitelisted origins OR Vercel preview environments
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        
        return callback(new Error('Blocked by CORS policy for security.'));
    },
    credentials: true // Important for secure cookies
}));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

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
app.use('/api/vouchers', require('./routes/vouchers'));

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
