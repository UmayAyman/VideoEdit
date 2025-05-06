import { DragDropContext } from '@hello-pangea/dnd'; // Import DragDropContext
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast CSS
import './App.css'; // Import the CSS file
import AddSceneForm from './components/AddSceneForm'; // Import the form
import FileUpload from "./components/FileUpload";
import JsonPreviewModal from './components/JsonPreviewModal'; // Import the new modal
import SceneList from './components/SceneList'; // Import the SceneList component
import TemplateSelector from './components/TemplateSelector'; // Import selector
import { getTemplateContent, getTemplateList, saveTemplate, updateTemplate, uploadFile } from './services/api'; // Import the API function

// Default empty state for a new template
const defaultTemplateData = {
    resolution: "1920x1080",
    audio: "",
    scenes: []
};

function App() {
    // Main template data state
    const [templateData, setTemplateData] = useState(null); // Start as null initially
    const [loadedTemplateFile, setLoadedTemplateFile] = useState(null); // Track loaded file
    const [previousLoadedTemplateFile, setPreviousLoadedTemplateFile] = useState(null); // Track file before creating new
    const [isCreatingNew, setIsCreatingNew] = useState(false); // NEW state to track if we are creating a new template

    // State for UI modes
    const [isAddingScene, setIsAddingScene] = useState(false); // State for form visibility
    const [editingSceneIndex, setEditingSceneIndex] = useState(null); // State for active edit
    const [selectedSceneIndex, setSelectedSceneIndex] = useState(null); // State for selected scene

    // State for available templates
    const [templateList, setTemplateList] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    // State for audio upload
    const [audioUploadStatus, setAudioUploadStatus] = useState('idle');
    const [audioUploadProgress, setAudioUploadProgress] = useState(0);

    // State for JSON Preview
    const [previewJson, setPreviewJson] = useState(null); // Holds the JSON string
    const [previewSceneIndex, setPreviewSceneIndex] = useState(null); // Holds the index being previewed

    // State for the new Full JSON Preview Modal
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

    // Fetch template list on component mount
    useEffect(() => {
        setIsLoadingList(true);
        getTemplateList()
            .then(list => {
                setTemplateList(list);
            })
            .catch(err => {
                console.error("Failed to load template list:", err);
                toast.error(`Error loading template list: ${err.message || 'Unknown error'}`);
            })
            .finally(() => {
                setIsLoadingList(false);
            });
    }, []); // Empty dependency array means run once on mount

    // Determine the scene currently being edited
    const sceneBeingEdited = editingSceneIndex !== null && templateData ? templateData.scenes[editingSceneIndex] : null;
    const isTemplateLoaded = templateData !== null;

    const handleSave = async () => {
        if (!isTemplateLoaded) {
            toast.error("No template loaded to save.");
            return;
        }

        let savePromise;
        let actionVerb = 'Saving';

        if (loadedTemplateFile) {
            // Update existing file
            actionVerb = 'Updating';
            savePromise = updateTemplate(loadedTemplateFile, templateData)
                .then(data => {
                    // No need to refresh list if just updating
                    return data;
                });
        } else {
            // Save as new file
            actionVerb = 'Saving as new';
            savePromise = saveTemplate(templateData)
                .then(data => {
                    // Refresh list and set loaded file after successful *new* save
                    setLoadedTemplateFile(data.filename);
                    getTemplateList().then(setTemplateList).catch(console.error);
                    setIsCreatingNew(false); // Exit creating new mode on successful save
                    return data;
                });
        }

        // Clear previous state on any successful save/update
        savePromise.then(() => setPreviousLoadedTemplateFile(null));

        toast.promise(
            savePromise,
            {
                pending: `${actionVerb} template...`,
                success: (data) => `Template ${actionVerb.toLowerCase()} successful! Filename: ${data.filename}`,
                error: (err) => `Error ${actionVerb.toLowerCase()} template: ${err.message || 'Unknown error'}`
            }
        );
    };

    // Load selected template content
    const handleSelectTemplate = (filename) => {
        if (!filename) return;
        console.log('Loading template:', filename);
        setIsLoadingContent(true);
        setTemplateData(null); // Clear current template while loading
        setEditingSceneIndex(null); // Reset edit modes
        setIsAddingScene(false);

        getTemplateContent(filename)
            .then(data => {
                setTemplateData(data);
                setLoadedTemplateFile(filename);
                setPreviousLoadedTemplateFile(null); // Clear previous state on successful load
                setIsCreatingNew(false); // Exit creating new mode when loading a template
                toast.success(`${filename} loaded successfully!`);
            })
            .catch(err => {
                console.error("Failed to load template content:", err);
                toast.error(`Error loading ${filename}: ${err.message || 'Unknown error'}`);
                setLoadedTemplateFile(null); // Reset loaded file on error
                setTemplateData(defaultTemplateData); // Load default on error?
            })
            .finally(() => {
                setIsLoadingContent(false);
            });
    };

    // Function to handle deleting a scene
    const handleDeleteScene = (indexToDelete) => {
        if (!templateData) return;
        setTemplateData(prevData => ({
            ...prevData,
            scenes: prevData.scenes.filter((_, index) => index !== indexToDelete)
        }));
        toast.info(`Scene ${indexToDelete + 1} removed.`);
    };

    // Function to handle adding a new scene
    const handleAddScene = (newScene) => {
        if (!templateData) return;
        setTemplateData(prevData => ({
            ...prevData,
            scenes: [...prevData.scenes, newScene]
        }));
        setIsAddingScene(false);
        toast.success('New scene added successfully!');
    };

    // Function to cancel adding a scene
    const handleCancelAdd = () => {
        setIsAddingScene(false);
    };

    // Set the index of the scene to edit
    const handleEditScene = (indexToEdit) => {
        console.log('App.jsx: handleEditScene called with index:', indexToEdit);
        setEditingSceneIndex(indexToEdit);
        setIsAddingScene(false);
    };

    // Update the scene in the state array
    const handleUpdateScene = (indexToUpdate, updatedSceneData) => {
        if (!templateData) return;
        setTemplateData(prevData => ({
            ...prevData,
            scenes: prevData.scenes.map((scene, index) =>
                index === indexToUpdate ? updatedSceneData : scene
            )
        }));
        setEditingSceneIndex(null);
        toast.success(`Scene ${indexToUpdate + 1} updated successfully!`);
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingSceneIndex(null);
    };

    // Handlers for top-level properties
    const handleResolutionChange = (event) => {
        if (!templateData) return;
        const newResolution = event.target.value;
        setTemplateData(prevData => ({
            ...prevData,
            resolution: newResolution
        }));
    };

    const handleAudioFileChange = async (event) => {
        if (!templateData) return;
        const file = event.target.files ? event.target.files[0] : null;
        if (!file) {
            return;
        }

        setAudioUploadStatus('uploading');
        setAudioUploadProgress(0);
        toast.info(`Uploading audio file ${file.name}...`);

        try {
            const result = await uploadFile(file, (progress) => {
                setAudioUploadProgress(progress);
            });
            // Update the audio path in the main template data state
            setTemplateData(prevData => ({
                ...prevData,
                audio: result.filePath // Use path from backend
            }));
            setAudioUploadStatus('success');
            toast.success(`Uploaded ${file.name} successfully!`);
        } catch (error) {
            setAudioUploadStatus('error');
            toast.error(`Audio upload failed: ${error.message || 'Unknown error'}`);
        }
    };

    // --- Drag and Drop Handler ---
    const onDragEnd = (result) => {
        const { destination, source } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }
        if (destination.droppableId === 'sceneList' && templateData?.scenes) {
            const newScenes = Array.from(templateData.scenes);
            const [reorderedItem] = newScenes.splice(source.index, 1);
            newScenes.splice(destination.index, 0, reorderedItem);
            setTemplateData(prevData => ({ ...prevData, scenes: newScenes }));
            setSelectedSceneIndex(null);
            toast.info('Scene order updated. Selection reset.');
        }
    };

    // --- Selection Handler ---
    const handleSelectScene = (indexToSelect) => {
        setSelectedSceneIndex(indexToSelect);
        setEditingSceneIndex(null);
        setIsAddingScene(false);
    };

    // Handler for Create New Template button
    const handleCreateNew = () => {
        setPreviousLoadedTemplateFile(loadedTemplateFile); // Store the current file before resetting
        setTemplateData(defaultTemplateData);
        setLoadedTemplateFile(null);
        setSelectedSceneIndex(null);
        setEditingSceneIndex(null);
        setIsAddingScene(false);
        setIsCreatingNew(true); // Enter creating new mode
    };

    // Handler for Cancel New Template button
    const handleCancelNewTemplate = () => {
        if (previousLoadedTemplateFile) {
            toast.info(`Cancelling new template, reloading ${previousLoadedTemplateFile}...`);
            handleSelectTemplate(previousLoadedTemplateFile); // Reload the previous template
        } else {
            // If there was no previous template, just go back to the initial empty state
            setTemplateData(null);
            toast.info('Cancelled new template. No previous template to load.');
        }
        setPreviousLoadedTemplateFile(null); // Reset the previous tracker
        setIsCreatingNew(false); // Exit creating new mode on cancel
    };

    // --- JSON Preview Handlers ---
    const handleShowSceneJson = (index) => {
        if (templateData && templateData.scenes[index]) {
            const sceneJson = JSON.stringify(templateData.scenes[index], null, 2); // Pretty print
            setPreviewJson(sceneJson);
            setPreviewSceneIndex(index);
        } else {
            console.error('Attempted to preview JSON for non-existent scene at index:', index);
            toast.error('Cannot preview JSON for this scene.');
        }
    };

    const handleCloseJsonPreview = () => {
        setPreviewJson(null);
        setPreviewSceneIndex(null);
    };

    // --- Full JSON Modal Handlers ---
    const handleOpenJsonModal = () => {
        if (templateData) {
            setIsJsonModalOpen(true);
        } else {
            toast.error('No template data loaded to generate JSON.');
        }
    };

    const handleCloseJsonModal = () => {
        setIsJsonModalOpen(false);
    };

    const isAudioUploading = audioUploadStatus === 'uploading';

    // --- Render Logic ---
    console.log('App.jsx rendering, editingSceneIndex:', editingSceneIndex);
    console.log('App.jsx rendering, sceneBeingEdited:', sceneBeingEdited);

    return (
        <div className="app-root">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            {/* Header is now outside the container */}
            <header className="app-header">
                {/* Wrap heading in a container to center it with main content */}
                <div className="app-container">
                    <h1 className="main-heading">JSON Generator</h1>
                </div>
            </header>

            {/* Container now only wraps the main content */}
            <div className="app-container">
                <main className="app-main-content">
                    {/* Template Selection Area */}
                    <div className="template-selection-area">
                        <TemplateSelector
                            templateList={templateList}
                            onSelectTemplate={handleSelectTemplate}
                            currentTemplate={loadedTemplateFile}
                        />
                        <button
                            onClick={handleCreateNew}
                            className="button button-secondary button-create-new"
                        >
                            Create New Template
                        </button>
                    </div>


                    {isLoadingList && <p className="loading-message">Loading template list...</p>}
                    {isLoadingContent && <p className="loading-message">Loading template content...</p>}

                    {/* Only show editing section if a template is loaded or created */}
                    {isTemplateLoaded && (
                        <div className="controls-column" style={{ flex: 'unset', minWidth: 'unset' }}>
                            <DragDropContext onDragEnd={onDragEnd}>
                                <div className="editing-section">
                                    <h2>Editing: {loadedTemplateFile || 'New Template'}</h2>

                                    {/* Top Level Property Inputs */}
                                    <div className="top-level-inputs">
                                        <div className="input-group">
                                            <label htmlFor="resolutionInput">Resolution:</label>
                                            <input
                                                type="text"
                                                id="resolutionInput"
                                                value={templateData.resolution || ''}
                                                onChange={handleResolutionChange}
                                                placeholder="e.g., 1920x1080"
                                                disabled={isLoadingContent}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="audioInput">Audio File:</label>
                                            <input
                                                type="file"
                                                id="audioInput"
                                                accept="audio/*"
                                                onChange={handleAudioFileChange}
                                                disabled={isLoadingContent || isAudioUploading}
                                            />
                                            {templateData.audio && !isAudioUploading && (
                                                <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#555' }}>Current: {templateData.audio}</span>
                                            )}
                                            {isAudioUploading && (
                                                <span style={{ marginLeft: '10px', fontSize: '0.9em' }}>Uploading ({audioUploadProgress}%)...</span>
                                            )}
                                            {audioUploadStatus === 'error' && (
                                                <span style={{ marginLeft: '10px', fontSize: '0.9em', color: 'red' }}>Upload failed!</span>
                                            )}
                                        </div>
                                        {/* Show Cancel New Template button if applicable, MOVED here */}
                                        {isCreatingNew && (
                                            <div style={{ marginTop: '15px', marginBottom: '10px' }}> {/* Wrapper for spacing */}
                                                <button
                                                    onClick={handleCancelNewTemplate}
                                                    className="button button-danger"
                                                    disabled={isLoadingContent}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {/* Buttons: Save, Add Scene, Generate JSON */}
                                    <div className="main-action-buttons">
                                        <button onClick={handleSave} className="button button-save" disabled={isLoadingContent}>
                                            {loadedTemplateFile ? 'Update Template' : 'Save New Template'}
                                        </button>

                                        {!isAddingScene && editingSceneIndex === null && (
                                            <button onClick={() => setIsAddingScene(true)} className="button button-primary" disabled={isLoadingContent}>
                                                Add New Scene
                                            </button>
                                        )}
                                        <button
                                            onClick={handleOpenJsonModal}
                                            className="button button-secondary"
                                            disabled={!isTemplateLoaded}
                                            title="Show the complete JSON for the current template"
                                        >
                                            Generate Full JSON
                                        </button>
                                    </div>

                                    {/* Render Scene List FIRST, pass edit and JSON preview state/handlers down */}
                                    <SceneList
                                        scenes={templateData?.scenes || []}
                                        onDelete={handleDeleteScene}
                                        onEdit={handleEditScene}
                                        onSelect={handleSelectScene}
                                        onPreviewJson={handleShowSceneJson} // Still needed to set the index/data
                                        selectedIndex={selectedSceneIndex}
                                        // Props for inline editing
                                        editingIndex={editingSceneIndex}
                                        sceneBeingEditedData={sceneBeingEdited}
                                        onUpdateScene={handleUpdateScene}
                                        onCancelEdit={handleCancelEdit}
                                        // Props for inline JSON preview
                                        previewIndex={previewSceneIndex}
                                        previewJsonData={previewJson}
                                        onClosePreview={handleCloseJsonPreview}
                                    />

                                    {/* Render Add Form AFTER the list */}
                                    {isAddingScene && (
                                        <AddSceneForm onAddScene={handleAddScene} onCancel={handleCancelAdd} />
                                    )}
                                </div>
                            </DragDropContext>
                        </div>
                    )}

<FileUpload />


                    {!isTemplateLoaded && !isLoadingList && !isLoadingContent && (
                        <p className="placeholder-text">Select a template above to start editing, or save your work to create a new one.</p>
                    )}

                    {/* Render the Full JSON Preview Modal */}
                    <JsonPreviewModal
                        isOpen={isJsonModalOpen}
                        onClose={handleCloseJsonModal}
                        jsonData={templateData ? JSON.stringify(templateData, null, 2) : ''}
                        title={`Complete Template JSON (${loadedTemplateFile || 'New Template'})`}
                    />
                </main>
            </div>
        </div>
    );
}

export default App;
