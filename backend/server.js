// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const templateRoutes = require('./routes/templateRoutes');
const uploadRoute = require('./routes/uploadRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files (local fallback if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/templates', templateRoutes);
app.use('/api/upload', uploadRoute);

// Error handling (for Multer)
const multer = require('multer');
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error("Multer Error:", err);
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

