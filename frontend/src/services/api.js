import axios from 'axios';

// Define the base URL for your backend API
const API_URL = 'http://localhost:5000/api';

/**
 * Sends template data to the backend API to save it.
 * @param {object} templateData - The JSON data for the template.
 * @returns {Promise<object>} - The response data from the server.
 */
export const saveTemplate = async (templateData) => {
    try {
        const response = await axios.post(`${API_URL}/templates`, templateData);
        return response.data; // Contains { message: '...', filename: '...' }
    } catch (error) {
        console.error('Error saving template:', error.response?.data || error.message);
        // Re-throw the error or return a specific error structure
        throw error.response?.data || new Error('Failed to save template');
    }
};

/**
 * Fetches the list of available template filenames from the backend.
 * @returns {Promise<string[]>} - An array of template filenames.
 */
export const getTemplateList = async () => {
    try {
        const response = await axios.get(`${API_URL}/templates`);
        return response.data; // Should be an array of strings
    } catch (error) {
        console.error('Error fetching template list:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch template list');
    }
};

/**
 * Fetches the content of a specific template file from the backend.
 * @param {string} filename - The filename of the template to fetch.
 * @returns {Promise<object>} - The JSON content of the template.
 */
export const getTemplateContent = async (filename) => {
    try {
        // Basic check to prevent unintended requests
        if (!filename || !filename.endsWith('.json')) {
            throw new Error('Invalid filename requested');
        }
        // Encode filename in case it contains special characters, although unlikely here
        const encodedFilename = encodeURIComponent(filename);
        const response = await axios.get(`${API_URL}/templates/${encodedFilename}`);
        return response.data; // Should be the template JSON object
    } catch (error) {
        console.error(`Error fetching template content for ${filename}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to fetch template content for ${filename}`);
    }
};

/**
 * Updates an existing template file on the backend.
 * @param {string} filename - The filename of the template to update.
 * @param {object} templateData - The new JSON data for the template.
 * @returns {Promise<object>} - The response data from the server.
 */
export const updateTemplate = async (filename, templateData) => {
  try {
    // Basic check
    if (!filename || !filename.endsWith('.json')) {
        throw new Error('Invalid filename provided for update');
    }
    const encodedFilename = encodeURIComponent(filename);
    const response = await axios.put(`${API_URL}/templates/${encodedFilename}`, templateData);
    return response.data; // Contains { message: '...', filename: '...' }
  } catch (error) {
    console.error(`Error updating template ${filename}:`, error.response?.data || error.message);
    throw error.response?.data || new Error(`Failed to update template ${filename}`);
  }
};

/**
 * Uploads a media file to the backend.
 * @param {File} file - The file object to upload.
 * @param {function(progress: number): void} [onUploadProgress] - Optional callback for progress updates.
 * @returns {Promise<object>} - The response data containing the filePath.
 */
export const uploadFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  // 'mediaFile' must match the field name expected by multer on the backend
  formData.append('file', file); 

  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      }
    });
    return response.data; // Should contain { message: '...', filePath: 'uploads/...' }
  } catch (error) {
    console.error('Error uploading file:', error.response?.data || error.message);
    throw error.response?.data || new Error('File upload failed');
  }
};

// You can add other API functions here later (e.g., getTemplates)
