import React, { useEffect, useState } from 'react';

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
    // Add other fields as needed: fontFamily, alignment, etc.
};

function TextOverlayForm({ initialData, onSave, onCancel, disabled = false }) {
  const [textData, setTextData] = useState(initialData || defaultTextOverlay);

  // Update local state if initialData changes (when user clicks Edit on a different item)
  useEffect(() => {
    setTextData(initialData || defaultTextOverlay);
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setTextData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) || 0 : value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(textData); // Pass the current state up
  };

  return (
    <form onSubmit={handleSubmit} className="text-overlay-form">
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

      {/* Editable Checkbox */}
        <div className="input-group">
          <label htmlFor="textEditable" style={{width: 'auto'}}>User Editable:</label>
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
        <button type="submit" className="button button-save" disabled={disabled}>
          Save Text
        </button>
        <button type="button" onClick={onCancel} className="button button-secondary" disabled={disabled}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default TextOverlayForm; 