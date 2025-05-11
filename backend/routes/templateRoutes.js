const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "uploads",
        allowed_formats: ["jpg", "png", "jpeg", "mp4", "pdf"]
    }
});

const upload = multer({ storage });

const router = express.Router();
const dataDir = path.join(__dirname, '..', 'data');

// Ensure data directory exists (optional, but good practice)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// GET /api/templates - List available template filenames
router.get('/', (req, res) => {
  fs.readdir(dataDir, (err, files) => {
    if (err) {
      console.error('Error reading data directory:', err);
      return res.status(500).json({ message: 'Failed to list templates' });
    }
    // Filter for .json files only
    const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
    res.json(jsonFiles);
  });
});

// GET /api/templates/:filename - Get content of a specific template
router.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  // Basic validation/sanitization
  if (!filename || !filename.endsWith('.json') || filename.includes('..')) {
    return res.status(400).json({ message: 'Invalid filename' });
  }
  const filepath = path.join(dataDir, filename);

  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ message: 'Template not found' });
      } else {
        console.error(`Error reading template file ${filename}:`, err);
        return res.status(500).json({ message: 'Failed to read template file' });
      }
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error(`Error parsing JSON from file ${filename}:`, parseErr);
      res.status(500).json({ message: 'Failed to parse template file' });
    }
  });
});

// PUT /api/templates/:filename - Update/Overwrite an existing template
router.put('/:filename', (req, res) => {
  const filename = req.params.filename;
  const templateData = req.body;

  // Basic validation/sanitization
  if (!filename || !filename.endsWith('.json') || filename.includes('..')) {
    return res.status(400).json({ message: 'Invalid filename' });
  }
  // TODO: Add deeper validation of templateData structure if needed
  if (!templateData || typeof templateData !== 'object') {
    return res.status(400).json({ message: 'Invalid template data provided' });
  }

  const filepath = path.join(dataDir, filename);

  // Overwrite the file
  fs.writeFile(filepath, JSON.stringify(templateData, null, 2), (err) => {
    if (err) {
      // Although writeFile usually creates the file, check ENOENT just in case?
      // Or perhaps we should check fs.exists before writing if we ONLY want to update?
      // For now, let's assume writeFile is okay for create/overwrite.
      console.error(`Error updating template file ${filename}:`, err);
      return res.status(500).json({ message: 'Failed to update template file' });
    }
    console.log(`Template updated: ${filename}`);
    res.json({ message: 'Template updated successfully', filename: filename }); // Send 200 OK
  });
});

// POST /api/templates
// router.post('/', upload.single('file'), (req, res) => {
//   res.status(200).json({
//     url: req.file.path,
//     public_id: req.file.filename,
//   });

//   res.json({ url: req.file.path });
//   // 1. Get the template JSON data from the request body (req.body)
//   const templateData = req.body;

//   // 2. Validate the data (important!) - Check if it has the required fields/structure.

//   // 3. Generate a unique filename (e.g., using timestamp or a UUID library)
//   const filename = `template_${Date.now()}.json`;
//   const filepath = path.join(dataDir, filename); // Use path.join for cross-platform compatibility

//   // 4. Use Node's built-in 'fs' module to write the file
//   fs.writeFile(filepath, JSON.stringify(templateData, null, 2), (err) => { // Use null, 2 for pretty printing
//     if (err) {
//       console.error('Error saving new template:', err);
//       return res.status(500).json({ message: 'Failed to save new template' });
//     }
//     console.log(`Template saved to ${filename}`);
//     res.status(201).json({ message: 'Template saved successfully', filename: filename });
//   });
// });

// POST /api/templates — Save template only (no file)
// POST /api/templates — Save a new template (JSON only)
router.post('/', (req, res) => {
  const templateData = req.body;

  // Basic validation
  if (!templateData || typeof templateData !== 'object') {
    return res.status(400).json({ message: 'Invalid template data provided' });
  }
  

  // Generate a unique filename
  const filename = `template_${Date.now()}.json`;
  const filepath = path.join(dataDir, filename);

  // Save the JSON to disk
  fs.writeFile(filepath, JSON.stringify(templateData, null, 2), (err) => {
    if (err) {
      console.error('Error saving new template:', err);
      return res.status(500).json({ message: 'Failed to save new template' });
    }

    console.log(`Template saved to ${filename}`);
    res.status(201).json({ message: 'Template saved successfully', filename });
  });
});



module.exports = router;
