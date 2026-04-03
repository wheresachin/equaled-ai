import { useState, useEffect, useRef } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [appVoices, setAppVoices] = useState([]);
  const synthesisRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const updateVoices = () => {
      setAppVoices(synthesisRef.current.getVoices());
    };
    
    // Initial load
    updateVoices();
    
    // Event listener for when voices change (browsers load them async)
    synthesisRef.current.onvoiceschanged = updateVoices;

    return () => {
      synthesisRef.current.cancel();
    };
  }, []);

  const speak = (text) => {
    if (synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        setIsSpeaking(false);
    };

    // Try to pick a good voice
    const preferredVoice = appVoices.find(voice => voice.name.includes("Google US English") || voice.name.includes("Samantha"));
    if (preferredVoice) utterance.voice = preferredVoice;

    utteranceRef.current = utterance;
    synthesisRef.current.speak(utterance);
  };

  const stop = () => {
    synthesisRef.current.cancel();
    setIsSpeaking(false);
  };

  const pause = () => {
    synthesisRef.current.pause();
    setIsSpeaking(false); 
  };
  
  const resume = () => {
      synthesisRef.current.resume();
      setIsSpeaking(true);
  }

  return { speak, stop, pause, resume, isSpeaking, voices: appVoices };
};
