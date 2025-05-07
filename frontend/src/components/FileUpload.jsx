
import React, { useState } from "react";

const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState("");

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch("http://localhost:5000/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        setUploadedUrl(data.url);
    };

    return (
        <div className="file-upload-container">
            <h2 style = {{fontSize: '18px'}}>Upload File</h2>
            <input type="file" name = "file"onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!selectedFile}>Upload</button>

            {uploadedUrl && (
                <div className="uploaded-url">
                    <p>Uploaded File URL:</p>
                    <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
                        {uploadedUrl}
                    </a>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
