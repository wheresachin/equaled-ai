import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Bot, ArrowLeft, Loader2, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── State constants ────────────────────────────────────────────────────────
const STATE = {
  IDLE:      'idle',
  LISTENING: 'listening',
  THINKING:  'thinking',
  SPEAKING:  'speaking',
};

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// ── Helper: speak text aloud ───────────────────────────────────────────────
const speakText = (text, onEnd) => {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang  = 'en-US';
  utterance.rate  = 1.15;
  utterance.pitch = 1.0;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
};

// ── Conversation bubble ────────────────────────────────────────────────────
const Bubble = ({ role, text }) => (
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
    <div
      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
        ${role === 'user'
          ? 'bg-indigo-600 text-white rounded-br-none'
          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
        }`}
    >
      {role === 'ai' && (
        <span className="flex items-center gap-1 text-xs text-indigo-500 font-semibold mb-1">
          <Bot size={12} /> AI Assistant
        </span>
      )}
      {text}
    </div>
  </div>
);

// ── Main page ──────────────────────────────────────────────────────────────
const TalkToAI = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appState, setAppState] = useState(STATE.IDLE);
  const [messages, setMessages]  = useState([]);
  const [interimText, setInterimText] = useState('');
  const [errorMsg, setErrorMsg]  = useState('');

  const recognitionRef = useRef(null);
  const chatEndRef     = useRef(null);
  const isListening    = useRef(false);

  // Redirect non-students
  useEffect(() => {
    if (user && user.role !== 'student') navigate('/dashboard');
  }, [user, navigate]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText]);

  // ── Send to Gemini via backend ───────────────────────────────────────────
  const askAI = useCallback(async (userMessage) => {
    setAppState(STATE.THINKING);
    setInterimText('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setErrorMsg('');

    try {
      const stored = localStorage.getItem('user');
      const token = stored ? JSON.parse(stored)?.token : null;

      const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      const reply = data.reply || 'Sorry, I could not understand that.';

      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
      setAppState(STATE.SPEAKING);

      speakText(reply, () => {
        // After AI finishes speaking, auto-restart listening
        setAppState(STATE.IDLE);
        startListening();
      });
    } catch (err) {
      console.error('[TalkToAI] Error:', err);
      setErrorMsg('Could not reach AI. Check your connection.');
      setAppState(STATE.IDLE);
    }
  }, []);

  // ── Start microphone ────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!SpeechRecognition || isListening.current) return;

    const rec = new SpeechRecognition();
    rec.lang           = 'en-US';
    rec.interimResults = true;
    rec.continuous     = false; // One utterance at a time

    rec.onstart = () => {
      isListening.current = true;
      setAppState(STATE.LISTENING);
      setErrorMsg('');
    };

    rec.onresult = (e) => {
      const results   = Array.from(e.results);
      const interim   = results.map(r => r[0].transcript).join('');
      const isFinal   = results[results.length - 1].isFinal;
      setInterimText(interim);
      if (isFinal && interim.trim()) {
        rec.stop();
        askAI(interim.trim());
      }
    };

    rec.onerror = (e) => {
      console.warn('[TalkToAI] Mic error:', e.error);
      isListening.current = false;
      if (e.error === 'not-allowed') {
        setErrorMsg('Microphone permission denied. Allow mic access in your browser.');
      }
      setAppState(STATE.IDLE);
    };

    rec.onend = () => {
      isListening.current = false;
    };

    recognitionRef.current = rec;
    rec.start();
  }, [askAI]);

  // ── Stop microphone ─────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    window.speechSynthesis.cancel();
    isListening.current = false;
    setAppState(STATE.IDLE);
    setInterimText('');
  }, []);

  // Start listening when page loads
  useEffect(() => {
    const t = setTimeout(() => startListening(), 600);
    return () => {
      clearTimeout(t);
      stopListening();
    };
  }, [startListening, stopListening]);

  // ── Handle mic button click ─────────────────────────────────────────────
  const handleMicClick = () => {
    if (appState === STATE.LISTENING) {
      stopListening();
    } else if (appState === STATE.IDLE) {
      startListening();
    }
  };

  // ── UI helpers ──────────────────────────────────────────────────────────
  const stateConfig = {
    [STATE.IDLE]:      { label: 'Tap mic to speak',   color: 'from-gray-400 to-gray-500',         ring: '' },
    [STATE.LISTENING]: { label: 'Listening...',        color: 'from-indigo-500 to-purple-600',     ring: 'ring-4 ring-indigo-300 ring-offset-4 animate-pulse' },
    [STATE.THINKING]:  { label: 'AI is thinking...',  color: 'from-amber-400 to-orange-500',      ring: 'ring-4 ring-amber-300 ring-offset-4' },
    [STATE.SPEAKING]:  { label: 'AI is speaking...',  color: 'from-green-500 to-emerald-600',     ring: 'ring-4 ring-green-300 ring-offset-4 animate-pulse' },
  };

  const cfg = stateConfig[appState];

  if (!SpeechRecognition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-center p-8">
          Your browser does not support voice. Please use Chrome or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <Bot size={18} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">AI Learning Assistant</h1>
            <p className="text-xs text-gray-400">Voice-only · Student exclusive</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            appState === STATE.LISTENING ? 'bg-indigo-500 animate-pulse' :
            appState === STATE.THINKING  ? 'bg-amber-500 animate-bounce' :
            appState === STATE.SPEAKING  ? 'bg-green-500 animate-pulse' :
            'bg-gray-300'
          }`} />
          <span className="text-xs text-gray-500 capitalize">{appState}</span>
        </div>
      </header>

      {/* Main area — mic centered, chat scrolls above */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Chat history — scrollable, only shown when messages exist */}
        {(messages.length > 0 || interimText || appState === STATE.THINKING || errorMsg) && (
          <div className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl w-full mx-auto">
            {messages.map((msg, i) => (
              <Bubble key={i} role={msg.role} text={msg.text} />
            ))}
            {interimText && (
              <div className="flex justify-end mb-3">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-none bg-indigo-100 text-indigo-600 text-sm italic border border-indigo-200">
                  🎤 {interimText}
                </div>
              </div>
            )}
            {appState === STATE.THINKING && (
              <div className="flex justify-start mb-3">
                <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-white border border-gray-100 shadow-sm flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin text-indigo-500" />
                  Thinking...
                </div>
              </div>
            )}
            {errorMsg && (
              <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl text-center my-2">{errorMsg}</p>
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* ── MIC — always centered in remaining space ── */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 py-8">

          {/* Welcome text when no conversation yet */}
          {messages.length === 0 && !interimText && appState !== STATE.THINKING && (
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-700">Hello, {user?.name?.split(' ')[0]}! 👋</h2>
              <p className="text-gray-400 text-sm mt-1">Tap the mic and ask me anything</p>
            </div>
          )}

          {/* State label */}
          <p className="text-sm font-semibold tracking-wide h-5 text-center
            text-gray-500">
            {cfg.label}
          </p>

          {/* Mic Button */}
          <div className="relative flex items-center justify-center">
            {/* Outer glow */}
            {(appState === STATE.LISTENING || appState === STATE.SPEAKING) && (
              <span className={`absolute w-40 h-40 rounded-full animate-ping opacity-15
                ${appState === STATE.LISTENING ? 'bg-indigo-400' : 'bg-green-400'}`}
              />
            )}
            {/* Middle ring */}
            {(appState === STATE.LISTENING || appState === STATE.SPEAKING) && (
              <span className={`absolute w-32 h-32 rounded-full border-4 animate-pulse opacity-25
                ${appState === STATE.LISTENING ? 'border-indigo-400' : 'border-green-400'}`}
              />
            )}

            <button
              onClick={handleMicClick}
              disabled={appState === STATE.THINKING || appState === STATE.SPEAKING}
              className={`
                relative w-28 h-28 rounded-full flex items-center justify-center z-10
                bg-gradient-to-br ${cfg.color}
                text-white shadow-2xl transition-all duration-300
                disabled:opacity-60 disabled:cursor-not-allowed
                hover:scale-105 active:scale-95
              `}
              aria-label={appState === STATE.LISTENING ? 'Stop listening' : 'Start listening'}
            >
              {appState === STATE.THINKING ? (
                <Loader2 size={44} className="animate-spin" />
              ) : appState === STATE.SPEAKING ? (
                <Volume2 size={44} className="animate-pulse" />
              ) : (
                <Mic size={44} />
              )}
            </button>
          </div>

          {/* Sub-label */}
          <p className="text-xs text-gray-400 h-4 text-center">
            {appState === STATE.IDLE      ? 'Tap the mic and speak' : ''}
            {appState === STATE.LISTENING ? 'Listening — tap to cancel' : ''}
            {appState === STATE.THINKING  ? 'Please wait...' : ''}
            {appState === STATE.SPEAKING  ? 'Auto-listening after response...' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TalkToAI;
