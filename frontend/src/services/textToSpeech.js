/**
 * textToSpeech.js
 *
 * Provides cross-browser Text-to-Speech (TTS) capabilities.
 * Supports English and Hindi voices.
 */

// Speak the given text in the specified language
export const speak = (text, lang = 'en-US') => {
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Slower, more natural speed
  utterance.pitch = 0.9; // Slightly lower pitch for a male tone
  
  const voices = window.speechSynthesis.getVoices();

  if (lang.startsWith('hi')) {
    // Attempt to find a Hindi male voice (heuristics based on common names)
    const hindiVoices = voices.filter(v => v.lang.includes('hi') || v.lang.includes('Hindi'));
    let selectedVoice = hindiVoices.find(v => 
      v.name.toLowerCase().includes('male') || 
      v.name.toLowerCase().includes('rishi') || 
      v.name.toLowerCase().includes('amit')
    ) || hindiVoices[0]; // fallback to first Hindi voice if male not found
    
    if (selectedVoice) utterance.voice = selectedVoice;
  } else {
    // Attempt to find an English male voice
    const engVoices = voices.filter(v => v.lang.includes('en'));
    let selectedVoice = engVoices.find(v => 
      v.name.toLowerCase().includes('male') || 
      v.name.toLowerCase().includes('david') || 
      v.name.toLowerCase().includes('mark') ||
      v.name.toLowerCase().includes('guy') ||
      v.name.toLowerCase().includes('brian') ||
      v.name.toLowerCase().includes('daniel')
    ) || engVoices[0]; // fallback to first English voice if male not found
    
    if (selectedVoice) utterance.voice = selectedVoice;
  }

  window.speechSynthesis.speak(utterance);
};

// Check if TTS is supported
export const isTTSSupported = () => !!window.speechSynthesis;
