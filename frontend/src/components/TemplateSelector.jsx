import React from 'react';

// Using classes defined in App.css for consistency for now

function TemplateSelector({ templateList, onSelectTemplate, currentTemplate }) {
  
  const handleSelectChange = (event) => {
    const selectedFilename = event.target.value;
    if (selectedFilename) {
        onSelectTemplate(selectedFilename);
    } else {
        // Handle case where "Select Template" is chosen (optional: clear state?)
        console.log('Placeholder selected');
    }
  };

  return (
    <div className="input-group" style={{marginBottom: '20px'}}> {/* Add extra bottom margin */}
      <label htmlFor="templateSelect" style={{width: 'auto'}}>Load Template:</label>
      <select 
        id="templateSelect" 
        value={currentTemplate || ''} // Control the selected value
        onChange={handleSelectChange}
        style={{minWidth: '250px'}} /* Keep specific min-width */
      >
        <option value="">-- Select Template --</option>
        {templateList && templateList.length > 0 ? (
          templateList.map(filename => (
            <option key={filename} value={filename}>
              {filename}
            </option>
          ))
        ) : (
          <option value="" disabled>No templates found</option>
        )}
      </select>
    </div>
  );
}

export default TemplateSelector; 