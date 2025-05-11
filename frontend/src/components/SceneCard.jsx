import { Draggable } from '@hello-pangea/dnd';
import React from 'react';

function SceneCard({ scene, index, onDelete, onEdit, onSelect, isSelected }) {
  // Basic styling for the card
  const baseCardStyle = {
    border: '1px solid #eee',
    padding: '15px',
    paddingTop: '30px', // More space for buttons
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
    position: 'relative', // Needed for positioning the button
    cursor: 'pointer' // Indicate clickable
  };

  // Apply selected style conditionally
  const selectedStyle = isSelected ? {
    borderColor: '#007bff', 
    borderWidth: '2px', 
    backgroundColor: '#e7f3ff' 
  } : {};

  const combinedCardStyle = { ...baseCardStyle, ...selectedStyle };

  // Styling for buttons container
  const buttonContainerStyle = {
    position: 'absolute',
    top: '5px',
    right: '5px',
    display: 'flex',
    gap: '5px'
  };

  // Shared button style
  const buttonStyle = {
    border: 'none',
    borderRadius: '3px',
    padding: '2px 5px',
    cursor: 'pointer',
    fontSize: '0.8em'
  };

  // Specific button styles
  const editButtonStyle = { ...buttonStyle, background: '#ffc107', color: 'black' };
  const deleteButtonStyle = { ...buttonStyle, background: '#ff4d4d', color: 'white' };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete Scene ${index + 1}?`)) {
      if (onDelete) {
        onDelete(index);
      }
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    console.log(`Edit button clicked for index: ${index}`);
    if (onEdit) {
      onEdit(index);
    }
  };

  const handleCardClick = () => {
    if(onSelect) {
      onSelect(index);
    }
  };

  // Use path as ID, fallback to index if path is missing/duplicate (potential issue!)
  const draggableId = `${scene.path || 'scene'}-${index}`;

  // Construct className string conditionally
  const cardClassName = `scene-card ${isSelected ? 'selected' : ''}`;

  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided) => (
        <div 
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cardClassName}
          style={provided.draggableProps.style}
          onClick={handleCardClick}
        >
          <div className="scene-card-buttons">
            <button 
              className="scene-card-button edit"
              onClick={handleEditClick}
              title="Edit Scene"
            >
                Edit
            </button>
            <button 
              className="scene-card-button delete"
              onClick={handleDeleteClick}
              title="Delete Scene"
            >
                X
            </button>
          </div>

          <h4>Scene {index + 1} ({scene.type})</h4>
          <p><strong>Path:</strong> {scene.path}</p>
          <p><strong>Duration:</strong> {scene.duration}s</p>
          <p><strong>Transition:</strong> {scene.transition || 'N/A'}</p>
          <p><strong>Filter:</strong> {scene.effect?.type || 'None'}</p>
          <p><strong>Text Overlays:</strong> {scene.text?.length || 0}</p>
          <p><strong>Editable:</strong> {scene.edit ? 'Yes' : 'No'}</p>
          {/* We can add more details and edit buttons later */}
        </div>
      )}
    </Draggable>
  );
}

export default SceneCard;
