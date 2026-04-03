import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Square, ArrowLeft, Mic, Send, CheckCircle2, XCircle, Loader2, Award, ArrowRight } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useToast } from '../context/ToastContext';
import API_BASE from '../utils/api';

const Lesson = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const { 
        highContrast, fontSize, focusMode, 
        disabilityType 
    } = useAccessibility();
    const { speak, stop, pause, resume, isSpeaking } = useTextToSpeech();
    const { 
        isListening, 
        transcript, 
        startListening: startSTT, 
        stopListening: stopSTT,
        resetTranscript 
    } = useSpeechToText();

    const [activeParagraph, setActiveParagraph] = useState(-1);
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);

    // Mock Content (In a real app, this would come from an API)
    const lessonContent = {
        title: "Introduction to Biology",
        paragraphs: [
            "Biology is the scientific study of life. It is a natural science with a broad scope but has several unifying themes that tie it together as a single, coherent field.",
            "For instance, all organisms are made up of cells that process hereditary information encoded in genes, which can be transmitted to future generations.",
            "Another major theme is evolution, which explains the unity and diversity of life. Energy processing is also important to life as it allows organisms to move, grow, and reproduce.",
            "Finally, all organisms are able to regulate their own internal environments."
        ],
        question: "What is the basic unit of life mentioned in the text?"
    };

    // Handle TTS reading and highlighting
    const handleReadAloud = () => {
        stop();
        const fullText = lessonContent.paragraphs.join(' ');
        speak(fullText);
    };

    // Update answer text as student speaks
    useEffect(() => {
        if (transcript) {
            setAnswer(transcript);
        }
    }, [transcript]);

    const handleFocusParagraph = (index) => {
        setActiveParagraph(index);
        stop();
        speak(lessonContent.paragraphs[index]);
    };

    const updateDBProgress = async () => {
      try {
        await fetch(`${API_BASE}/api/progress`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
          body: JSON.stringify({ 
            lessonId: id || "65d1a123f1a2b3c4d5e6f7a8", // Fallback for demo if id is missing
            isCompleted: true,
            timeSpent: 5 // mock 5 mins spent
          }),
        });
      } catch (err) {
        console.error("Progress sync failed:", err);
      }
    };

    const handleAnswerSubmit = async () => {
        if (!answer.trim()) {
            showToast("Please enter an answer first", "info");
            return;
        }

        setIsSubmitting(true);
        setFeedback(null);

        try {
            const prompt = `
                I am a student learning about: ${lessonContent.title}.
                The text says: "${lessonContent.paragraphs.join(' ')}"
                The question is: "${lessonContent.question}"
                My answer is: "${answer}"
                
                Please evaluate my answer. If it is correct, say 'CORRECT' first, then give a short one-sentence explanation. 
                If it is wrong, say 'INCORRECT' first, then give a hint.
            `;

            const res = await fetch(`${API_BASE}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt }),
            });

            const data = await res.json();
            
            if (res.ok) {
                const aiResponse = data.response || "";
                const isCorrect = aiResponse.toUpperCase().includes('CORRECT') && !aiResponse.toUpperCase().includes('INCORRECT');
                
                setFeedback({
                    correct: isCorrect,
                    message: aiResponse.replace(/CORRECT|INCORRECT/gi, '').trim()
                });

                if (isCorrect) {
                  setIsCompleted(true);
                  showToast("Perfect! Lesson goal achieved.", "success");
                  await updateDBProgress();
                } else {
                  showToast("Give it another try! Check the hint.", "info");
                }
            } else {
                throw new Error("AI failed");
            }
        } catch (err) {
            console.error("Evaluation error:", err);
            const isCorrect = answer.toLowerCase().includes('cell');
            setFeedback({
                correct: isCorrect,
                message: isCorrect ? "Excellent! Cells are indeed the basic unit of life." : "Try looking for the word 'cells' in the first or second paragraph."
            });
            if (isCorrect) setIsCompleted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`max-w-4xl mx-auto pb-20 px-4 sm:px-0 ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`}>
            <button 
                onClick={() => navigate('/dashboard')}
                className={`mb-6 mt-8 flex items-center gap-2 font-bold hover:gap-3 transition-all ${highContrast ? 'text-yellow-400' : 'text-blue-600'}`}
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <h1 className={`text-3xl sm:text-4xl font-extrabold mb-8 ${highContrast ? 'text-white' : 'text-gray-900'}`}>{lessonContent.title}</h1>

            {/* Accessibility / Playback Controls */}
            <div className={`sticky top-20 z-40 p-4 rounded-2xl shadow-xl border mb-8 flex items-center gap-4 transition-all duration-300 ${
                highContrast ? 'bg-gray-900 border-yellow-400' : 'bg-white border-gray-100 hover:shadow-2xl'
            }`}>
                <button 
                    onClick={isSpeaking ? pause : handleReadAloud}
                    className={`p-3 rounded-full flex items-center justify-center transition-all transform active:scale-90 ${
                        isSpeaking 
                        ? 'bg-yellow-100 text-yellow-700 ring-4 ring-yellow-50' 
                        : highContrast ? 'bg-yellow-400 text-black' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    }`}
                >
                    {isSpeaking ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button 
                    onClick={stop}
                    className={`p-3 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors ${highContrast ? 'text-red-400' : 'text-gray-400'}`}
                >
                    <Square size={20} />
                </button>
                <div className="flex flex-col">
                  <span className={`text-sm font-bold uppercase tracking-wider ${highContrast ? 'text-gray-400' : 'text-gray-400'}`}>
                    Audio Guide
                  </span>
                  <span className={`font-medium ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                      {isSpeaking ? 'Reading aloud...' : 'Click play to listen to lesson'}
                  </span>
                </div>
            </div>

            {/* Content Display */}
            <div className="space-y-6">
                {lessonContent.paragraphs.map((para, index) => (
                    <p 
                        key={index}
                        onClick={() => handleFocusParagraph(index)}
                        style={{ fontSize: `${fontSize}px` }}
                        className={`p-6 rounded-2xl transition-all cursor-pointer leading-relaxed border border-transparent ${
                            focusMode && activeParagraph === index
                                ? highContrast ? 'bg-gray-800 border-yellow-400 shadow-xl' : 'bg-blue-50 border-blue-200 shadow-xl scale-[1.02]'
                                : focusMode 
                                    ? 'opacity-20 blur-[2px] pointer-events-none' 
                                    : highContrast ? 'hover:bg-gray-900 hover:border-gray-700' : 'hover:bg-gray-50 hover:border-gray-100 border-white shadow-sm'
                        }`}
                    >
                        {para}
                    </p>
                ))}
            </div>

            {/* Interactive Section */}
            <div id="quick-check" className={`mt-8 p-6 rounded-[1.5rem] shadow-xl border transition-all duration-500 transform ${
                isCompleted ? 'scale-[1.01] border-green-400 ring-2 ring-green-50' : ''
            } ${
                highContrast 
                  ? 'bg-gray-900 border-yellow-400' 
                  : 'bg-white border-blue-50'
            }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${highContrast ? 'bg-yellow-400 text-black' : isCompleted ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
                      {isCompleted ? <Award size={18} /> : <Mic size={18} />}
                    </div>
                    <h3 className={`text-xl font-bold ${highContrast ? 'text-yellow-400' : 'text-gray-900'}`}>
                      {isCompleted ? "Goal Completed!" : "Quick Check"}
                    </h3>
                  </div>
                  {isCompleted && (
                    <span className="bg-green-100 text-green-700 px-3 py-0.5 rounded-full font-bold text-xs uppercase">100 Points</span>
                  )}
                </div>

                {!isCompleted ? (
                  <>
                    <p className={`mb-4 text-lg font-medium leading-snug ${highContrast ? 'text-white' : 'text-gray-700'}`}>{lessonContent.question}</p>
                    
                    <div className="relative mb-4">
                        <textarea 
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Type or hold the mic..."
                            className={`w-full p-4 pb-14 rounded-[1.2rem] border-2 focus:ring-2 outline-none resize-none h-32 text-base transition-all duration-300 ${
                                highContrast 
                                    ? 'bg-black border-gray-700 text-yellow-400 focus:border-yellow-400 focus:ring-yellow-400/20' 
                                    : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-blue-400 focus:ring-blue-50'
                            }`}
                        />
                        
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                          <button 
                              onMouseDown={startSTT}
                              onMouseUp={stopSTT}
                              onTouchStart={startSTT}
                              onTouchEnd={stopSTT}
                              className={`p-3 rounded-xl transition-all transform active:scale-95 flex items-center gap-2 font-bold shadow-md ${
                                  isListening 
                                      ? 'bg-red-500 text-white animate-pulse scale-105' 
                                      : highContrast ? 'bg-yellow-400 text-black' : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                              title="Hold to Speak"
                          >
                              <Mic size={20} />
                              {isListening && <span className="text-xs">Listening...</span>}
                          </button>
                        </div>

                        <button 
                          onClick={resetTranscript}
                          className="absolute bottom-3 left-4 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Clear
                        </button>
                    </div>

                    {feedback && !feedback.correct && (
                      <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-400 border ${
                        highContrast ? 'bg-red-900/30 border-red-500 text-white' : 'bg-red-50 border-red-100 text-red-800'
                      }`}>
                        <XCircle size={18} className="mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm mb-0.5">Not quite right</p>
                          <p className="text-xs leading-relaxed opacity-90">{feedback.message}</p>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={handleAnswerSubmit}
                      disabled={isSubmitting || !answer.trim()}
                      className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 ${
                        highContrast 
                          ? 'bg-yellow-400 text-black' 
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      {isSubmitting ? (
                        <><Loader2 size={18} className="animate-spin" /> Checking...</>
                      ) : (
                        <><Send size={18} /> Submit Answer</>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4 space-y-4 animate-in zoom-in duration-500">
                    <div className="flex justify-center">
                      <div className={`p-4 rounded-full ${highContrast ? 'bg-yellow-400 text-black' : 'bg-green-100 text-green-600 ring-4 ring-green-50'}`}>
                        <CheckCircle2 size={40} />
                      </div>
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold mb-1 ${highContrast ? 'text-white' : 'text-gray-900'}`}>Great Work!</h4>
                      <p className={`max-w-md mx-auto text-sm leading-relaxed ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feedback?.message || "You've correctly identified the concepts."}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <button 
                        onClick={() => { setIsCompleted(false); setAnswer(''); setFeedback(null); }}
                        className={`px-6 py-2.5 rounded-xl font-bold border-2 text-sm transition-all ${
                          highContrast ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Retry Check
                      </button>
                      <button 
                        onClick={() => navigate('/dashboard')}
                        className={`px-8 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                          highContrast ? 'bg-yellow-400 text-black' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                        }`}
                      >
                        Next Lesson <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
            </div>
        </div>
    );
};

export default Lesson;
