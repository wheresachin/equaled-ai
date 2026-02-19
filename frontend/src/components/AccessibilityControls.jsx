import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Type, Moon, Eye, Ear, Activity, Brain } from 'lucide-react';

const AccessibilityControls = () => {
  const {
    disabilityType, setDisabilityType,
    highContrast, toggleContrast,
    fontSize, increaseFont, decreaseFont,
    focusMode, toggleFocusMode,
    captionsEnabled, toggleCaptions,
    eyeTrackingEnabled, toggleEyeTracking
  } = useAccessibility();

  return (
    <div className="fixed right-4 top-24 z-50 flex flex-col gap-2 p-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 w-16 items-center transition-all hover:w-64 hover:items-stretch group overflow-hidden high-contrast:bg-black high-contrast:border-yellow-400">
      
      {/* Collapsed Icon */}
      <button className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 high-contrast:bg-yellow-400 high-contrast:text-black">
        <Activity size={24} />
      </button>

      {/* Expanded Controls */}
      <div className="hidden group-hover:flex flex-col gap-4 p-2 w-full animate-in fade-in slide-in-from-right-10 duration-200">
        
        {/* Mode Selection */}
        <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase high-contrast:text-yellow-400">Assistive Mode</h3>
            <div className="grid grid-cols-2 gap-2">
                {[
                    { id: 'visual', icon: Eye, label: 'Visual' },
                    { id: 'hearing', icon: Ear, label: 'Hearing' },
                    { id: 'motor', icon: Activity, label: 'Motor' },
                    { id: 'cognitive', icon: Brain, label: 'Cognitive' }
                ].map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => setDisabilityType(disabilityType === id ? 'none' : id)}
                        className={`flex flex-col items-center p-2 rounded-lg text-xs transition-colors ${
                            disabilityType === id 
                            ? 'bg-blue-600 text-white high-contrast:bg-yellow-400 high-contrast:text-black' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 high-contrast:bg-gray-800 high-contrast:text-white'
                        }`}
                    >
                        <Icon size={16} className="mb-1" />
                        {label}
                    </button>
                ))}
            </div>
        </div>

        <div className="border-t border-gray-200 my-1 high-contrast:border-gray-700" />

        {/* Font Size */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium high-contrast:text-white">Text Size</span>
          <div className="flex bg-gray-100 rounded-lg p-1 high-contrast:bg-gray-800">
            <button onClick={decreaseFont} className="p-2 hover:bg-white rounded-md transition-colors high-contrast:text-white high-contrast:hover:bg-gray-700" aria-label="Decrease Font">
              <Type size={14} />
            </button>
            <span className="px-2 py-1 text-sm font-mono high-contrast:text-white">{fontSize}</span>
            <button onClick={increaseFont} className="p-2 hover:bg-white rounded-md transition-colors high-contrast:text-white high-contrast:hover:bg-gray-700" aria-label="Increase Font">
              <Type size={20} />
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          <button 
            onClick={toggleContrast}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                highContrast ? 'bg-black text-yellow-400 border border-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span>High Contrast</span>
            <Moon size={16} />
          </button>

          <button 
            onClick={toggleFocusMode}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                focusMode ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span>Focus Mode</span>
            <Brain size={16} />
          </button>
          
          <button 
            onClick={toggleCaptions}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                captionsEnabled ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span>Captions</span>
            <Ear size={16} />
          </button>
          
           <button 
            onClick={toggleEyeTracking}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                eyeTrackingEnabled ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span>Eye Tracker</span>
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityControls;
