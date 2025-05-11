import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// Default state for a new text overlay
const defaultTextOverlay = {
  content: '',
  start: 0,
  end: 5, // Default duration
  xPosition: 50, // Center default?
  yPosition: 50, // Center default?
  fontSize: 24,
  color: '#ffffff',
  edit: false, // Default to not editable in the final video?
  boxColor: '#000000',
  boxOpacity: 0.5,
  padding: 5 // Renamed from boxPadding
  // Add other fields as needed: fontFamily, alignment, etc.
};

function TextOverlayForm({ initialData, onSave, onCancel, disabled = false }) {
  const [textData, setTextData] = useState(() => {
    const data = initialData || defaultTextOverlay;
    // Ensure padding exists, defaulting from boxPadding if old data is passed
    return { ...data, padding: data.padding !== undefined ? data.padding : (data.boxPadding !== undefined ? data.boxPadding : defaultTextOverlay.padding) };
  });

  // Update local state if initialData changes (when user clicks Edit on a different item)
  useEffect(() => {
    const data = initialData || defaultTextOverlay;
    setTextData({ ...data, padding: data.padding !== undefined ? data.padding : (data.boxPadding !== undefined ? data.boxPadding : defaultTextOverlay.padding) });
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setTextData(prevData => ({
      ...prevData,
      // For number types, parse them, default to 0 if parsing fails (e.g. empty input)
      // For checkbox, use checked value
      // Otherwise, use the direct string value
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (parseFloat(value) || 0) : value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = [];
    if (!textData.content || !textData.content.trim()) {
      validationErrors.push("Content is required.");
    }
    if (!textData.fontSize || textData.fontSize <= 0) {
      validationErrors.push("Font Size must be a positive number.");
    }
    if (!textData.color) { // Color picker should ensure a value, but good to check
      validationErrors.push("Text Color is required.");
    }
    if (!textData.boxColor) { // Color picker should ensure a value, but good to check
      validationErrors.push("Box Color is required.");
    }
    // For padding, if required, ensure it's a non-negative number.
    // The HTML required attribute handles empty, JS handles if it needs to be > 0 for example.
    // For now, just ensuring it's part of the dataToSave with correct type.

    if (validationErrors.length > 0) {
      toast.error(validationErrors.join("\n"));
      return; // Stop submission if there are errors
    }

    // Ensure correct data types before saving
    const dataToSave = {
      ...textData,
      start: parseFloat(textData.start) || 0,
      end: parseFloat(textData.end) || 0,
      xPosition: parseFloat(textData.xPosition) || 0,
      yPosition: parseFloat(textData.yPosition) || 0,
      fontSize: parseFloat(textData.fontSize) || 0,
      // color and content are strings, edit is boolean - should be fine from state
      // boxColor is string
      boxOpacity: parseFloat(textData.boxOpacity) || 0,
      padding: parseFloat(textData.padding) || 0, // Renamed from boxPadding
    };
    // Remove old boxPadding key if it exists from initialData migration
    if (dataToSave.hasOwnProperty('boxPadding')) {
        delete dataToSave.boxPadding;
    }
    console.log('[TextOverlayForm] handleSubmit. Saving dataToSave:', dataToSave);
    onSave(dataToSave); // Pass the sanitized data
  };

  return (
    <div className="text-overlay-form">
      <h4>{initialData ? 'Edit Text Overlay' : 'Add New Text Overlay'}</h4>

      {/* Content */}
      <div className="input-group">
        <label htmlFor="textContent">Content:</label>
        <textarea
          id="textContent"
          name="content"
          value={textData.content}
          onChange={handleChange}
          rows={3}
          disabled={disabled}
          required
        />
      </div>

      {/* Timing */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="textStart">Start (s):</label>
          <input
            type="number"
            id="textStart"
            name="start"
            value={textData.start}
            onChange={handleChange}
            min="0"
            step="0.1"
            disabled={disabled}
            required
          />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="textEnd">End (s):</label>
          <input
            type="number"
            id="textEnd"
            name="end"
            value={textData.end}
            onChange={handleChange}
            min={textData.start || 0} // End must be >= start
            step="0.1"
            disabled={disabled}
            required
          />
        </div>
      </div>

      {/* Positioning */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="textX">X Pos (%):</label>
          <input
            type="number"
            id="textX"
            name="xPosition"
            value={textData.xPosition}
            onChange={handleChange}
            min="0" max="100"
            disabled={disabled}
            required
          />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="textY">Y Pos (%):</label>
          <input
            type="number"
            id="textY"
            name="yPosition"
            value={textData.yPosition}
            onChange={handleChange}
            min="0" max="100"
            disabled={disabled}
            required
          />
        </div>
      </div>

      {/* Style */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="textSize">Font Size:</label>
          <input
            type="number"
            id="textSize"
            name="fontSize"
            value={textData.fontSize}
            onChange={handleChange}
            min="1"
            disabled={disabled}
            required
          />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="textColor">Color:</label>
          <input
            type="color"
            id="textColor"
            name="color"
            value={textData.color}
            onChange={handleChange}
            disabled={disabled}
            required
          />
        </div>
      </div>

      {/* Box Style Section */}
      {/* Box Color on its own line/group */}
      <div className="input-group">
        <label htmlFor="boxColor">Box Color:</label>
        <input
          type="color"
          id="boxColor"
          name="boxColor"
          value={textData.boxColor}
          onChange={handleChange}
          disabled={disabled}
          required
        />
      </div>

      {/* Box Opacity and Box Padding on one line */}
      <div style={{ display: 'flex', gap: '10px' }}> 
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="boxOpacity">Box Opacity:</label>
          <input
            type="number"
            id="boxOpacity"
            name="boxOpacity"
            value={textData.boxOpacity}
            onChange={handleChange}
            min="0"
            max="1"
            step="0.1"
            disabled={disabled}
            required
          />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label htmlFor="textPadding">Padding:</label>
          <input
            type="number"
            id="textPadding"
            name="padding"
            value={textData.padding}
            onChange={handleChange}
            min="0"
            disabled={disabled}
            required
          />
        </div>
      </div>

      {/* Editable Checkbox */}
      <div className="input-group">
        <label htmlFor="textEditable" style={{ width: 'auto' }}>User Editable:</label>
        <input
          type="checkbox"
          id="textEditable"
          name="edit"
          checked={textData.edit}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>

      <div className="button-group">
        <button 
          type="button" 
          onClick={handleSubmit}
          className="button button-save" 
          disabled={disabled}
        >
          Save Text
        </button>
        <button type="button" onClick={onCancel} className="button button-secondary" disabled={disabled}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default TextOverlayForm; 