import React, { createContext, useContext, useState, useEffect } from "react";

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [disabilityType, setDisabilityType] = useState("none"); // 'visual', 'hearing', 'motor', 'cognitive', 'none'
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16); // Base font size
  const [focusMode, setFocusMode] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [eyeTrackingEnabled, setEyeTrackingEnabled] = useState(false);
  const [eyeTrackingStatus, setEyeTrackingStatus] = useState('idle');
  const [handTrackingEnabled, setHandTrackingEnabled] = useState(false);
  const [handTrackingStatus, setHandTrackingStatus] = useState('idle');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceLang, setVoiceLang] = useState('hi-IN'); // Smart default: handles Hindi & English
  const [isAwake, setIsAwake] = useState(false); // Passive listening by default

  // Apply disability defaults when type changes
  useEffect(() => {
    switch (disabilityType) {
      case "visual":
        setHighContrast(true);
        setFontSize(24);
        setCaptionsEnabled(false);
        setFocusMode(false);
        break;
      case "hearing":
        setCaptionsEnabled(true);
        setHighContrast(false);
        setFontSize(16);
        setFocusMode(false);
        break;
      case "motor":
        // Simplified implementation for motor: larger buttons (handled in UI via context)
        setFontSize(20);
        setHighContrast(false);
        setCaptionsEnabled(false);
        setFocusMode(false);
        break;
      case "cognitive":
        setFocusMode(true);
        setHighContrast(false);
        setFontSize(18);
        setCaptionsEnabled(false);
        break;
      default:
        // Reset to defaults or keep user preferences? Resetting for demo simplicity.
        setHighContrast(false);
        setFontSize(16);
        setFocusMode(false);
        setCaptionsEnabled(false);
        break;
    }
  }, [disabilityType]);

  // Apply styles to document root for global changes
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [fontSize, highContrast]);

  const increaseFont = () => setFontSize((prev) => Math.min(prev + 2, 32));
  const decreaseFont = () => setFontSize((prev) => Math.max(prev - 2, 12));
  const toggleContrast = () => setHighContrast((prev) => !prev);
  const toggleFocusMode = () => setFocusMode((prev) => !prev);
  const toggleCaptions = () => setCaptionsEnabled((prev) => !prev);
  const toggleEyeTracking = () => setEyeTrackingEnabled((prev) => !prev);
  const toggleHandTracking = () => setHandTrackingEnabled((prev) => !prev);
  const toggleVoice = () => setVoiceEnabled((prev) => !prev);

  return (
    <AccessibilityContext.Provider
      value={{
        disabilityType,
        setDisabilityType,
        highContrast,
        toggleContrast,
        fontSize,
        increaseFont,
        decreaseFont,
        focusMode,
        toggleFocusMode,
        captionsEnabled,
        toggleCaptions,
        eyeTrackingEnabled,
        toggleEyeTracking,
        eyeTrackingStatus,
        setEyeTrackingStatus,
        handTrackingEnabled,
        toggleHandTracking,
        handTrackingStatus,

        setHandTrackingStatus,
        voiceEnabled,
        toggleVoice,
        voiceLang,
        setVoiceLang,
        isAwake,
        setIsAwake,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
