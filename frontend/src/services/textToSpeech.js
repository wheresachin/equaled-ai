let _cachedVoices = [];

const loadVoices = () =>
  new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      _cachedVoices = voices;
      return resolve(voices);
    }
    
    const handler = () => {
      _cachedVoices = window.speechSynthesis.getVoices();
      resolve(_cachedVoices);
    };
    window.speechSynthesis.onvoiceschanged = handler;
    
    setTimeout(() => {
      if (_cachedVoices.length === 0) {
        _cachedVoices = window.speechSynthesis.getVoices();
        resolve(_cachedVoices);
      }
    }, 2000);
  });

const pickVoice = (voices, lang) => {
  if (lang.startsWith('hi')) {
    const hindi = voices.filter(v => v.lang.startsWith('hi'));
    return (
      hindi.find(v =>
        ['male', 'rishi', 'amit'].some(k => v.name.toLowerCase().includes(k))
      ) || hindi[0] || null
    );
  }
  const english = voices.filter(v => v.lang.startsWith('en'));
  return (
    english.find(v =>
      ['david', 'mark', 'guy', 'brian', 'daniel', 'male'].some(k =>
        v.name.toLowerCase().includes(k)
      )
    ) || english[0] || null
  );
};

export const speak = async (text, lang = 'en-US') => {
  if (!window.speechSynthesis || !text) return;

  
  window.speechSynthesis.cancel();

  try {
    
    const voices = _cachedVoices.length > 0 ? _cachedVoices : await loadVoices();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.92;
    utterance.pitch = 0.95;
    utterance.volume = 1.0;

    const voice = pickVoice(voices, lang);
    if (voice) utterance.voice = voice;

    
    const keepAlive = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(keepAlive);
        return;
      }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 10000);

    utterance.onend = () => clearInterval(keepAlive);
    utterance.onerror = () => clearInterval(keepAlive);

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[TTS] speak error:', err);
  }
};

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
}

export const isTTSSupported = () => !!window.speechSynthesis;
