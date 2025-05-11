import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { uploadFile } from '../services/api'; // To upload the image/gif

const defaultImageOverlay = {
  path: '',
  xPosition: 10, // Will be parseInt on save
  yPosition: 10, // Will be parseInt on save
  scaleWidth: 1920, // Default width for scale, e.g., common HD width
  scaleHeight: 1080, // Default height for scale, e.g., common HD height
  start: 0,   // Double
  end: 5,     // Double
};

// Helper to parse scale string "WIDTHxHEIGHT" into object { scaleWidth, scaleHeight }
const parseScaleString = (scaleStr) => {
  if (typeof scaleStr === 'string' && scaleStr.includes('x')) {
    const parts = scaleStr.split('x');
    const width = parseInt(parts[0], 10);
    const height = parseInt(parts[1], 10);
    if (!isNaN(width) && !isNaN(height)) {
      return { scaleWidth: width, scaleHeight: height };
    }
  }
  // Fallback or if it's a multiplier (though we are moving away from it)
  // If it's a number string like "1.0", this won't parse well to WxH.
  // For now, let's default if parsing fails from WxH format.
  return { scaleWidth: defaultImageOverlay.scaleWidth, scaleHeight: defaultImageOverlay.scaleHeight };
};

function ImageOverlayForm({ initialData, onSave, onCancel, disabled = false }) {
  const [overlayData, setOverlayData] = useState(() => {
    const data = initialData || defaultImageOverlay;
    // If initialData has a scale string (e.g., from loaded template), parse it.
    // Otherwise, use defaults for scaleWidth/Height.
    const scaleParts = data.scale ? parseScaleString(data.scale) : { scaleWidth: data.scaleWidth || defaultImageOverlay.scaleWidth, scaleHeight: data.scaleHeight || defaultImageOverlay.scaleHeight };
    return { ...data, ...scaleParts }; 
  });
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const data = initialData || defaultImageOverlay;
    const scaleParts = data.scale ? parseScaleString(data.scale) : { scaleWidth: data.scaleWidth || defaultImageOverlay.scaleWidth, scaleHeight: data.scaleHeight || defaultImageOverlay.scaleHeight };
    setOverlayData({ ...data, ...scaleParts });
    setUploadStatus('idle');
    setUploadProgress(0);
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    setOverlayData(prevData => ({
      ...prevData,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value, // Use parseInt for width/height and positions
    }));
  };

  const handleFileChange = async (event) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;
    setUploadStatus('uploading');
    setUploadProgress(0);
    toast.info(`Uploading ${file.name}...`);
    try {
      const result = await uploadFile(file, (progress) => setUploadProgress(progress));
      setOverlayData(prevData => ({ ...prevData, path: result.filePath }));
      setUploadStatus('success');
      toast.success(`Uploaded ${file.name} successfully! Path: ${result.filePath}`);
    } catch (error) {
      setUploadStatus('error');
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!overlayData.path && uploadStatus !== 'success') {
        toast.error('Please upload an image/GIF file for the overlay.');
        return;
    }
    if ((!overlayData.scaleWidth || overlayData.scaleWidth <= 0) || (!overlayData.scaleHeight || overlayData.scaleHeight <= 0)) {
        toast.error('Scale Width and Scale Height must be positive numbers.');
        return;
    }
    
    const dataToSave = {
        ...overlayData,
        path: (overlayData.path && overlayData.path !== 'undefined') ? String(overlayData.path) : '', 
        xPosition: parseInt(overlayData.xPosition, 10) || 0, 
        yPosition: parseInt(overlayData.yPosition, 10) || 0, 
        scale: `${parseInt(overlayData.scaleWidth, 10) || 0}x${parseInt(overlayData.scaleHeight, 10) || 0}`, // Construct scale string
        start: parseFloat(overlayData.start) || 0, 
        end: parseFloat(overlayData.end) || 0,     
    };
    // Remove individual scaleWidth/Height from the object to be saved, as they are combined into 'scale'
    delete dataToSave.scaleWidth;
    delete dataToSave.scaleHeight;

    onSave(dataToSave);
  };

  const isUploading = uploadStatus === 'uploading';

  return (
    <div className="image-overlay-form"> {/* No <form> tag to prevent nesting */}
      <h4>{initialData ? 'Edit Image/GIF Overlay' : 'Add New Image/GIF Overlay'}</h4>

      {/* Path (File Upload) */}
      <div className="input-group">
        <label htmlFor="imageOverlayPath">Image/GIF File:</label>
        <input
          type="file"
          id="imageOverlayPath"
          onChange={handleFileChange}
          accept="image/gif,image/png,image/jpeg,image/webp" // Accept common image types
          disabled={disabled || isUploading}
        />
        {overlayData.path && !isUploading && (
          <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#555' }}>Current: {overlayData.path}</span>
        )}
        {isUploading && (
          <span style={{ marginLeft: '10px', fontSize: '0.9em' }}>Uploading ({uploadProgress}%)...</span>
        )}
        {uploadStatus === 'success' && overlayData.path && (
          <span style={{ marginLeft: '10px', fontSize: '0.9em', color: 'green' }}>✅ File ready: {overlayData.path}</span>
        )}
        {uploadStatus === 'error' && (
          <span style={{ marginLeft: '10px', fontSize: '0.9em', color: 'red' }}>Upload failed!</span>
        )}
      </div>

      {/* Positioning */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="imageOverlayX">X Pos:</label>
          <input
            type="number"
            id="imageOverlayX"
            name="xPosition"
            value={overlayData.xPosition}
            onChange={handleChange}
            disabled={disabled}
          />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="imageOverlayY">Y Pos:</label>
          <input
            type="number"
            id="imageOverlayY"
            name="yPosition"
            value={overlayData.yPosition}
            onChange={handleChange}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Scale Inputs: Width and Height */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="imageOverlayScaleWidth">Scale Width:</label>
          <input
            type="number"
            id="imageOverlayScaleWidth"
            name="scaleWidth"
            value={overlayData.scaleWidth}
            onChange={handleChange}
            disabled={disabled}
            placeholder="e.g., 1920"
            min="0"
            required
          />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="imageOverlayScaleHeight">Scale Height:</label>
          <input
            type="number"
            id="imageOverlayScaleHeight"
            name="scaleHeight"
            value={overlayData.scaleHeight}
            onChange={handleChange}
            disabled={disabled}
            placeholder="e.g., 1080"
            min="0"
            required
          />
        </div>
      </div>

      {/* Timing (for GIFs) */}
      <h5 style={{ marginTop: '15px', marginBottom: '5px' }}>Timing (for animated GIFs)</h5>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="imageOverlayStart">Start (s):</label>
          <input
            type="number"
            id="imageOverlayStart"
            name="start"
            value={overlayData.start}
            onChange={handleChange}
            min="0"
            step="0.1"
            disabled={disabled}
          />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="imageOverlayEnd">End (s):</label>
          <input
            type="number"
            id="imageOverlayEnd"
            name="end"
            value={overlayData.end}
            onChange={handleChange}
            min={overlayData.start || 0}
            step="0.1"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="button-group">
        <button type="button" onClick={handleSubmit} className="button button-save" disabled={disabled || isUploading}>
          Save Image Overlay
        </button>
        <button type="button" onClick={onCancel} className="button button-secondary" disabled={disabled || isUploading}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ImageOverlayForm; 