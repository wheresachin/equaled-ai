import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, Star } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { highContrast } = useAccessibility();

    const lessons = [
        { id: 1, title: "Introduction to Biology", desc: "Learn the basics of life.", time: "10 min", level: "Beginner", color: "bg-green-100 text-green-700" },
        { id: 2, title: "World History: The Romans", desc: "Explore the ancient empire.", time: "15 min", level: "Intermediate", color: "bg-orange-100 text-orange-700" },
        { id: 3, title: "Physics: Motion", desc: "Understanding laws of motion.", time: "20 min", level: "Advanced", color: "bg-purple-100 text-purple-700" },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 high-contrast:text-yellow-400">Your Learning Path</h1>
            
            <div className="grid md:grid-cols-2 gap-6">
                {lessons.map((lesson) => (
                    <div 
                        key={lesson.id}
                        onClick={() => navigate(`/lesson/${lesson.id}`)}
                        className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden high-contrast:bg-gray-900 high-contrast:border-yellow-400"
                    >
                        <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl ${lesson.color} text-xs font-bold uppercase tracking-wider high-contrast:bg-yellow-400 high-contrast:text-black`}>
                            {lesson.level}
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors high-contrast:text-white high-contrast:group-hover:text-yellow-400">
                            {lesson.title}
                        </h2>
                        <p className="text-gray-500 mb-6 high-contrast:text-gray-300">{lesson.desc}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 font-medium high-contrast:text-gray-400">
                            <span className="flex items-center gap-1"><Clock size={16} /> {lesson.time}</span>
                            <span className="flex items-center gap-1"><Star size={16} /> 4.8</span>
                        </div>

                        <button className="mt-6 w-full py-3 bg-gray-50 rounded-xl text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center gap-2 high-contrast:bg-gray-800 high-contrast:text-yellow-400 high-contrast:group-hover:bg-yellow-400 high-contrast:group-hover:text-black">
                            Start Lesson <Play size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
