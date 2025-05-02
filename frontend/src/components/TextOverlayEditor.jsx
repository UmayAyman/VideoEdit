import React, { useState } from 'react';
import { toast } from 'react-toastify';
import TextOverlayForm from './TextOverlayForm'; // We'll need this form

function TextOverlayEditor({ textOverlays = [], onTextChange, onAddText, onRemoveText, disabled = false }) {
  // State to track which text overlay is being added/edited
  // null = none, -1 = adding new, 0+ = editing index
  const [editingTextIndex, setEditingTextIndex] = useState(null);

  // Handler to START editing a specific text overlay
  const handleEditText = (indexToEdit) => {
    setEditingTextIndex(indexToEdit);
  };

  // Handler to save (add or update) a text overlay via the parent form's handlers
  const handleSaveText = (textOverlayData) => {
    if (editingTextIndex === -1) { // Adding new
      onAddText(textOverlayData); // Call parent's add handler
      toast.info('New text overlay added.');
    } else if (editingTextIndex !== null && editingTextIndex >= 0) { // Updating existing
      // Call parent's change handler for each field
      // This assumes onTextChange can handle updating the whole object or individual fields
      // Let's refine this: onTextChange should probably update the whole object at the specified index
      // We need to adjust the parent's handler signature later if needed.
      // For now, assuming onTextChange updates the whole text object at textIndex.
      // Let's simplify and assume the parent will provide an 'onUpdateText' handler.
      // We'll call a placeholder 'onUpdateText' which we'll need to implement in EditSceneForm
      // onUpdateText(editingTextIndex, textOverlayData); // Needs implementation in parent
      
      // Let's rethink: EditSceneForm manages the *entire* sceneData.
      // TextOverlayEditor should call functions provided by EditSceneForm to modify that data.
      // onTextChange(textIndex, field, value) isn't ideal for saving a whole form.
      // Let's pass down specific handlers: onAddTextOverlay, onUpdateTextOverlay, onRemoveTextOverlay
      
      // Okay, let's stick with the original plan from EditSceneForm for now.
      // Assume EditSceneForm provides onAddText, onUpdateText, onRemoveText.
      // We will need to adjust EditSceneForm to provide these handlers.

      // If updating, we need a way to signal the update to the parent.
      // Let's add an onUpdateText prop.
      if (onUpdateText) { // Check if the prop exists
           onUpdateText(editingTextIndex, textOverlayData);
           toast.info(`Text overlay ${editingTextIndex + 1} updated.`);
       } else {
           console.warn("TextOverlayEditor: onUpdateText prop is missing!");
           // Fallback or error handling if needed
       }


    } else {
      console.error('TextOverlayEditor: Invalid editingTextIndex during save:', editingTextIndex);
    }
    setEditingTextIndex(null); // Close the text form
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
              <button 
                type="button" 
                onClick={() => handleEditText(index)} 
                className="text-overlay-button edit" 
                title="Edit Text Overlay"
                disabled={disabled}
              >
                Edit
              </button>
              <button 
                type="button" 
                // Use the passed-in onRemoveText handler directly
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
            {/* Display basic info - could be expanded */}
            <p><strong>Content:</strong> {textItem.content?.substring(0, 30)}{textItem.content?.length > 30 ? '...' : '' || '(No content)'}</p>
            <p><strong>Time:</strong> {textItem.start}s - {textItem.end}s | <strong>Pos:</strong> ({textItem.xPosition},{textItem.yPosition})</p>
          </div>
       ))}
      {editingTextIndex === null && textOverlays.length === 0 && <p className="placeholder-text" style={{marginTop:0}}>No text overlays for this scene.</p> }

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
