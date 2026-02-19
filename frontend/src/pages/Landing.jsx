import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mic, Eye, Globe } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

const Landing = () => {
    const navigate = useNavigate();
    const { highContrast } = useAccessibility();

    return (
        <div className="max-w-6xl mx-auto pt-10 px-4">
            <header className="text-center mb-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="inline-block p-2 px-4 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6 high-contrast:bg-yellow-400 high-contrast:text-black">
                    ✨ AI-Powered Inclusive Learning
                </div>
                <h1 className="text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                    Equal Learning. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 high-contrast:text-yellow-400 high-contrast:bg-none">
                        Equal Opportunity.
                    </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 high-contrast:text-white">
                    A revolutionary platform adapting to every student's needs. 
                    Visual, hearing, motor, or cognitive — we bridge the gap.
                </p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto high-contrast:bg-yellow-400 high-contrast:text-black"
                >
                    Start Learning Now <ArrowRight size={20} />
                </button>
            </header>

            <div className="grid md:grid-cols-3 gap-8 mb-20 text-center">
                {[
                    { icon: Mic, title: "Voice Control", desc: "Navigate entirely by voice commands." },
                    { icon: Eye, title: "Eye Tracking", desc: "Hands-free control for motor disabilities." },
                    { icon: Globe, title: "Adaptive UI", desc: "Interface that morphs to your needs." }
                ].map((feature, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 high-contrast:bg-gray-900 high-contrast:border-yellow-400">
                        <div className="w-14 h-14 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 high-contrast:bg-yellow-400 high-contrast:text-black">
                            <feature.icon size={28} />
                        </div>
                        <h3 className="text-xl font-bold mb-3 high-contrast:text-yellow-400">{feature.title}</h3>
                        <p className="text-gray-500 high-contrast:text-gray-300">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Landing;
