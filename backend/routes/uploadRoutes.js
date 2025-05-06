// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'video-edit', // You can change this to any folder name you want
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'pdf'],
    resource_type: 'auto', // Allows both image and video
  },
});

const upload = multer({ storage });

// Upload endpoint
router.post('/', upload.single('file'), (req, res) => {
  res.status(200).json({
    url: req.file.path,
    public_id: req.file.filename,
  });
});

module.exports = router;
