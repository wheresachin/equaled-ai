import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { processCommand, getFeedback, INTENTS } from '../services/commandProcessor';
import { speak } from '../services/textToSpeech';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const SEAMLESS_RESTART_DELAY = 50;  
const COMMAND_COOLDOWN = 1500; 

export const useVoiceControl = ({
  enabled,
  lang = 'hi-IN',
  accessibility,
  onTranscript,
  onFeedback,
  onListening,
}) => {
  const { isAwake, setIsAwake } = accessibility;
  const { user } = useAuth();
  const [supported] = useState(() => !!SpeechRecognition);
  const [permDenied, setPermDenied] = useState(false);

  const recognitionRef = useRef(null);
  const restartTimer = useRef(null);
  const isRunning = useRef(false);
  const shouldBeRunning = useRef(enabled);
  const lastCommandAt = useRef(0);
  const navigate = useNavigate();
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  
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

      
      
      case INTENTS.NAVIGATE_HOME: navigate(userRef.current ? '/home' : '/'); break;
      case INTENTS.NAVIGATE_DASHBOARD: navigate('/dashboard'); break;
      case INTENTS.NAVIGATE_LESSONS: navigate('/lesson/1'); break;
      case INTENTS.NAVIGATE_LOGIN: navigate('/login'); break;
      case INTENTS.NAVIGATE_TALK_TO_AI: navigate('/talk-to-ai'); break;
      case INTENTS.NAVIGATE_BACK: window.history.back(); break;

      
      case INTENTS.INCREASE_FONT: acc.increaseFont?.(); break;
      case INTENTS.DECREASE_FONT: acc.decreaseFont?.(); break;

      
      case INTENTS.ENABLE_CONTRAST: if (!acc.highContrast) acc.toggleContrast?.(); break;
      case INTENTS.DISABLE_CONTRAST: if (acc.highContrast) acc.toggleContrast?.(); break;

      
      case INTENTS.ENABLE_CAPTIONS: if (!acc.captionsEnabled) acc.toggleCaptions?.(); break;
      case INTENTS.DISABLE_CAPTIONS: if (acc.captionsEnabled) acc.toggleCaptions?.(); break;

      
      case INTENTS.ENABLE_FOCUS: if (!acc.focusMode) acc.toggleFocusMode?.(); break;
      case INTENTS.DISABLE_FOCUS: if (acc.focusMode) acc.toggleFocusMode?.(); break;

      
      case INTENTS.ENABLE_EYE_TRACKER:
        if (!acc.eyeTrackingEnabled) {
          if (acc.handTrackingEnabled) acc.toggleHandTracking?.();
          acc.toggleEyeTracking?.();
        }
        break;
      case INTENTS.DISABLE_EYE_TRACKER:
        if (acc.eyeTrackingEnabled) acc.toggleEyeTracking?.();
        break;

      
      case INTENTS.ENABLE_HAND_TRACKER:
        if (!acc.handTrackingEnabled) {
          if (acc.eyeTrackingEnabled) acc.toggleEyeTracking?.();
          acc.toggleHandTracking?.();
        }
        break;
      case INTENTS.DISABLE_HAND_TRACKER:
        if (acc.handTrackingEnabled) acc.toggleHandTracking?.();
        break;

      
      case INTENTS.SCROLL_UP: window.scrollBy({ top: -400, behavior: 'smooth' }); break;
      case INTENTS.SCROLL_DOWN: window.scrollBy({ top: 400, behavior: 'smooth' }); break;

      
      case INTENTS.SET_VISUAL_MODE: acc.setDisabilityType?.('visual'); break;
      case INTENTS.SET_HEARING_MODE: acc.setDisabilityType?.('hearing'); break;
      case INTENTS.SET_MOTOR_MODE: acc.setDisabilityType?.('motor'); break;
      case INTENTS.SET_COGNITIVE_MODE: acc.setDisabilityType?.('cognitive'); break;
      case INTENTS.RESET_DISABILITY_MODE: acc.setDisabilityType?.('none'); break;

      default: break;
    }
    onFeedbackRef.current?.(msg, 'success');
    speak(msg, feedbackLang === 'hi' ? 'hi-IN' : 'en-US');
  }, [navigate, setIsAwake]);

  const executeIntentRef = useRef(executeIntent);
  useEffect(() => { executeIntentRef.current = executeIntent; }, [executeIntent]);

  
  const startRecognition = useCallback(() => {
    if (!supported || permDenied || isRunning.current || !shouldBeRunning.current) {
      return;
    }

    console.log('[Voice] Initializing new session...');
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = langRef.current;

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
          
          if (shouldBeRunning.current && !isRunning.current && !window.speechSynthesis.speaking) {
            startRecognition();
          } else if (window.speechSynthesis.speaking) {
            
            let attempts = 0;
            const poll = setInterval(() => {
              attempts++;
              if (!window.speechSynthesis.speaking || attempts > 15) { 
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
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        
        setPermDenied(true);
        shouldBeRunning.current = false;
        isRunning.current = false;
        onListeningRef.current?.(false);
        onFeedbackRef.current?.('Mic permission denied. Please allow mic access.', 'error');
      } else if (e.error === 'no-speech' || e.error === 'network' || e.error === 'audio-capture') {
        
        console.log('[Voice] Non-fatal error, restarting...');
        isRunning.current = false;
      } else if (e.error === 'aborted') {
        
        isRunning.current = false;
      }
      
    };

    rec.onresult = (event) => {
      const results = Array.from(event.results);
      const latest = results[results.length - 1];
      const text = latest[0].transcript;
      const isInterim = !latest.isFinal;

      onTranscriptRef.current?.(text, isInterim);

      const now = Date.now();
      if (now - lastCommandAt.current < COMMAND_COOLDOWN) return;

      
      if (isInterim) {
        const intent = processCommand(text);
        if (!intent) return;

        if (intent === INTENTS.ENABLE_VOICE && !isAwakeRef.current) {
          lastCommandAt.current = now;
          executeIntentRef.current?.(intent, langRef.current);
        } else if (isAwakeRef.current) {
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
      } catch (e) { }
      recognitionRef.current = null;
    }
    isRunning.current = false;
    onListeningRef.current?.(false);
  }, []);

  
  useEffect(() => {
    if (enabled && supported && !permDenied) {
      startRecognition();
    } else {
      stopRecognition();
    }
    return () => stopRecognition();
  }, [enabled, supported, permDenied, startRecognition, stopRecognition]);

  
  
  useEffect(() => {
    const onSTTStart = () => {
      if (isRunning.current) {
        try { recognitionRef.current?.abort(); } catch (e) { }
        isRunning.current = false;
      }
    };
    const onSTTEnd = () => {
      if (shouldBeRunning.current && !isRunning.current && !permDenied) {
        setTimeout(() => startRecognition(), 400);
      }
    };
    window.addEventListener('equaled:stt-start', onSTTStart);
    window.addEventListener('equaled:stt-end', onSTTEnd);
    return () => {
      window.removeEventListener('equaled:stt-start', onSTTStart);
      window.removeEventListener('equaled:stt-end', onSTTEnd);
    };
  }, [startRecognition, permDenied]);

  return { supported, permDenied };
};
