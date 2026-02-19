/**
 * VoiceAssistant.jsx
 *
 * Global voice control UI (Restored to classic version):
 *  - Glowing mic button (fixed bottom-center)
 *  - Floating Help and Language icons
 *  - Live transcript preview
 *  - Success / error toast feedback
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, Globe, HelpCircle, X } from 'lucide-react';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { useAccessibility } from '../context/AccessibilityContext';

// ── Feedback toast ─────────────────────────────────────────────────
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  const colors = {
    success: 'bg-green-600',
    error:   'bg-red-500',
    info:    'bg-blue-500',
  };
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-[999999]
        px-5 py-2 rounded-full text-white text-sm font-semibold shadow-lg
        transition-all duration-300 pointer-events-none
        ${colors[type] || 'bg-gray-700'}`}
    >
      {msg}
    </div>
  );
};

// ── Transcript bubble ──────────────────────────────────────────────
const Transcript = ({ text, interim }) => {
  if (!text) return null;
  return (
    <div
      aria-live="polite"
      className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-[999998]
        max-w-xs px-4 py-2 rounded-2xl text-sm shadow-xl
        ${interim
          ? 'bg-white/80 text-gray-500 border border-gray-200 backdrop-blur'
          : 'bg-white text-gray-800 border border-gray-300 backdrop-blur'}`}
    >
      🎤 {text}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
const VoiceAssistant = () => {
  const accessibility = useAccessibility();
  const { voiceEnabled, voiceLang, toggleVoice, setVoiceLang, isAwake, highContrast } = accessibility;

  const [listening, setListening]   = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim]       = useState(false);
  const [feedback, setFeedback]     = useState({ msg: '', type: 'success' });
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showHelp, setShowHelp]     = useState(false);

  // ── Drag Logic State ──────────────────────────────────────────────
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('voice_assistant_pos');
    return saved ? JSON.parse(saved) : { x: window.innerWidth * 0.23, y: window.innerHeight - 80 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart]   = useState({ x: 0, y: 0 });
  const [moved, setMoved]           = useState(false);

  // Clear transcript after 5s
  useEffect(() => {
    if (!transcript) return;
    const t = setTimeout(() => setTranscript(''), 5000);
    return () => clearTimeout(t);
  }, [transcript]);

  // Clear feedback after 3s
  useEffect(() => {
    if (!feedback.msg) return;
    const t = setTimeout(() => setFeedback({ msg: '', type: 'success' }), 3000);
    return () => clearTimeout(t);
  }, [feedback]);

  const handleTranscript = useCallback((text, isInterim) => {
    setTranscript(text);
    setInterim(isInterim);
  }, []);

  const handleFeedback = useCallback((msg, type) => {
    setFeedback({ msg, type });
    setTranscript('');
  }, []);

  const handleListening = useCallback((val) => {
    setListening(val);
    if (!val) setTranscript('');
  }, []);

  // Handle external voice-disable event
  useEffect(() => {
    const handler = () => { if (voiceEnabled) toggleVoice(); };
    window.addEventListener('equaled:voice-disable', handler);
    return () => window.removeEventListener('equaled:voice-disable', handler);
  }, [voiceEnabled, toggleVoice]);

  // ── Pointer Drag Handlers ─────────────────────────────────────────
  const onPointerDown = (e) => {
    setIsDragging(true);
    setMoved(false);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    // Capture pointer to continue receiving events even if moved outside element
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Movement threshold to differentiate click vs drag
    if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
      setMoved(true);
    }

    // Boundary checks
    const boundedX = Math.max(32, Math.min(window.innerWidth - 32, newX));
    const boundedY = Math.max(32, Math.min(window.innerHeight - 32, newY));

    setPosition({ x: boundedX, y: boundedY });
  };

  const onPointerUp = (e) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    localStorage.setItem('voice_assistant_pos', JSON.stringify(position));
  };

  const handleToggle = (e) => {
    // Only toggle if we didn't move significantly (it's a click, not a drag)
    if (!moved) {
      toggleVoice(e);
    }
  };

  const { supported, permDenied } = useVoiceControl({
    enabled:      voiceEnabled,
    lang:         voiceLang,
    accessibility,
    onTranscript: handleTranscript,
    onFeedback:   handleFeedback,
    onListening:  handleListening,
  });

  if (!supported) return null;

  const langs = [
    { code: 'en-US', label: 'English' },
    { code: 'hi-IN', label: 'Auto (HI/EN)' },
  ];

  return (
    <>
      {/* Feedback Toast */}
      {feedback.msg && isAwake && !transcript && <Toast msg={feedback.msg} type={feedback.type} />}

      {/* Transcript Preview */}
      {transcript && isAwake && <Transcript text={transcript} interim={interim} />}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">🎙️ Voice Commands</h3>
              <button onClick={() => setShowHelp(false)} className="p-1 hover:bg-gray-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4 text-sm">
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 mb-2">
                <p className="font-bold text-indigo-700 underline">Wake Word:</p>
                <p className="text-indigo-900 mt-1">Say "वॉइस कमांड ऑन" (Voice command on)</p>
              </div>
              <div>
                <h4 className="font-semibold text-indigo-600 mb-1">Navigation</h4>
                <ul className="list-disc pl-4 space-y-1 text-gray-700">
                  <li>"Go to Dashboard" / "डैशबोर्ड खोलो"</li>
                  <li>"Go Home" / "घर जाओ"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-indigo-600 mb-1">Accessibility</h4>
                <ul className="list-disc pl-4 space-y-1 text-gray-700">
                  <li>"Enable Visual Mode" / "विजुअल मोड ऑन"</li>
                  <li>"Reset Settings" / "सेटिंग्स रिसेट करो"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mic button group - Draggable Container */}
      <div 
        className={`fixed z-[999998] flex flex-col items-center gap-2 transition-transform duration-75 ${isDragging ? 'scale-105 opacity-90 cursor-grabbing' : 'cursor-grab'}`}
        style={{ 
          left: position.x, 
          top: position.y,
          transform: 'translate(-50%, -50%)',
          touchAction: 'none' // Prevent scrolling while dragging
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        
        {/* Language Switcher Overlay */}
        {showLangMenu && (
          <div className="absolute bottom-24 bg-white/95 backdrop-blur border border-gray-100 p-2 rounded-2xl shadow-2xl flex flex-col gap-1 w-32 animate-in slide-in-from-bottom-2 fade-in">
            {langs.map(l => (
              <button
                key={l.code}
                onClick={(e) => { e.stopPropagation(); setVoiceLang(l.code); setShowLangMenu(false); }}
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking menu
                className={`text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  voiceLang === l.code ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}

        {/* Top Controls (Help & Globe) */}
        {!isAwake && !listening && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowHelp(true); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-full bg-white/90 border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50 flex items-center justify-center transition-colors"
            >
              <HelpCircle size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowLangMenu(m => !m); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 border border-gray-200 text-gray-600 text-[10px] font-bold shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Globe size={14} />
              {langs.find(l => l.code === voiceLang)?.label.split(' ')[0] || 'EN'}
            </button>
          </div>
        )}

        {/* Main Mic Button */}
        <button
          onClick={handleToggle}
          onPointerDown={(e) => e.stopPropagation()} // Let the container handle drag, but don't prevent button click logic
          disabled={permDenied}
          className={`
            relative w-16 h-16 rounded-full flex items-center justify-center
            text-white shadow-2xl transition-all duration-300
            ${isAwake
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 scale-110'
              : 'bg-white/80 text-gray-400 border border-gray-200 backdrop-blur-sm'}
            ${highContrast ? 'high-contrast:bg-yellow-400 high-contrast:text-black' : ''}
          `}
        >
          {listening && (
            <>
              <span className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isAwake ? 'bg-indigo-400' : 'bg-blue-300'}`} />
              <span className={`absolute inset-[-4px] rounded-full border-2 animate-pulse opacity-40 ${isAwake ? 'border-indigo-400' : 'border-blue-300'}`} />
            </>
          )}

          {isAwake ? (
            <Mic size={32} className="animate-pulse" />
          ) : (
            <Mic size={28} className={listening ? 'text-blue-500' : 'text-indigo-300 opacity-70'} />
          )}
        </button>

        {/* Small Status Pill */}
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm
          ${ permDenied  ? 'bg-red-50 text-red-500 border-red-100' :
             isAwake     ? 'bg-indigo-600 text-white border-indigo-500' :
             listening   ? 'bg-blue-50 text-blue-500 border-blue-100' :
                           'bg-white text-gray-400 border-gray-100'}`}
        >
          {permDenied   ? '🚫 No Mic' :
           isAwake      ? 'Active' :
           listening    ? 'Listening...' :
           voiceEnabled ? 'Ready' :
                          'Off'}
        </span>
      </div>
    </>
  );
};

export default VoiceAssistant;
