import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { uploadFile } from '../services/api'; // Import upload function
// No need to import App.css if it's imported in App.jsx

function AddSceneForm({ onAddScene, onCancel }) {
    const [sceneType, setSceneType] = useState('video');
    const [path, setPath] = useState(''); // Store the final path from backend
    const [duration, setDuration] = useState(10); // Default duration

    // Upload state
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFilename, setUploadedFilename] = useState('');

    const handleFileChange = async (event) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (!file) {
            return;
        }

        setUploadStatus('uploading');
        setUploadProgress(0);
        setUploadedFilename(file.name); // Show original filename while uploading
        setPath(''); // Clear previous path
        

        try {
            const result = await uploadFile(file, (progress) => {
                setUploadProgress(progress);
            });
            setPath(result.filePath); // Set the path returned by the backend
            setUploadStatus('success');
            toast.success(`Uploaded ${file.name} successfully!`);
        } catch (error) {
            setUploadStatus('error');
            setPath(''); // Clear path on error
            toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
        } finally {
            // Maybe reset filename display if needed on error?
            // setUploadedFilename('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        console.log('DEBUG: Current path:', path);
        if (!path) { // Check if path is set (meaning upload was successful)
            alert('Please upload a file for the scene first.');
            return;
        }

        const newScene = {
            type: sceneType,
            edit: true, // Default new scenes to editable
            path: path, // Use the path received from backend
            duration: parseInt(duration, 10) || 10, // Ensure duration is a number
            // Add default empty arrays/objects for other properties if needed
            transition: 'fade', // Default transition
            effect: null,
            text: []
        };

        onAddScene(newScene);

        // Optionally clear the form or it will be hidden by the parent
        // setSceneType('video');
        // setPath('');
        // setDuration(10);
    };

    const isUploading = uploadStatus === 'uploading';

    return (
        // Apply form container and specific add-form classes
        <div className="form-container add-form">
            <h3>Add New Scene</h3>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="sceneType">Type:</label>
                    <select
                        id="sceneType"
                        value={sceneType}
                        onChange={(e) => setSceneType(e.target.value)}
                    >
                        <option value="video">Video</option>
                        <option value="image">Image</option>
                    </select>
                </div>
                <div className="input-group">
                    <label htmlFor="duration">Duration (s):</label>
                    <input
                        type="number"
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        min="1"
                        required
                    />
                </div>

                {/* File Input Section */}
                <div className="input-group">
                    <label htmlFor="sceneFile">Media File:</label>
                    <input 
                        type="file" 
                        id="sceneFile" 
                        onChange={handleFileChange} 
                        accept="image/*,video/*" // Specify acceptable file types
                        required 
                        disabled={isUploading} // Disable while uploading
                    />
                </div>

                {/* Upload Status Display */}
                {uploadStatus !== 'idle' && (
                    <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
                        {isUploading && 
                            <span>Uploading {uploadedFilename}... ({uploadProgress}%)</span>
                        }
                        {uploadStatus === 'success' && 
                            <span style={{ color: 'green' }}>✅ Upload complete! Path: {path}</span>
                        }
                        {uploadStatus === 'error' && 
                            <span style={{ color: 'red' }}>❌ Upload failed. Please try again.</span>
                        }
                    </div>
                )}

                <div className="button-group" style={{marginTop: '15px'}}>
                    {/* Disable Add button if no path is set or if uploading */}
                    <button type="submit" className="button button-save" disabled={isUploading}>
                        Add Scene
                    </button>
                    <button type="button" onClick={onCancel} className="button button-secondary" disabled={isUploading}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddSceneForm; 