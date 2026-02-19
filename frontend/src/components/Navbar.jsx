import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { Sun, Moon, Type, Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { 
    highContrast, toggleContrast, 
    increaseFont
  } = useAccessibility();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '#about' },
    { name: 'Features', path: '#features' },
    { name: 'How It Works', path: '#how-it-works' },
    { name: 'Contact', path: '#contact' },
  ];

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50 high-contrast:bg-black high-contrast:border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg high-contrast:bg-yellow-400">
              <span className="text-white font-bold text-xl high-contrast:text-black">Eq</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 high-contrast:text-yellow-400">EqualEd</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.path} 
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors high-contrast:text-white high-contrast:hover:text-yellow-400"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
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
            
            <Link to="/login" className="text-gray-700 font-medium hover:text-blue-600 high-contrast:text-white high-contrast:hover:text-yellow-400">
              Login
            </Link>
            <Link 
              to="/signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 high-contrast:bg-yellow-400 high-contrast:text-black"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 high-contrast:text-yellow-400"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full high-contrast:bg-black high-contrast:border-gray-800">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 high-contrast:text-white high-contrast:hover:text-yellow-400 high-contrast:hover:bg-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
               <div className="flex items-center gap-4 justify-center py-2">
                  <button onClick={toggleContrast} className="flex items-center gap-2 text-gray-600 high-contrast:text-yellow-400">
                    {highContrast ? <Sun size={20} /> : <Moon size={20} />} 
                    <span>Contrast</span>
                  </button>
                  <button onClick={increaseFont} className="flex items-center gap-2 text-gray-600 high-contrast:text-yellow-400">
                    <Type size={20} />
                    <span>Font Size</span>
                  </button>
               </div>
               <Link 
                to="/login"
                className="block w-full text-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 high-contrast:text-white high-contrast:border-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/signup"
                className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 high-contrast:bg-yellow-400 high-contrast:text-black"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
