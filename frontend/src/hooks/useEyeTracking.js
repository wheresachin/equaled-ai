import { useEffect, useState } from 'react';

export const useEyeTracking = (enabled) => {
  const [calibrated, setCalibrated] = useState(false);

  useEffect(() => {
    if (enabled) {
      // Dynamically load WebGazer
      const script = document.createElement('script');
      script.src = 'https://webgazer.cs.brown.edu/webgazer.js'; // Or local copy
      script.async = true;
      script.onload = () => {
        initWebGazer();
      };
      document.body.appendChild(script);

      return () => {
        if (window.webgazer) {
          window.webgazer.end();
        }
        document.body.removeChild(script);
      };
    } else {
      if (window.webgazer) {
          try {
            window.webgazer.end();
            // Remove the gaze dot if it persists
            const dot = document.getElementById('webgazerGazeDot');
            if (dot) dot.remove();
          } catch(e) {
              console.error("Error stopping webgazer", e);
          }
      }
    }
  }, [enabled]);

  const initWebGazer = () => {
    if (window.webgazer) {
      window.webgazer.setGazeListener((data, elapsedTime) => {
        if (data == null) {
          return;
        }
        // Gaze data extraction
        // In a real app we'd smoothing and custom cursor logic here
        // For demo, webgazer's default red dot is sufficient visualization
      }).begin();
      
      // Turn off video preview by default to be less intrusive? 
      // User might want to see it for calibration.
      window.webgazer.showVideoPreview(true).showPredictionPoints(true);
      setCalibrated(true);
    }
  };

  return { calibrated };
};
