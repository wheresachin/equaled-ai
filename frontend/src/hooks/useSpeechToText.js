import { useState, useRef, useCallback } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechToText = ({ lang = 'hi-IN' } = {}) => {
  const [isListening, setIsListening]   = useState(false);
  const [transcript, setTranscript]     = useState('');
  const [supported]                     = useState(() => !!SpeechRecognition);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (!supported || isListening) return;

    // ── Pause global voice assistant so mic doesn't conflict ──
    window.dispatchEvent(new CustomEvent('equaled:stt-start'));

    const rec = new SpeechRecognition();
    rec.continuous      = false;   // Single answer capture
    rec.interimResults  = true;
    rec.lang            = lang;

    rec.onstart  = () => setIsListening(true);
    rec.onend    = () => {
      setIsListening(false);
      recognitionRef.current = null;
      // Resume global voice assistant
      window.dispatchEvent(new CustomEvent('equaled:stt-end'));
    };
    rec.onerror  = (e) => {
      console.error('[STT] Error:', e.error);
      setIsListening(false);
      window.dispatchEvent(new CustomEvent('equaled:stt-end'));
    };
    rec.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final   += event.results[i][0].transcript;
        else                          interim += event.results[i][0].transcript;
      }
      if (final)   setTranscript(prev => (prev + ' ' + final).trim());
      else if (interim) setTranscript(prev => prev); // keep existing
    };

    try {
      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      console.error('[STT] Start failed:', e);
      window.dispatchEvent(new CustomEvent('equaled:stt-end'));
    }
  }, [supported, isListening, lang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  }, []);

  const resetTranscript = useCallback(() => setTranscript(''), []);

  return { isListening, transcript, startListening, stopListening, resetTranscript, supported };
};
