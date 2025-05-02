const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Define the destination directory for uploads
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    // Create a unique filename (timestamp + original name)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Filter for allowed file types (images/videos)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only images and videos allowed!'), false);
    }
};

// Initialize Multer with storage and filter configuration
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // Limit file size (e.g., 100MB)
});

// POST /api/upload - Handle single file upload (field named 'mediaFile')
router.post('/', upload.single('mediaFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    // Construct the relative path to be stored/returned
    const relativePath = path.join('uploads', req.file.filename).replace(/\\/g, '/'); // Normalize path separators

    res.json({ 
        message: 'File uploaded successfully', 
        filePath: relativePath // Return the path relative to the server root
    });
}, (error, req, res, next) => {
    // Handle Multer errors (like file size limit)
    res.status(400).json({ message: error.message });
});

module.exports = router; 