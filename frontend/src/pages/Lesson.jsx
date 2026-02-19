import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Square, ArrowLeft, Mic } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useSpeechToText } from '../hooks/useSpeechToText';

const Lesson = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    // Mock Content
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
        // Read full text
        const fullText = lessonContent.paragraphs.join(' ');
        speak(fullText);
    };

    // Effect to handle voice answer
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

    return (
        <div className={`max-w-4xl mx-auto pb-20 ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`}>
            <button 
                onClick={() => navigate('/dashboard')}
                className={`mb-6 flex items-center gap-2 font-bold ${highContrast ? 'text-yellow-400' : 'text-blue-600'}`}
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <h1 className={`text-4xl font-extrabold mb-8 ${highContrast ? 'text-white' : 'text-gray-900'}`}>{lessonContent.title}</h1>

            {/* Accessibility / Playback Controls */}
            <div className={`sticky top-4 z-40 p-4 rounded-2xl shadow-lg mb-8 flex items-center gap-4 transition-colors ${
                highContrast ? 'bg-gray-900 border border-yellow-400' : 'bg-white border border-gray-100'
            }`}>
                <button 
                    onClick={isSpeaking ? pause : handleReadAloud}
                    className={`p-3 rounded-full flex items-center justify-center transition-all ${
                        isSpeaking 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : highContrast ? 'bg-yellow-400 text-black' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {isSpeaking ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button 
                    onClick={stop}
                    className={`p-3 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors ${highContrast ? 'text-red-400' : 'text-gray-500'}`}
                >
                    <Square size={20} />
                </button>
                <span className={`font-medium ${highContrast ? 'text-gray-300' : 'text-gray-500'}`}>
                    {isSpeaking ? 'Reading aloud...' : 'Click play to listen'}
                </span>
            </div>

            {/* Content Display */}
            <div className="space-y-6">
                {lessonContent.paragraphs.map((para, index) => (
                    <p 
                        key={index}
                        onClick={() => handleFocusParagraph(index)}
                        style={{ fontSize: `${fontSize}px` }}
                        className={`p-6 rounded-xl transition-all cursor-pointer leading-relaxed ${
                            focusMode && activeParagraph === index
                                ? highContrast ? 'bg-yellow-900 ring-2 ring-yellow-400' : 'bg-blue-50 ring-2 ring-blue-400 shadow-lg scale-105'
                                : focusMode 
                                    ? 'opacity-30 blur-[1px]' 
                                    : highContrast ? 'hover:bg-gray-900' : 'hover:bg-gray-50'
                        }`}
                    >
                        {para}
                    </p>
                ))}
            </div>

            {/* Interactive Section */}
            <div className={`mt-12 p-8 rounded-3xl ${
                highContrast ? 'bg-gray-900 border border-yellow-400' : 'bg-gradient-to-br from-blue-50 to-indigo-50'
            }`}>
                <h3 className={`text-2xl font-bold mb-4 ${highContrast ? 'text-yellow-400' : 'text-blue-900'}`}>Quick Check</h3>
                <p className={`mb-4 text-lg ${highContrast ? 'text-white' : 'text-gray-700'}`}>{lessonContent.question}</p>
                
                <div className="relative">
                    <textarea 
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type or speak your answer..."
                        className={`w-full p-4 rounded-xl border focus:ring-2 outline-none resize-none h-32 text-lg ${
                            highContrast 
                                ? 'bg-black border-gray-700 text-yellow-400 focus:ring-yellow-400' 
                                : 'bg-white border-gray-200 focus:ring-blue-400'
                        }`}
                    />
                    <button 
                        onMouseDown={startSTT}
                        onMouseUp={stopSTT}
                        // Touch events for mobile
                        onTouchStart={startSTT}
                        onTouchEnd={stopSTT}
                        className={`absolute bottom-4 right-4 p-3 rounded-full transition-all ${
                            isListening 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : highContrast ? 'bg-yellow-400 text-black' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                        title="Hold to Speak"
                    >
                        <Mic size={24} />
                    </button>
                </div>
                {isListening && <p className="mt-2 text-sm text-blue-600 animate-pulse font-medium">Listening...</p>}
            </div>
        </div>
    );
};

export default Lesson;
