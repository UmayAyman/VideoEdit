// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'video-edit',
        allowed_formats: ['jpg', 'png', 'mp4', 'pdf'],
    },
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path.replace(/\\/g, '/'); // Normalize Windows paths

    res.status(200).json({
        message: 'File uploaded successfully',
        filePath:filePath,  // ← Use the normalized path here
    });
});


module.exports = router;
