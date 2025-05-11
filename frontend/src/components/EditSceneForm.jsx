import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify'; // Import toast
import { uploadFile } from '../services/api'; // Import upload function
import ImageOverlayEditor from './ImageOverlayEditor'; // Import ImageOverlayEditor
import TextOverlayEditor from './TextOverlayEditor';

// A list of possible transitions (could come from a config file later)
const availableTransitions = ['fade', 'circleclose', 'wipeleft', 'wiperight', 'slideup', 'slidedown'];

// Define available effect types (can be expanded)
const availableFilterTypes = ['None', 'colorchannelmixer'];

function EditSceneForm({ sceneToEdit, sceneIndex, onUpdateScene, onCancel }) {
  const [sceneData, setSceneData] = useState(() => ({
    ...sceneToEdit,
    text: Array.isArray(sceneToEdit.text) ? sceneToEdit.text : [],
    overlays: Array.isArray(sceneToEdit.overlays) ? sceneToEdit.overlays : (Array.isArray(sceneToEdit.imageOverlays) ? sceneToEdit.imageOverlays : []) // Renamed, with fallback for old data
  }));

  // Upload state
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadProgress, setUploadProgress] = useState(0);

  // Add state for filter
  const [filterType, setFilterType] = useState('None');
  const [filterSettings, setFilterSettings] = useState({ rr: 1.0, gg: 1.0, bb: 1.0 });

  // State to track which text overlay is being added/edited
  // null = none, -1 = adding new, 0+ = editing index
  const [editingTextIndex, setEditingTextIndex] = useState(null);

  // Add state for scene edit flag
  const [isSceneEditable, setIsSceneEditable] = useState(true);

  // Reset local state if the scene to edit changes
  useEffect(() => {
    const initialData = {
      ...sceneToEdit,
      text: Array.isArray(sceneToEdit.text) ? sceneToEdit.text : [],
      overlays: Array.isArray(sceneToEdit.overlays) ? sceneToEdit.overlays : (Array.isArray(sceneToEdit.imageOverlays) ? sceneToEdit.imageOverlays : []) // Renamed, with fallback
    };
    // Remove the old imageOverlays key if it exists after migration
    if (initialData.imageOverlays) {
      delete initialData.imageOverlays;
    }
    setSceneData(initialData);
    setUploadStatus('idle');
    setUploadProgress(0);

    // Sync filter state
    if (initialData.filter && initialData.filter.type) {
      setFilterType(initialData.filter.type);
      if (initialData.filter.type === 'colorchannelmixer' && initialData.filter.settings) {
        setFilterSettings(initialData.filter.settings);
      }
    } else {
      setFilterType('None');
    }
    setIsSceneEditable(initialData.edit !== undefined ? initialData.edit : true);

  }, [sceneToEdit]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSceneData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : (name === 'duration' ? parseInt(value, 10) || 0 : value)
    }));
  };

  // Handler for file input change
  const handleFileChange = async (event) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);
    toast.info(`Uploading ${file.name}...`);

    try {
      const result = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      // Update the path in the local sceneData state
      setSceneData(prevData => ({ ...prevData, path: result.filePath }));
      setUploadStatus('success');
      toast.success(`Uploaded ${file.name} successfully!`);
    } catch (error) {
      setUploadStatus('error');
      // Optionally revert path or keep it as is?
      // setSceneData(prevData => ({ ...prevData, path: sceneToEdit.path })); // Revert on error?
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Handler for changing filter settings
  const handleFilterSettingChange = (setting, value) => {
    setFilterSettings(prev => ({
      ...prev,
      [setting]: parseFloat(value) || 0 // Ensure it's a number
    }));
  };

  // Handler for deleting a text overlay from the local state
  const handleDeleteText = (indexToDelete) => {
    if (window.confirm(`Delete text overlay "${sceneData.text[indexToDelete]?.content}"?`)) {
      setSceneData(prevData => ({
        ...prevData,
        text: prevData.text.filter((_, index) => index !== indexToDelete)
      }));
    }
  };

  // Handler to START editing a specific text overlay
  const handleEditText = (indexToEdit) => {
    setEditingTextIndex(indexToEdit);
  };

  // Handler for updating a text overlay
  const handleUpdateText = (textIndex, updatedTextData) => {
    console.log('[EditSceneForm] handleUpdateText called. index:', textIndex, 'data:', updatedTextData); // LOG 4
    setSceneData(prevData => {
      const updatedTexts = [...(prevData.text || [])];
      updatedTexts[textIndex] = updatedTextData;
      return {
        ...prevData,
        text: updatedTexts
      };
    });
  };

  // Handler for adding a new text overlay
  const handleAddText = (newTextData) => {
    console.log('[EditSceneForm] handleAddText called. data:', newTextData); // LOG 5
    setSceneData(prevData => ({
      ...prevData,
      text: [...(prevData.text || []), newTextData]
    }));
  };

  // Handler for removing a text overlay
  const handleRemoveText = (textIndex) => {
    setSceneData(prevData => ({
      ...prevData,
      text: (prevData.text || []).filter((_, index) => index !== textIndex)
    }));
  };

  // Handler to save (add or update) a text overlay
  const handleSaveText = (textOverlayData) => {
    setSceneData(prevData => {
      const updatedTexts = [...(prevData.text || [])];

      if (editingTextIndex === -1) {
        updatedTexts.push(textOverlayData);
        toast.info('New text overlay added to form.');
      } else if (editingTextIndex !== null && editingTextIndex >= 0) {
        updatedTexts[editingTextIndex] = textOverlayData;
        toast.info(`Text overlay ${editingTextIndex + 1} updated in form.`);
      }

      return {
        ...prevData,
        text: updatedTexts
      };
    });

    setEditingTextIndex(null);
  };

  // Handler to cancel editing/adding text overlay
  const handleCancelTextEdit = () => {
    setEditingTextIndex(null);
  };

  // Text Overlay Handlers (remain the same)
  const handleTextChange = (textIndex, field, value) => {
    setSceneData(prevData => {
      const updatedTexts = [...(prevData.text || [])];
      if (updatedTexts[textIndex]) {
        updatedTexts[textIndex] = { ...updatedTexts[textIndex], [field]: value };
      }
      return {
        ...prevData,
        text: updatedTexts
      };
    });
  };

  // --- Overlay Handlers (Renamed from Image Overlay) ---
  const handleAddOverlay = (newOverlayData) => { // Renamed
    setSceneData(prevData => ({
      ...prevData,
      overlays: [...(prevData.overlays || []), newOverlayData] // Renamed
    }));
  };

  const handleUpdateOverlay = (index, updatedOverlayData) => { // Renamed
    setSceneData(prevData => ({
      ...prevData,
      overlays: (prevData.overlays || []).map((item, i) => // Renamed
        i === index ? updatedOverlayData : item
      )
    }));
  };

  const handleRemoveOverlay = (index) => { // Renamed
    setSceneData(prevData => ({
      ...prevData,
      overlays: (prevData.overlays || []).filter((_, i) => i !== index) // Renamed
    }));
  };

  // Submit the updated scene data
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = [];

    // Validate general scene fields if necessary (e.g., duration)
    if (!sceneData.path && sceneData.type !== 'color' && sceneData.type !== 'text') {
        validationErrors.push("Scene path/file is required for this scene type.");
    }
    if (sceneData.duration <= 0) {
        validationErrors.push("Duration must be a positive number.");
    }

    // Construct the filter object and validate if filter is chosen
    let filterData = null;
    if (filterType !== 'None') {
      if (filterType === 'colorchannelmixer') {
        // All settings for colorchannelmixer are required if this filter type is selected
        if (filterSettings.rr === undefined || filterSettings.rr === null || isNaN(parseFloat(filterSettings.rr))) {
          validationErrors.push("Filter setting 'Red (rr)' is required and must be a number.");
        }
        if (filterSettings.gg === undefined || filterSettings.gg === null || isNaN(parseFloat(filterSettings.gg))) {
          validationErrors.push("Filter setting 'Green (gg)' is required and must be a number.");
        }
        if (filterSettings.bb === undefined || filterSettings.bb === null || isNaN(parseFloat(filterSettings.bb))) {
          validationErrors.push("Filter setting 'Blue (bb)' is required and must be a number.");
        }
        // If no validation errors for settings, construct filterData
        if (validationErrors.filter(err => err.startsWith("Filter setting")).length === 0) {
            filterData = { type: filterType, settings: filterSettings };
        }
      } else {
        // If a filterType is selected but it's not 'colorchannelmixer',
        // and your rule implies only 'colorchannelmixer' is valid when a filter is present.
        validationErrors.push(`Invalid filter type selected. Only 'colorchannelmixer' is currently supported with settings.`);
      }
    } else {
        // If filterType is 'None', ensure filterData remains null
        filterData = null;
    }

    if (validationErrors.length > 0) {
      toast.error(validationErrors.join("\n"));
      return; // Stop submission
    }

    // Prepare final scene data, including filters and scene edit flag
    const finalSceneData = {
      ...sceneData,
      filter: filterData,
      edit: isSceneEditable
    };

    // Before submitting, ensure we don't send the old imageOverlays key if overlays exists
    if (finalSceneData.overlays && finalSceneData.imageOverlays) {
        delete finalSceneData.imageOverlays;
    }

    onUpdateScene(sceneIndex, finalSceneData);
  };

  const isUploading = uploadStatus === 'uploading';

  if (!sceneToEdit) return null; // Don't render if no scene is being edited

  return (
    // Apply form container and specific edit-form classes
    <div className="form-container edit-form">
      <h3>Editing Scene {sceneIndex + 1}</h3>
      <form onSubmit={handleSubmit}>
        {/* Type (Read-only for now) - REMOVING disabled */}
        <div className="input-group">
          <label htmlFor="editSceneType">Type:</label>
          <select
            id="editSceneType"
            value={sceneData.type || 'video'} // Ensure a default value if somehow undefined
            onChange={(e) => setSceneData(prev => ({ ...prev, type: e.target.value }))}
          // Removed disabled attribute
          >
            <option value="video">Video</option>
            <option value="image">Image</option>
          </select>
        </div>
        {/* Path Input - Now a File Input */}
        <div className="input-group">
          <label htmlFor="sceneEditFile">Media File:</label>
          <input
            type="file"
            id="sceneEditFile"
            onChange={handleFileChange}
            accept="image/*,video/*" // Specify acceptable file types
            disabled={isUploading} // Disable while uploading
          />
          {/* Display current path */}
          {sceneData.path && !isUploading && (
            <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#555' }}>Current: {sceneData.path}</span>
          )}
          {/* Upload Status Display */}
          {isUploading && (
            <span style={{ marginLeft: '10px', fontSize: '0.9em' }}>Uploading ({uploadProgress}%)...</span>
          )}
          {uploadStatus === 'error' && (
            <span style={{ marginLeft: '10px', fontSize: '0.9em', color: 'red' }}>Upload failed!</span>
          )}
          {uploadStatus === 'success' && (
            <span style={{ marginLeft: '10px', fontSize: '0.9em', color: 'green' }}>✅ New file uploaded. Path: {sceneData.path}</span>
          )}
        </div>
        {/* Duration */}
        <div className="input-group">
          <label htmlFor="editDuration">Duration (s):</label>
          <input
            type="number"
            id="editDuration"
            name="duration"
            value={sceneData.duration || ''}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        {/* Transition */}
        <div className="input-group">
          <label htmlFor="editTransition">Transition:</label>
          <select id="editTransition" value={sceneData.transition} onChange={(e) => setSceneData(prev => ({ ...prev, transition: e.target.value }))} >
            {availableTransitions.map(t => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        {/* Scene Editable Checkbox */}
        <div className="input-group">
          <label htmlFor="sceneEditable" style={{ width: 'auto' }}>Editable:</label> {/* Allow label auto width */}
          <input type="checkbox" id="sceneEditable" checked={isSceneEditable} onChange={(e) => setIsSceneEditable(e.target.checked)} />
        </div>
        {/* Filter Type */}
        <div className="input-group">
          <label htmlFor="editFilterType">Filter:</label>
          <select id="editFilterType" value={filterType} onChange={(e) => setFilterType(e.target.value)} >
            {availableFilterTypes.map(t => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        {/* Conditional Filter Settings */}
        {filterType === 'colorchannelmixer' && (
          <div style={{ marginLeft: '20px' }}> {/* Keep indent for settings block */}
            <div className="input-group">
              <label htmlFor="editFilterRR" style={{ width: '60px' }}>RR:</label>
              <input
                type="number"
                id="editFilterRR"
                name="rr"
                value={filterSettings.rr}
                onChange={(e) => handleFilterSettingChange('rr', e.target.value)}
                step="0.1"
                disabled={!isSceneEditable || filterType !== 'colorchannelmixer'}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="editFilterGG" style={{ width: '60px' }}>GG:</label>
              <input
                type="number"
                id="editFilterGG"
                name="gg"
                value={filterSettings.gg}
                onChange={(e) => handleFilterSettingChange('gg', e.target.value)}
                step="0.1"
                disabled={!isSceneEditable || filterType !== 'colorchannelmixer'}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="editFilterBB" style={{ width: '60px' }}>BB:</label>
              <input
                type="number"
                id="editFilterBB"
                name="bb"
                value={filterSettings.bb}
                onChange={(e) => handleFilterSettingChange('bb', e.target.value)}
                step="0.1"
                disabled={!isSceneEditable || filterType !== 'colorchannelmixer'}
                required
              />
            </div>
          </div>
        )}

        {/* Text Overlays Section */}
        <TextOverlayEditor
          textOverlays={sceneData.text || []}
          onAddText={handleAddText}
          onRemoveText={handleRemoveText}
          onUpdateText={handleUpdateText}
          disabled={isUploading}
        />

        {/* Image/GIF Overlays Section */}
        <ImageOverlayEditor
          overlays={sceneData.overlays || []} // Changed prop name
          onAddImageOverlay={handleAddOverlay} // Changed handler prop name
          onUpdateImageOverlay={handleUpdateOverlay} // Changed handler prop name
          onRemoveImageOverlay={handleRemoveOverlay} // Changed handler prop name
          disabled={isUploading}
        />

        {/* Buttons */}
        <div className="button-group" style={{ marginTop: '20px' }}>
          <button type="submit" className="button button-save" disabled={isUploading}>
            Update Scene
          </button>
          <button type="button" onClick={onCancel} className="button button-secondary" disabled={isUploading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditSceneForm; 