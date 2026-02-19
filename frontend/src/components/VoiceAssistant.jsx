/**
 * VoiceAssistant.jsx
 *
 * Global voice control UI:
 *  - Glowing mic button (fixed bottom-center)
 *  - Live transcript preview
 *  - Success / error toast feedback
 *  - Language switcher (EN / HI)
 *  - Fully accessible (ARIA, keyboard)
 *  - High-contrast compatible
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
  const { voiceEnabled, voiceLang, toggleVoice, setVoiceLang, isAwake } = accessibility;

  const [listening, setListening]   = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim]       = useState(false);
  const [feedback, setFeedback]     = useState({ msg: '', type: 'success' });
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showHelp, setShowHelp]     = useState(false);

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

  // Handle external voice-disable event (from STOP_LISTENING intent)
  useEffect(() => {
    const handler = () => { if (voiceEnabled) toggleVoice(); };
    window.addEventListener('equaled:voice-disable', handler);
    return () => window.removeEventListener('equaled:voice-disable', handler);
  }, [voiceEnabled, toggleVoice]);

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

      {/* Help Overlay - Only show if not awake or explicitly requested */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-hidden flex flex-col animate-fadeIn">
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
              {/* ... existing categories ... */}
            </div>
          </div>
        </div>
      )}

      {/* Mic button group */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999998] flex flex-col items-center gap-2">
        
        {/* Top Controls - Hide when awake for clean UI */}
        {!isAwake && !listening && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={() => setShowHelp(true)}
              className="w-8 h-8 rounded-full bg-white/90 border border-gray-200 text-gray-600 shadow hover:bg-gray-50 transition-colors backdrop-blur flex items-center justify-center"
            >
              <HelpCircle size={16} />
            </button>
            <button
              onClick={() => setShowLangMenu(m => !m)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 border border-gray-200 text-gray-600 text-xs font-medium shadow hover:bg-gray-50 transition-colors backdrop-blur"
            >
              <Globe size={14} />
              {langs.find(l => l.code === voiceLang)?.label || 'EN'}
            </button>
          </div>
        )}

        <button
          aria-label={isAwake ? 'Voice active' : 'Listening for wake word'}
          onClick={toggleVoice}
          disabled={permDenied}
          className={`
            relative w-16 h-16 rounded-full flex items-center justify-center
            text-white font-bold shadow-2xl transition-all duration-300
            ${isAwake
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 scale-110'
              : 'bg-white/80 text-gray-400 border border-gray-200 backdrop-blur-sm'}
            high-contrast:bg-yellow-400 high-contrast:text-black
          `}
        >
          {/* Pulsing rings when actively listening */}
          {listening && (
            <>
              <span className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isAwake ? 'bg-indigo-400' : 'bg-blue-300'}`} />
              <span className={`absolute inset-[-4px] rounded-full border-2 animate-pulse opacity-40 ${isAwake ? 'border-indigo-400' : 'border-blue-300'}`} />
            </>
          )}

          {isAwake ? (
            <Mic size={32} className="animate-pulse text-white transition-all" />
          ) : (
            <Mic size={28} className={`transition-all ${listening ? 'text-blue-500' : 'text-indigo-300 opacity-70'}`} />
          )}
        </button>

        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm
          ${ permDenied  ? 'bg-red-100 text-red-500 border border-red-200' :
             isAwake     ? 'bg-indigo-600 text-white border border-indigo-500' :
             listening   ? 'bg-blue-50 text-blue-500 border border-blue-200' :
                           'bg-white text-gray-400 border border-gray-100'}`}
        >
          {permDenied   ? '🚫 Disabled' :
           isAwake      ? <><Mic size={10} className="animate-pulse" /> Active</> :
           listening    ? <><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Listening...</> :
           voiceEnabled ? <><MicOff size={10} /> Ready</> :
                          'Off'}
        </span>
        {/* Permission error hint */}
        {permDenied && (
          <p className="text-xs text-red-500 text-center max-w-[200px]">
            Mic permission denied. Allow in browser settings.
          </p>
        )}
      </div>
    </>
  );
};

export default VoiceAssistant;
