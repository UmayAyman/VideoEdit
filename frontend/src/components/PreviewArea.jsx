import React, { useEffect, useRef, useState } from 'react';

function PreviewArea({ selectedScene, selectedIndex }) {

  const previewStyle = {
    border: '1px solid #adb5bd',
    padding: '20px',
    borderRadius: '5px',
    backgroundColor: '#f8f9fa',
    minHeight: '400px', 
    position: 'sticky', // Make it stick when scrolling the list
    top: '20px' // Adjust as needed
  };

  const mediaContainerStyle = {
    marginTop: '15px',
    marginBottom: '15px',
    maxWidth: '100%', 
    backgroundColor: '#ddd',
    position: 'relative', // Needed for absolute positioning of text
    overflow: 'hidden' // Hide text overflow for now
  };

  const mediaStyle = {
    display: 'block',
    maxWidth: '100%',     // Ensure media fits width
    maxHeight: '300px',   // Limit height
    margin: '0 auto'      // Center if smaller than container
  };

  // Ref to get media dimensions (though using it for scaling is complex)
  const mediaRef = useRef(null);
  // State to potentially hold dimensions if needed later
  // const [mediaDims, setMediaDims] = useState({ width: 0, height: 0 });

  // // Example effect to get dimensions (often tricky with load timing)
  // useEffect(() => {
  //   if (mediaRef.current) {
  //     // Use ResizeObserver or load events for reliable dimensions
  //     setMediaDims({ width: mediaRef.current.offsetWidth, height: mediaRef.current.offsetHeight });
  //   }
  // }, [selectedScene]); // Re-check when scene changes

  const [currentTime, setCurrentTime] = useState(0); // State for video time

  // Effect to handle video time updates
  useEffect(() => {
    const videoElement = mediaRef.current;
    let intervalId = null;

    // Only attach listeners if it's a video element
    if (selectedScene?.type === 'video' && videoElement) {
      const handleTimeUpdate = () => {
        setCurrentTime(videoElement.currentTime);
      };

      // Attach listener
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      // Sometimes timeupdate doesn't fire frequently enough for UI changes,
      // especially when paused/scrubbing. A fallback interval can help.
      // (Use with caution, can impact performance)
      // intervalId = setInterval(() => {
      //   if (videoElement.paused) { // Only update if paused via interval
      //     handleTimeUpdate(); 
      //   }
      // }, 250); // Check every 250ms

      // Reset time when scene changes
      setCurrentTime(0);

      // Cleanup function
      return () => {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        if (intervalId) clearInterval(intervalId);
      };
    } else {
        // Reset time if not a video or no scene selected
        setCurrentTime(0);
    }

  }, [selectedScene]); // Re-run effect if selectedScene changes

  if (!selectedScene) {
    return (
      <div className="preview-container">
        <h3>Preview Area</h3>
        <p className="placeholder-text">Select a scene from the list to see details.</p>
      </div>
    );
  }

  // Determine media element based on type
  let mediaElement = null;
  if (selectedScene.type === 'image') {
    // Reset time if switching from video to image
    if (currentTime !== 0) setCurrentTime(0);
    mediaElement = <img ref={mediaRef} src={`/${selectedScene.path}`} alt={`Scene ${selectedIndex + 1}`} className="preview-media" onError={(e) => e.target.style.display='none'} />;
  } else if (selectedScene.type === 'video') {
    mediaElement = <video ref={mediaRef} src={`/${selectedScene.path}`} controls className="preview-media" onError={(e) => e.target.style.display='none'}>Your browser does not support the video tag.</video>;
  }

  return (
    <div className="preview-container">
      <h3>Preview: Scene {selectedIndex !== null ? selectedIndex + 1 : ''}</h3> 
      
      <div className="preview-media-container">
        {mediaElement || <p className="placeholder-text">(No preview available for type: {selectedScene.type})</p>}
        {!mediaElement && selectedScene.path && <p style={{textAlign: 'center', fontSize: '0.8em'}}>Attempted path: {`/${selectedScene.path}`}</p>}

        {/* Render Text Overlays - Filtered by time for videos */}
        {mediaElement && selectedScene.text && selectedScene.text
          .filter(textItem => 
              selectedScene.type !== 'video' || // Always show for images
              (currentTime >= (textItem.start || 0) && currentTime < (textItem.end || Infinity)) // Show if within time range for video
          )
          .map((textItem, index) => {
            // Basic styling for the text overlay
            const textStyle = {
                position: 'absolute',
                left: `${textItem.xPosition || 0}px`, // Use direct pixel values for now
                top: `${textItem.yPosition || 0}px`,
                color: textItem.color || '#FFFFFF',
                fontSize: `${textItem.fontSize || 20}px`,
                backgroundColor: textItem.boxColor ? `${textItem.boxColor}${Math.round((textItem.boxOpacity || 0) * 255).toString(16).padStart(2, '0')}` : 'transparent', // Crude RGBA conversion
                padding: `${textItem.boxPadding || 0}px`,
                border: textItem.boxColor ? '1px solid rgba(255,255,255,0.3)' : 'none', // Optional border
                whiteSpace: 'pre-wrap', // Allow wrapping
            };

            // Using a simple class, specific styles still inline for now
            return (
                <div key={`text-${index}`} className="preview-text-overlay" style={textStyle}>
                    {textItem.content}
                </div>
            );
        })}
      </div>
      
      <div className="scene-details">
        <p><strong>Type:</strong> {selectedScene.type}</p>
        <p><strong>Path:</strong> {selectedScene.path}</p>
        <p><strong>Duration:</strong> {selectedScene.duration}s</p>
        <p><strong>Transition:</strong> {selectedScene.transition || 'N/A'}</p>
        <p><strong>Filter:</strong> {selectedScene.effect?.type || 'None'}</p>
        <p><strong>Text Overlays:</strong> {selectedScene.text?.length || 0}</p>
      </div>
      
      <h5 style={{marginTop: '20px'}}>Raw Data:</h5>
      <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#e9ecef', padding: '10px', maxHeight: '200px', overflowY: 'auto'}}>
        <code>{JSON.stringify(selectedScene, null, 2)}</code>
      </pre>
    </div>
  );
}

export default PreviewArea; 