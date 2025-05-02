import React, { useState } from 'react';
import { toast } from 'react-toastify';

function JsonPreviewModal({ isOpen, onClose, jsonData, title = "JSON Preview" }) {
  const [copyButtonText, setCopyButtonText] = useState('Copy JSON');

  if (!isOpen) {
    return null;
  }

  const handleCopyJson = async () => {
    if (!jsonData) {
      toast.error('No JSON data to copy.');
      return;
    }
    try {
      await navigator.clipboard.writeText(jsonData);
      setCopyButtonText('Copied!');
      toast.success('JSON copied to clipboard!');
      setTimeout(() => setCopyButtonText('Copy JSON'), 2000); // Reset button text after 2s
    } catch (err) {
      console.error('Failed to copy JSON:', err);
      toast.error('Failed to copy JSON to clipboard.');
      setCopyButtonText('Copy Failed');
      setTimeout(() => setCopyButtonText('Copy JSON'), 2000);
    }
  };

  return (
    <div className="json-modal-overlay" onClick={onClose}>
      <div className="json-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="json-modal-header">
          <h2>{title}</h2>
          <button className="json-modal-close-button" onClick={onClose} title="Close">X</button>
        </div>
        <div className="json-modal-body">
          <pre className="json-modal-pre">
            {jsonData || 'No data available.'}
          </pre>
        </div>
        <div className="json-modal-footer">
          <button onClick={handleCopyJson} className="button button-primary">
            {copyButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JsonPreviewModal; 