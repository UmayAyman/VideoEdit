const express = require('express');
const cors = require('cors');
const path = require('path');
const templateRoutes = require('./routes/templateRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // Import upload routes

// Create the Express app
const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing for requests from frontend
app.use(express.json()); // Enable parsing of JSON request bodies

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/templates', templateRoutes); // Mount template routes under /api/templates
app.use('/api/upload', uploadRoutes); // Mount upload routes

// Define the port
const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`Serving uploads from: ${path.join(__dirname, 'uploads')}`); // Log upload dir
});
