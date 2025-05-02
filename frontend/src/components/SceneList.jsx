import { Draggable, Droppable } from '@hello-pangea/dnd'; // Import Droppable and Draggable
import React from 'react';
import EditSceneForm from './EditSceneForm'; // Import EditSceneForm

// Function to get a short display name for the path
const getDisplayPath = (path) => {
    if (!path) return '(No Path)';
    // Attempt to get the filename from the path
    const parts = path.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1] || path;
};

function SceneList({ 
    scenes, 
    onDelete, 
    onEdit, 
    onSelect, 
    onPreviewJson, 
    selectedIndex, 
    // New props for inline editing
    editingIndex, 
    sceneBeingEditedData, 
    onUpdateScene, 
    onCancelEdit, 
    // Inline JSON preview props
    previewIndex, 
    previewJsonData, 
    onClosePreview 
}) {
  if (!scenes || scenes.length === 0) {
    return <p className="placeholder-text">No scenes added yet.</p>; // Use placeholder class
  }

  return (
    <div className="scene-list-container"> {/* Apply container class */}
      <h2 className="scene-list-header">Scenes</h2> {/* Apply header class */}
      <Droppable droppableId="sceneList">
        {(provided) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="scene-list-droppable" // Use class only
          >
            {scenes.map((scene, index) => (
              // Use React.Fragment to wrap Draggable and potential EditForm
              <React.Fragment key={`scene-wrapper-${index}`}> 
                <Draggable draggableId={`scene-${index}`} index={index}>
                  {(providedDraggable, snapshot) => (
                    <div 
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      {...providedDraggable.dragHandleProps} 
                      className={`scene-item ${selectedIndex === index ? 'selected' : ''} ${snapshot.isDragging ? 'dragging' : ''}`}
                      onClick={() => onSelect(index)} // Select on click
                      style={providedDraggable.draggableProps.style} // Keep only DND required style
                    >
                      <div className="scene-info">
                        {/* Top Row Info */}
                        <div className="scene-info-row top-row">
                          <span>{index + 1}. {scene.type === 'video' ? '[Video]' : '[Image]'}</span>
                          <span className="scene-path" title={scene.path}>{getDisplayPath(scene.path)}</span>
                        </div>
                        {/* Bottom Row Info (Details) - Add more details */}
                        <div className="scene-info-row bottom-row">
                          <span className="scene-detail">Duration: {scene.duration}s</span>
                          {scene.transition && <span className="scene-detail">Transition: {scene.transition}</span>}
                          {/* Explicit Effect display */}
                          <span className="scene-detail">Effect: {scene.effect?.type || 'None'}</span>
                          {/* Text Overlay Count */}
                          <span className="scene-detail">Text: {scene.text?.length || 0}</span>
                          {/* Editable Status */}
                          <span className="scene-detail">Editable: {scene.edit ? 'Yes' : 'No'}</span>
                          {/* Full Path (maybe truncated differently?) - Added as requested */}
                          <span className="scene-detail scene-detail-path" title={scene.path}>Path: {scene.path || '(Not set)'}</span>
                        </div>
                      </div>
                      <div className="scene-actions">
                        <button onClick={(e) => { e.stopPropagation(); onPreviewJson(index); }} className="button button-icon" title="Preview Scene JSON">
                          📄 JSON 
                        </button>
                         <button onClick={(e) => { e.stopPropagation(); onEdit(index); }} className="button button-icon" title="Edit Scene">
                          ✏️ Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(index); }} className="button button-icon button-danger" title="Delete Scene">
                          ❌ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
                
                {/* Conditionally render EditSceneForm right after the Draggable item */}
                {index === editingIndex && sceneBeingEditedData && (
                  <div className="edit-form-inline-container"> {/* Wrapper for styling */} 
                    <EditSceneForm 
                      sceneToEdit={sceneBeingEditedData}
                      sceneIndex={editingIndex} // Pass the correct index
                      onUpdateScene={onUpdateScene} // Pass handler down
                      onCancel={onCancelEdit}      // Pass handler down
                    />
                  </div>
                )}

                {/* Conditionally render JSON Preview */}
                {index === previewIndex && previewJsonData && (
                  <div className="json-preview-inline-container"> {/* Wrapper for styling */} 
                      <div className="json-preview-inline-header">
                        <h4>JSON Preview (Scene {index + 1})</h4>
                        <button 
                            onClick={onClosePreview} // Use handler from props
                            className="button button-icon" 
                            title="Close Preview"
                            style={{padding: '2px 5px', fontSize: '0.8em'}} // Make close button extra small
                        >
                            ❌ Close
                        </button>
                      </div>
                      <pre className="json-preview-content json-preview-inline-content">
                        {previewJsonData}
                      </pre>
                  </div>
                )}
              </React.Fragment>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default SceneList;
