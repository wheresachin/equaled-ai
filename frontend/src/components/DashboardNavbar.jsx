import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Sun, Moon, Type, Menu } from 'lucide-react';

const DashboardNavbar = ({ onMenuClick }) => {
  const { 
    highContrast, toggleContrast, 
    increaseFont
  } = useAccessibility();

  return (
    <nav className="fixed w-full bg-white border-b border-gray-100 z-50 px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center high-contrast:bg-black high-contrast:border-yellow-400">
        <div className="flex items-center gap-4">
             {/* Mobile Menu Trigger (if needed) */}
            <button 
                onClick={onMenuClick}
                className="md:hidden text-gray-500 hover:text-blue-600 high-contrast:text-yellow-400"
            >
                <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 hidden md:block high-contrast:text-yellow-400">EqualEd Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full high-contrast:bg-gray-800">
              <button 
                onClick={toggleContrast} 
                className="p-2 hover:bg-white rounded-full transition-all high-contrast:text-yellow-400"
                aria-label="Toggle High Contrast"
              >
                {highContrast ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={increaseFont} 
                className="p-2 hover:bg-white rounded-full transition-all high-contrast:text-yellow-400"
                aria-label="Increase Font Size"
              >
                <Type size={18} />
              </button>
            </div>
        </div>
    </nav>
  );
};

export default DashboardNavbar;
