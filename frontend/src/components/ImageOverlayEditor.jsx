import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ImageOverlayForm from './ImageOverlayForm';

function ImageOverlayEditor({ overlays = [], onAddOverlay, onUpdateOverlay, onRemoveOverlay, disabled = false }) {
  const [editingIndex, setEditingIndex] = useState(null); // null = none, -1 = adding new, 0+ = editing index
  console.log('[ImageOverlayEditor] Rendering with overlays:', overlays); // Log received props

  const handleEdit = (indexToEdit) => {
    setEditingIndex(indexToEdit);
  };

  const handleSave = (overlayData) => {
    if (editingIndex === -1) { // Adding new
      onAddOverlay(overlayData);
      toast.info('New image overlay added.');
    } else if (editingIndex !== null && editingIndex >= 0) { // Updating existing
      onUpdateOverlay(editingIndex, overlayData);
      toast.info(`Image overlay ${editingIndex + 1} updated.`);
    }
    setEditingIndex(null); // Close the form
  };

  const handleCancel = () => {
    setEditingIndex(null);
  };

  const handleRemove = (indexToRemove) => {
    if (window.confirm(`Delete image overlay ${indexToRemove + 1} (Path: ${overlays[indexToRemove]?.path})?`)) {
        onRemoveOverlay(indexToRemove);
        toast.info(`Image overlay ${indexToRemove + 1} removed.`);
    }
  };

  return (
    <div className="image-overlay-section">
      <h4>Image/GIF Overlays</h4>
      {editingIndex === null && overlays.length > 0 && overlays.map((item, index) => {
        console.log(`[ImageOverlayEditor] Item ${index} path:`, item.path, `Type: ${typeof item.path}`); // Log each item's path and type
        return (
          <div key={index} className="image-overlay-item">
            <div className="image-overlay-buttons">
              <button style = {{backgroundColor: "#f8f9fa", borderColor: "#6c757d"}}
                type="button"
                onClick={() => handleEdit(index)}
                className="image-overlay-button edit"
                title="Edit Image/GIF Overlay"
                disabled={disabled}
              >
                Edit
              </button>
              <button style = {{backgroundColor: "#f8f9fa", borderColor: "#6c757d", color: "black"}}
                type="button"
                onClick={() => handleRemove(index)}
                className="image-overlay-button delete"
                title="Delete Image/GIF Overlay"
                disabled={disabled}
              >
                X
              </button>
            </div>
            <p><strong>Path:</strong> {(item.path && item.path !== 'undefined') ? (item.path.length > 40 ? item.path.substring(0, 37) + '...' : item.path) : '(No path)'}</p>
            <p><strong>Scale:</strong> {item.scale !== undefined && item.scale !== null ? String(item.scale) : 'N/A'} | <strong>Pos:</strong> ({item.xPosition},{item.yPosition}) | <strong>Time:</strong> {item.start}s - {item.end}s</p>
          </div>
        );
      })}
      {editingIndex === null && overlays.length === 0 && <p className="placeholder-text" style={{ marginTop: 0 }}>No image/GIF overlays for this scene.</p>}

      {editingIndex !== null ? (
        <ImageOverlayForm
          initialData={editingIndex === -1 ? null : overlays[editingIndex]}
          onSave={handleSave}
          onCancel={handleCancel}
          disabled={disabled}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditingIndex(-1)}
          className="button button-add-image-overlay"
          disabled={disabled}
        >
          Add New Image/GIF Overlay
        </button>
      )}
    </div>
  );
}

export default ImageOverlayEditor; 