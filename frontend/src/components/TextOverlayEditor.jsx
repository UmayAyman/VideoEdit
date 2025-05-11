import React, { useState } from 'react';
import { toast } from 'react-toastify';
import TextOverlayForm from './TextOverlayForm'; // We'll need this form

function TextOverlayEditor({ textOverlays = [], onAddText, onRemoveText, onUpdateText, disabled = false }) {
  // State to track which text overlay is being added/edited
  // null = none, -1 = adding new, 0+ = editing index
  const [editingTextIndex, setEditingTextIndex] = useState(null);

  // Handler to START editing a specific text overlay
  const handleEditText = (indexToEdit) => {
    setEditingTextIndex(indexToEdit);
  };

  // Handler to save (add or update) a text overlay via the parent form's handlers
  const handleSaveText = (textOverlayData) => {
    console.log('[TextOverlayEditor] handleSaveText called. editingTextIndex:', editingTextIndex, 'data:', textOverlayData); // LOG 2
    if (editingTextIndex === -1) { // Adding new
      onAddText(textOverlayData); // Call parent's add handler
      toast.info('New text overlay added.');
    } else if (editingTextIndex !== null && editingTextIndex >= 0) { // Updating existing
      onUpdateText(editingTextIndex, textOverlayData);
      toast.info(`Text overlay ${editingTextIndex + 1} updated.`);
    } else {
      console.error('TextOverlayEditor: Invalid editingTextIndex during save:', editingTextIndex);
    }
    setEditingTextIndex(null); // Close the text form
    console.log('[TextOverlayEditor] setEditingTextIndex to null.'); // LOG 3
  };

  // Handler to cancel editing/adding text overlay
  const handleCancelTextEdit = () => {
    setEditingTextIndex(null);
  };

  // Handler for simple field changes *within* the TextOverlayForm (might not be needed if form handles its state)
  // Let TextOverlayForm handle its internal changes and only call handleSaveText on submit.

  return (
    <div className="text-overlay-section">
      <h4>Text Overlays</h4>
      {editingTextIndex === null && textOverlays.length > 0 && textOverlays.map((textItem, index) => (
        <div key={index} className="text-overlay-item">
          <div className="text-overlay-buttons">
            <button style={{backgroundColor: "#f8f9fa", borderColor: "#6c757d"}}
              type="button"
              onClick={() => handleEditText(index)}
              className="text-overlay-button edit"
              title="Edit Text Overlay"
              disabled={disabled}
            >
              Edit
            </button>
            <button style={{backgroundColor: "#f8f9fa", borderColor: "#6c757d", color: "black"}}
              type="button"
              onClick={() => {
                if (window.confirm(`Delete text overlay "${textItem.content || ''}"?`)) {
                  onRemoveText(index);
                  toast.info(`Text overlay ${index + 1} removed.`);
                }
              }}
              className="text-overlay-button delete"
              title="Delete Text Overlay"
              disabled={disabled}
            >
              X
            </button>
          </div>
          {/* Corrected content display logic */}
          <p><strong>Content:</strong> {textItem.content ? (textItem.content.substring(0, 30) + (textItem.content.length > 30 ? '...' : '')) : '(No content)'}</p>
          <p>
            <strong>Time:</strong> {textItem.start}s - {textItem.end}s | 
            <strong>Pos:</strong> ({textItem.xPosition},{textItem.yPosition})
          </p>
          <p>
            <strong>Font Size:</strong> {textItem.fontSize || 'N/A'}px | 
            <strong>Color:</strong> <span style={{ color: textItem.color, backgroundColor: '#333', padding: '0 3px' }}>{textItem.color || 'N/A'}</span>
          </p>
          {/* Check for boxColor, boxOpacity, or padding to display this block */}
          {(textItem.boxColor || typeof textItem.boxOpacity === 'number' || typeof textItem.padding === 'number') && (
            <p>
              {textItem.boxColor && (
                <><strong>Box Color:</strong> <span style={{ color: textItem.boxColor, backgroundColor: '#333', padding: '0 3px' }}>{textItem.boxColor}</span> | </>              
              )}
              {typeof textItem.boxOpacity === 'number' && (
                <><strong>Box Opacity:</strong> {textItem.boxOpacity} | </> 
              )}
              {/* Display padding instead of boxPadding */}
              {typeof textItem.padding === 'number' && (
                <><strong>Padding:</strong> {textItem.padding}px</>
              )}
            </p>
          )}
        </div>
      ))}
      {editingTextIndex === null && textOverlays.length === 0 && <p className="placeholder-text" style={{ marginTop: 0 }}>No text overlays for this scene.</p>}

      {editingTextIndex !== null ? (
        <TextOverlayForm
          // Pass initial data: empty if adding (-1), existing item if editing (0+)
          initialData={editingTextIndex === -1 ? null : textOverlays[editingTextIndex]}
          onSave={handleSaveText} // Use the internal save handler which calls parent handlers
          onCancel={handleCancelTextEdit}
          disabled={disabled}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditingTextIndex(-1)} // Set index to -1 to indicate adding
          className="button button-add-text"
          disabled={disabled}
        >
          Add New Text Overlay
        </button>
      )}
    </div>
  );
}

export default TextOverlayEditor; // Add the default export!
