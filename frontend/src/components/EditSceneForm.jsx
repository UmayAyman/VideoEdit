import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify'; // Import toast
import { uploadFile } from '../services/api'; // Import upload function
import TextOverlayEditor from './TextOverlayEditor';

// A list of possible transitions (could come from a config file later)
const availableTransitions = ['fade', 'circleclose', 'wipeleft', 'wiperight', 'slideup', 'slidedown'];

// Define available effect types (can be expanded)
const availableEffectTypes = ['None', 'colorchannelmixer'];

function EditSceneForm({ sceneToEdit, sceneIndex, onUpdateScene, onCancel }) {
  const [sceneData, setSceneData] = useState({ ...sceneToEdit });

  // Upload state
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadProgress, setUploadProgress] = useState(0);

  // Add state for effect
  const [effectType, setEffectType] = useState('None');
  const [effectSettings, setEffectSettings] = useState({ rr: 1.0, gg: 1.0, bb: 1.0 });

  // Add state for the text overlays array
  const [texts, setTexts] = useState([]);
  
  // State to track which text overlay is being added/edited
  // null = none, -1 = adding new, 0+ = editing index
  const [editingTextIndex, setEditingTextIndex] = useState(null);

  // Add state for scene edit flag
  const [isSceneEditable, setIsSceneEditable] = useState(true);

  // Reset local state if the scene to edit changes
  useEffect(() => {
    // Ensure sceneData always has a text array
    const initialData = { 
        ...sceneToEdit, 
        text: Array.isArray(sceneToEdit.text) ? sceneToEdit.text : [] 
    };
    setSceneData(initialData);
    setUploadStatus('idle'); 
    setUploadProgress(0);

    // Sync effect state (if effects are still managed here)
    if (initialData.effect && initialData.effect.type) {
      setEffectType(initialData.effect.type);
      if (initialData.effect.type === 'colorchannelmixer' && initialData.effect.settings) {
        setEffectSettings(initialData.effect.settings);
      }
    } else {
        setEffectType('None');
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

  // Handler for changing effect settings
  const handleEffectSettingChange = (setting, value) => {
    setEffectSettings(prev => ({
      ...prev,
      [setting]: parseFloat(value) || 0 // Ensure it's a number
    }));
  };

  // Handler for deleting a text overlay from the local state
  const handleDeleteText = (indexToDelete) => {
    if (window.confirm(`Delete text overlay "${texts[indexToDelete]?.content}"?`)) {
      setTexts(currentTexts => currentTexts.filter((_, index) => index !== indexToDelete));
    }
  };

  // Handler to START editing a specific text overlay
  const handleEditText = (indexToEdit) => {
    setEditingTextIndex(indexToEdit);
  };

  // Handler to save (add or update) a text overlay
  const handleSaveText = (textOverlayData) => {
    if (editingTextIndex === -1) { // Adding new
      setTexts(currentTexts => [...currentTexts, textOverlayData]);
      toast.info('New text overlay added to form.');
    } else if (editingTextIndex !== null && editingTextIndex >= 0) { // Updating existing
      setTexts(currentTexts => 
        currentTexts.map((item, index) => 
          index === editingTextIndex ? textOverlayData : item
        )
      );
      toast.info(`Text overlay ${editingTextIndex + 1} updated in form.`);
    } else {
      console.error('Invalid editingTextIndex during save:', editingTextIndex);
    }
    setEditingTextIndex(null); // Close the text form
  };

  // Handler to cancel editing/adding text overlay
  const handleCancelTextEdit = () => {
    setEditingTextIndex(null);
  };

  // Text Overlay Handlers (remain the same)
  const handleTextChange = (textIndex, field, value) => { 
    // ... same logic ... 
  };
  const handleAddText = () => { 
    // ... same logic ... 
  };
  const handleRemoveText = (textIndex) => { 
    // ... same logic ... 
  };

  // Submit the updated scene data
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct the effect object based on the selected type
    let effectData = null;
    if (effectType !== 'None') {
      effectData = { type: effectType };
      if (effectType === 'colorchannelmixer') {
        effectData.settings = effectSettings;
      }
    }

    // Prepare final scene data, including effects and scene edit flag
    const finalSceneData = {
        ...sceneData, // Includes path, duration, transition, text array
        effect: effectData, 
        edit: isSceneEditable
    };

    onUpdateScene(sceneIndex, finalSceneData); // Pass the complete updated scene data up
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
          <label htmlFor="sceneEditable" style={{width: 'auto'}}>Editable:</label> {/* Allow label auto width */}
          <input type="checkbox" id="sceneEditable" checked={isSceneEditable} onChange={(e) => setIsSceneEditable(e.target.checked)} />
        </div>
        {/* Effect Type */}
        <div className="input-group">
          <label htmlFor="editEffectType">Effect:</label>
          <select id="editEffectType" value={effectType} onChange={(e) => setEffectType(e.target.value)} >
            {availableEffectTypes.map(t => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        {/* Conditional Effect Settings */}
        {effectType === 'colorchannelmixer' && (
          <div style={{marginLeft: '20px'}}> {/* Keep indent for settings block */}
            <div className="input-group">
              <label htmlFor="editEffectRR" style={{width: '60px'}}>RR:</label>
              <input type="number" step="0.1" id="editEffectRR" value={effectSettings.rr} onChange={(e) => handleEffectSettingChange('rr', e.target.value)} />
            </div>
            <div className="input-group">
              <label htmlFor="editEffectGG" style={{width: '60px'}}>GG:</label>
              <input type="number" step="0.1" id="editEffectGG" value={effectSettings.gg} onChange={(e) => handleEffectSettingChange('gg', e.target.value)} />
            </div>
            <div className="input-group">
              <label htmlFor="editEffectBB" style={{width: '60px'}}>BB:</label>
              <input type="number" step="0.1" id="editEffectBB" value={effectSettings.bb} onChange={(e) => handleEffectSettingChange('bb', e.target.value)} />
            </div>
          </div>
        )}

        {/* Text Overlays Section */}
        <TextOverlayEditor 
            textOverlays={sceneData.text || []} 
            onTextChange={handleTextChange}
            onAddText={handleAddText}
            onRemoveText={handleRemoveText}
            disabled={isUploading}
        />
        
        {/* Buttons */}
        <div className="button-group" style={{marginTop: '20px'}}>
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