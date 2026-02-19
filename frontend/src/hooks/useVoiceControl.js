/**
 * useVoiceControl.js
 *
 * Web Speech API hook with ultimate stability:
 *  - Uses refs for ALL props and callbacks to prevent unnecessary restarts.
 *  - Seamless, low-delay restart for non-flickering continuous listening.
 *  - Comprehensive console logging for field debugging.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { processCommand, getFeedback, INTENTS } from '../services/commandProcessor';
import { speak } from '../services/textToSpeech';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const SEAMLESS_RESTART_DELAY = 50;  // Minimal flicker
const COMMAND_COOLDOWN       = 400; // Reduced for snappy response

export const useVoiceControl = ({
  enabled,
  lang = 'hi-IN',
  accessibility,
  onTranscript,
  onFeedback,
  onListening,
}) => {
  const { isAwake, setIsAwake } = accessibility;
  const [supported] = useState(() => !!SpeechRecognition);
  const [permDenied, setPermDenied]   = useState(false);
  
  const recognitionRef = useRef(null);
  const restartTimer   = useRef(null);
  const isRunning      = useRef(false);
  const shouldBeRunning = useRef(enabled);
  const lastCommandAt  = useRef(0);
  const navigate       = useNavigate();

  // ── Stable Refs (Critical for prevent rerender loops) ──────────────
  const isAwakeRef = useRef(isAwake);
  useEffect(() => { isAwakeRef.current = isAwake; }, [isAwake]);

  const accRef = useRef(accessibility);
  useEffect(() => { accRef.current = accessibility; }, [accessibility]);

  const langRef = useRef(lang);
  useEffect(() => { langRef.current = lang; }, [lang]);

  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);

  const onFeedbackRef = useRef(onFeedback);
  useEffect(() => { onFeedbackRef.current = onFeedback; }, [onFeedback]);

  const onListeningRef = useRef(onListening);
  useEffect(() => { onListeningRef.current = onListening; }, [onListening]);

  useEffect(() => { shouldBeRunning.current = enabled; }, [enabled]);

  const executeIntent = useCallback((intent, rawLang) => {
    const feedbackLang = rawLang?.startsWith('hi') ? 'hi' : 'en';
    const acc = accRef.current;
    
    if (!isAwakeRef.current && intent !== INTENTS.ENABLE_VOICE) return;

    const msg = getFeedback(intent, feedbackLang);
    console.log('[Voice] Intent matched:', intent, '| Feedback:', msg);

    switch (intent) {
      case INTENTS.ENABLE_VOICE:
        if (!isAwakeRef.current) {
          setIsAwake(true);
          speak(msg, feedbackLang === 'hi' ? 'hi-IN' : 'en-US');
          onFeedbackRef.current?.(msg, 'success');
        }
        return;
      case INTENTS.STOP_LISTENING:
        setIsAwake(false);
        speak(msg, feedbackLang === 'hi' ? 'hi-IN' : 'en-US');
        onFeedbackRef.current?.(msg, 'info');
        return;

      // ── Navigation ──
      case INTENTS.NAVIGATE_HOME: navigate('/'); break;
      case INTENTS.NAVIGATE_DASHBOARD: navigate('/dashboard'); break;
      case INTENTS.NAVIGATE_LESSONS: navigate('/dashboard'); break;
      case INTENTS.NAVIGATE_BACK: window.history.back(); break;

      // ── Font ──
      case INTENTS.INCREASE_FONT: acc.increaseFont?.(); break;
      case INTENTS.DECREASE_FONT: acc.decreaseFont?.(); break;

      // ── High Contrast ──
      case INTENTS.ENABLE_CONTRAST:  if (!acc.highContrast)  acc.toggleContrast?.(); break;
      case INTENTS.DISABLE_CONTRAST: if (acc.highContrast)   acc.toggleContrast?.(); break;

      // ── Captions ──
      case INTENTS.ENABLE_CAPTIONS:  if (!acc.captionsEnabled) acc.toggleCaptions?.(); break;
      case INTENTS.DISABLE_CAPTIONS: if (acc.captionsEnabled)  acc.toggleCaptions?.(); break;

      // ── Focus Mode ──
      case INTENTS.ENABLE_FOCUS:  if (!acc.focusMode) acc.toggleFocusMode?.(); break;
      case INTENTS.DISABLE_FOCUS: if (acc.focusMode)  acc.toggleFocusMode?.(); break;

      // ── Eye Tracker ──
      case INTENTS.ENABLE_EYE_TRACKER:
        if (!acc.eyeTrackingEnabled) {
          if (acc.handTrackingEnabled) acc.toggleHandTracking?.();
          acc.toggleEyeTracking?.();
        }
        break;
      case INTENTS.DISABLE_EYE_TRACKER:
        if (acc.eyeTrackingEnabled) acc.toggleEyeTracking?.();
        break;

      // ── Hand Tracker ──
      case INTENTS.ENABLE_HAND_TRACKER:
        if (!acc.handTrackingEnabled) {
          if (acc.eyeTrackingEnabled) acc.toggleEyeTracking?.();
          acc.toggleHandTracking?.();
        }
        break;
      case INTENTS.DISABLE_HAND_TRACKER:
        if (acc.handTrackingEnabled) acc.toggleHandTracking?.();
        break;

      // ── Scroll ──
      case INTENTS.SCROLL_UP:   window.scrollBy({ top: -400, behavior: 'smooth' }); break;
      case INTENTS.SCROLL_DOWN: window.scrollBy({ top: 400,  behavior: 'smooth' }); break;

      default: break;
    }
    onFeedbackRef.current?.(msg, 'success');
    speak(msg, feedbackLang === 'hi' ? 'hi-IN' : 'en-US');
  }, [navigate, setIsAwake]);

  const executeIntentRef = useRef(executeIntent);
  useEffect(() => { executeIntentRef.current = executeIntent; }, [executeIntent]);

  // ── Start logic ──────────────────────────────────────────────────
  const startRecognition = useCallback(() => {
    if (!supported || permDenied || isRunning.current || !shouldBeRunning.current) {
      return;
    }

    console.log('[Voice] Initializing new session...');
    const rec = new SpeechRecognition();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = langRef.current;

    rec.onstart = () => {
      console.log('[Voice] Mic Listening...');
      isRunning.current = true;
      onListeningRef.current?.(true);
    };

    rec.onend = () => {
      console.log('[Voice] Session ended.');
      isRunning.current = false;
      onListeningRef.current?.(false);
      
      if (shouldBeRunning.current && !permDenied) {
        clearTimeout(restartTimer.current);
        restartTimer.current = setTimeout(() => {
          // Check TTS speaking to avoid feedback loop
          if (shouldBeRunning.current && !isRunning.current && !window.speechSynthesis.speaking) {
            startRecognition();
          } else if (window.speechSynthesis.speaking) {
            // Polling for TTS end
            const poll = setInterval(() => {
              if (!window.speechSynthesis.speaking) {
                clearInterval(poll);
                startRecognition();
              }
            }, 500);
          }
        }, SEAMLESS_RESTART_DELAY);
      }
    };

    rec.onerror = (e) => {
      console.warn('[Voice] Error:', e.error);
      if (e.error === 'not-allowed') {
        setPermDenied(true);
        shouldBeRunning.current = false;
        onFeedbackRef.current?.('Mic permission denied', 'error');
      }
    };

    rec.onresult = (event) => {
      const results = Array.from(event.results);
      const latest  = results[results.length - 1];
      const text    = latest[0].transcript;
      const isInterim = !latest.isFinal;
      
      onTranscriptRef.current?.(text, isInterim);

      const now = Date.now();
      if (now - lastCommandAt.current < COMMAND_COOLDOWN) return;

      // For interim, only try to match the wake-word for instant response
      if (isInterim) {
        const intent = processCommand(text);
        if (intent === INTENTS.ENABLE_VOICE && !isAwakeRef.current) {
          lastCommandAt.current = now;
          executeIntentRef.current?.(intent, langRef.current);
        }
        return;
      }

      console.log('[Voice] Final Speech:', text);

      let intent = null;
      for (let i = 0; i < latest.length; i++) {
        intent = processCommand(latest[i].transcript);
        if (intent) break;
      }

      if (intent) {
        lastCommandAt.current = now;
        executeIntentRef.current?.(intent, langRef.current);
      } else if (isAwakeRef.current) {
        const msg = getFeedback(null, langRef.current.startsWith('hi') ? 'hi' : 'en');
        onFeedbackRef.current?.(msg, 'error');
        speak(msg, langRef.current.startsWith('hi') ? 'hi-IN' : 'en-US');
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.error('[Voice] Fast recovery start error:', e);
      isRunning.current = false;
    }
  }, [supported, permDenied]);

  const stopRecognition = useCallback(() => {
    console.log('[Voice] Stopping...');
    shouldBeRunning.current = false;
    clearTimeout(restartTimer.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort(); 
      } catch (e) {}
      recognitionRef.current = null;
    }
    isRunning.current = false;
    onListeningRef.current?.(false);
  }, []);

  // ── Lifecycle ──
  useEffect(() => {
    if (enabled && supported && !permDenied) {
      startRecognition();
    } else {
      stopRecognition();
    }
    return () => stopRecognition();
  }, [enabled, supported, permDenied, startRecognition, stopRecognition]);

  return { supported, permDenied };
};
