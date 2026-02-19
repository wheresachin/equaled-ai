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
  utterance.rate = 1.0; // Normal speed
  utterance.pitch = 1.0;

  // Enhance Hindi voice selection if available
  if (lang.startsWith('hi')) {
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('Hindi'));
    if (hindiVoice) utterance.voice = hindiVoice;
    // Fallback: Some browsers might use Google Hindi
  }

  window.speechSynthesis.speak(utterance);
};

// Check if TTS is supported
export const isTTSSupported = () => !!window.speechSynthesis;
